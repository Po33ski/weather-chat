from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent_system.src.utils.load_env_data import load_env_data, get_environment_info
import agent_system.src.multi_tool_agent.agent as agent_module
from agent_system.src.multi_tool_agent.agent import root_agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types
import asyncio
import os
from datetime import datetime

from .models import (
    CurrentWeatherRequest, ForecastWeatherRequest, HistoryWeatherRequest,
    CurrentWeatherResponse, ForecastWeatherResponse, HistoryWeatherResponse
)
from .weather_service import WeatherService

# Load environment variables (if needed)
load_env_data()

app = FastAPI(
    title="Weather Center Chat API",
    description="A comprehensive weather and AI chat application API",
    version="1.0.0"
)

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    conversation_history: list

class ChatResponse(BaseModel):
    message: str
    sender: str = "ai"

@app.get("/health")
def health():
    """
    Health check endpoint that verifies the application is running and environment is properly configured.
    """
    try:
        env_info = get_environment_info()
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "environment": env_info,
            "services": {
                "api": "running",
                "weather_service": "available" if env_info["has_visual_crossing_api_key"] else "unavailable",
                "ai_chat": "available" if env_info["has_google_api_key"] else "unavailable"
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@app.get("/")
def root():
    """
    Root endpoint with basic API information.
    """
    return {
        "message": "Weather Center Chat API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Check if Google API key is available
        if not os.getenv("GOOGLE_API_KEY"):
            return ChatResponse(
                message="AI chat is not available. Please set the GOOGLE_API_KEY environment variable."
            )
        
        user_message = request.message
        session_service = InMemorySessionService()
        # The create_session method is async in this version of Google ADK
        session = await session_service.create_session(app_name="weather_center", user_id="user")  # type: ignore
        runner = Runner(agent=agent_module.root_agent, app_name="weather_center", session_service=session_service)
        content = types.Content(role='user', parts=[types.Part(text=user_message)])
        events = runner.run_async(user_id="user", session_id=session.id, new_message=content)
        async for event in events:
            if event.is_final_response():
                text = event.content.parts[0].text if event.content and event.content.parts else "[Agent error] No response content"
                return ChatResponse(message=text or "[Agent error] No response content")
        return ChatResponse(message="[Agent error] No response from agent.")
    except Exception as e:
        print(f"Chat endpoint error: {str(e)}")
        return ChatResponse(message=f"Error: {str(e)}")

# --- Weather API Endpoints ---
weather_service = WeatherService()

@app.post("/api/weather/current", response_model=CurrentWeatherResponse)
def get_current_weather(request: CurrentWeatherRequest):
    try:
        data = weather_service.get_current_weather(request.location)
        return CurrentWeatherResponse(success=True, data=data)
    except Exception as e:
        return CurrentWeatherResponse(success=False, error=str(e))

@app.post("/api/weather/forecast", response_model=ForecastWeatherResponse)
def get_forecast_weather(request: ForecastWeatherRequest):
    try:
        data = weather_service.get_forecast_weather(request.location, request.days)
        return ForecastWeatherResponse(success=True, data=data)
    except Exception as e:
        return ForecastWeatherResponse(success=False, error=str(e))

@app.post("/api/weather/history", response_model=HistoryWeatherResponse)
def get_history_weather(request: HistoryWeatherRequest):
    try:
        data = weather_service.get_history_weather(request.location, request.start_date, request.end_date)
        return HistoryWeatherResponse(success=True, data=data)
    except Exception as e:
        return HistoryWeatherResponse(success=False, error=str(e)) 