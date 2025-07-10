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
import json
from datetime import datetime
from typing import Optional

from .models import (
    CurrentWeatherRequest, ForecastWeatherRequest, HistoryWeatherRequest,
    CurrentWeatherResponse, ForecastWeatherResponse, HistoryWeatherResponse,
    AuthResponse, LogoutRequest, SessionInfo, GoogleAuthRequest,
    ChatResponse, ChatCurrentWeatherResponse, ChatForecastWeatherResponse, ChatHistoryWeatherResponse
)
from .weather_service import WeatherService
from .auth_service import auth_service

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
    session_id: Optional[str] = None

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

# --- Authentication Endpoints ---

@app.post("/api/auth/google", response_model=AuthResponse)
async def google_auth_endpoint(request: GoogleAuthRequest):
    """Authenticate with Google OAuth"""
    return await auth_service.authenticate_with_google(request)

@app.post("/api/auth/logout", response_model=AuthResponse)
async def logout_endpoint(request: LogoutRequest):
    """Logout user"""
    return await auth_service.logout_user(request.session_id)

@app.get("/api/auth/session/{session_id}", response_model=SessionInfo)
async def get_session_info(session_id: str):
    """Get session information"""
    session_info = auth_service.get_session_info(session_id)
    if not session_info:
        return {"error": "Session not found or inactive"}
    return session_info

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Check if Google API key is available
        if not os.getenv("GOOGLE_API_KEY"):
            return ChatResponse(
                message="AI chat is not available. Please set the GOOGLE_API_KEY environment variable."
            )
        
        # Validate session if provided
        user_id = "anonymous"
        adk_session_id = None
        if request.session_id:
            if not auth_service.validate_session(request.session_id):
                return ChatResponse(
                    message="Invalid or expired session. Please login again."
                )
            user_data = auth_service.get_user_from_session(request.session_id)
            if user_data:
                user_id = user_data["user_id"]
                adk_session_id = user_data.get("adk_session_id")
                auth_service.update_session_activity(request.session_id)
        
        user_message = request.message
        session_service = InMemorySessionService()
        
        # Use existing ADK session if available, otherwise create new one
        if adk_session_id:
            # Try to use existing session
            try:
                # For now, we'll create a new session each time since we don't have a way to retrieve existing sessions
                session = session_service.create_session(app_name="weather_center", user_id=user_id)
            except Exception:
                # Fallback to creating new session
                session = session_service.create_session(app_name="weather_center", user_id=user_id)
        else:
            # Create new session
            session = session_service.create_session(app_name="weather_center", user_id=user_id)
        
        runner = Runner(agent=agent_module.root_agent, app_name="weather_center", session_service=session_service)
        content = types.Content(role='user', parts=[types.Part(text=user_message)])
        events = runner.run_async(user_id=user_id, session_id=session.id, new_message=content)
        
        weather_data = None
        message = ""
        
        async for event in events:
            if event.is_final_response():
                text = event.content.parts[0].text if event.content and event.content.parts else "[Agent error] No response content"
                
                # Try to parse as JSON (weather response from callback)
                try:
                    if text:
                        parsed_response = json.loads(text)
                        if isinstance(parsed_response, dict) and "type" in parsed_response:
                            # This is a weather response from our callback
                            message = parsed_response.get("description", "Weather information provided.")
                            
                            # Parse weather data based on type
                            if parsed_response["type"] == "current_weather":
                                weather_data = ChatCurrentWeatherResponse(**parsed_response)
                            elif parsed_response["type"] == "forecast_weather":
                                weather_data = ChatForecastWeatherResponse(**parsed_response)
                            elif parsed_response["type"] == "history_weather":
                                weather_data = ChatHistoryWeatherResponse(**parsed_response)
                        else:
                            message = text
                    else:
                        message = "[Agent error] No response content"
                except (json.JSONDecodeError, ValueError):
                    # Not JSON, treat as regular text response
                    message = text or "[Agent error] No response content"
                
                return ChatResponse(message=message, weather_data=weather_data)
        
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