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
from typing import Optional, Dict
from .models import (
    CurrentWeatherRequest, ForecastWeatherRequest, HistoryWeatherRequest,
    CurrentWeatherResponse, ForecastWeatherResponse, HistoryWeatherResponse,
    AuthResponse, LogoutRequest, SessionInfo, GoogleAuthRequest
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
    conversation_history: list[dict]  # Each dict should have text, sender, unitSystem, userId
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    unit_system: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    user_id: Optional[str] = None

class UnitSystemRequest(BaseModel):
    unit_system: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None

class UnitSystemResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None

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
        if not os.getenv("GOOGLE_API_KEY"):
            return ChatResponse(
                success=False,
                error="AI chat is not available. Please set the GOOGLE_API_KEY environment variable."
            )

        # Extract latest unitSystem and userId from the last message in conversation_history if present
        last_msg = request.conversation_history[-1] if request.conversation_history else None
        effective_unit_system = None
        effective_user_id = None
        if last_msg:
            effective_unit_system = last_msg.get("unitSystem")
            effective_user_id = last_msg.get("userId")
        if not effective_unit_system:
            effective_unit_system = request.unit_system or "METRIC"
        if not effective_user_id:
            effective_user_id = request.user_id or "anonymous"

        adk_session_id = None
        if request.session_id:
            if not auth_service.validate_session(request.session_id):
                return ChatResponse(
                    success=False,
                    error="Invalid or expired session. Please login again."
                )
            user_data = auth_service.get_user_from_session(request.session_id)
            if user_data:
                effective_user_id = user_data["user_id"]
                adk_session_id = user_data.get("adk_session_id")
                auth_service.update_session_activity(request.session_id)
        user_message = request.message
        session_service = InMemorySessionService()
        if adk_session_id:
            try:
                session = session_service.create_session(app_name="weather_center", user_id=effective_user_id)
            except Exception:
                session = session_service.create_session(app_name="weather_center", user_id=effective_user_id)
        else:
            session = session_service.create_session(app_name="weather_center", user_id=effective_user_id)
        if request.session_id:
            session.state["app_session_id"] = request.session_id
        # Pass unit_system and user_id to the agent via session state for tool access
        session.state["unit_system"] = effective_unit_system
        session.state["user_id"] = effective_user_id
        runner = Runner(agent=agent_module.root_agent, app_name="weather_center", session_service=session_service)
        content = types.Content(role='user', parts=[types.Part(text=user_message)])
        events = runner.run_async(user_id=effective_user_id, session_id=session.id, new_message=content)
        async for event in events:
            if event.is_final_response():
                text = event.content.parts[0].text if event.content and event.content.parts else "[Agent error] No response content"
                return ChatResponse(
                    success=True,
                    data={"message": text or "[Agent error] No response content", "sender": "ai"}
                )
        return ChatResponse(
            success=False,
            error="[Agent error] No response from agent."
        )
    except Exception as e:
        print(f"Chat endpoint error: {str(e)}")
        return ChatResponse(
            success=False,
            error=f"Error: {str(e)}"
        )

# --- Weather API Endpoints ---
weather_service = WeatherService()

@app.post("/api/weather/current", response_model=CurrentWeatherResponse)
def get_current_weather(request: CurrentWeatherRequest):
    try:
        data = weather_service.get_current_weather(request.location, request.unit_system)
        return CurrentWeatherResponse(success=True, data=data)
    except Exception as e:
        return CurrentWeatherResponse(success=False, error=str(e))

@app.post("/api/weather/forecast", response_model=ForecastWeatherResponse)
def get_forecast_weather(request: ForecastWeatherRequest):
    try:
        data = weather_service.get_forecast_weather(request.location, request.days, request.unit_system)
        return ForecastWeatherResponse(success=True, data=data)
    except Exception as e:
        return ForecastWeatherResponse(success=False, error=str(e))

@app.post("/api/weather/history", response_model=HistoryWeatherResponse)
def get_history_weather(request: HistoryWeatherRequest):
    try:
        data = weather_service.get_history_weather(request.location, request.start_date, request.end_date, request.unit_system)
        return HistoryWeatherResponse(success=True, data=data)
    except Exception as e:
        return HistoryWeatherResponse(success=False, error=str(e)) 