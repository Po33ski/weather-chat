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
from agent_system.src.multi_tool_agent.tools.get_user_preferences import set_user_preferences
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
    conversation_history: list
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None

class UnitSystemRequest(BaseModel):
    unit_system: str
    session_id: Optional[str] = None

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
        # Check if Google API key is available
        if not os.getenv("GOOGLE_API_KEY"):
            return ChatResponse(
                success=False,
                error="AI chat is not available. Please set the GOOGLE_API_KEY environment variable."
            )
        
        # Validate session if provided
        user_id = "anonymous"
        adk_session_id = None
        if request.session_id:
            if not auth_service.validate_session(request.session_id):
                return ChatResponse(
                    success=False,
                    error="Invalid or expired session. Please login again."
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
        
        # Store the session_id in the ADK session state so the agent can access it
        if request.session_id:
            session.state["app_session_id"] = request.session_id
        
        runner = Runner(agent=agent_module.root_agent, app_name="weather_center", session_service=session_service)
        content = types.Content(role='user', parts=[types.Part(text=user_message)])
        events = runner.run_async(user_id=user_id, session_id=session.id, new_message=content)
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

@app.post("/api/settings/unit-system", response_model=UnitSystemResponse)
async def update_unit_system(request: UnitSystemRequest):
    """Update user's preferred unit system"""
    try:
        # Validate session if provided
        user_id = "anonymous"
        if request.session_id:
            if not auth_service.validate_session(request.session_id):
                return UnitSystemResponse(
                    success=False,
                    error="Invalid or expired session. Please login again."
                )
            user_data = auth_service.get_user_from_session(request.session_id)
            if user_data:
                user_id = user_data["user_id"]
                auth_service.update_session_activity(request.session_id)
        
        # Validate unit system
        valid_systems = ["US", "METRIC", "UK"]
        if request.unit_system not in valid_systems:
            return UnitSystemResponse(
                success=False,
                error=f"Invalid unit system. Must be one of: {', '.join(valid_systems)}"
            )
        
        # Store unit system preference in session
        if request.session_id:
            # Store in the session data
            session_data = auth_service.get_user_from_session(request.session_id)
            if session_data:
                session_data["unit_system"] = request.unit_system
                # Update the session with the new unit system preference
                auth_service.update_session_data(request.session_id, session_data)
            
            # Also store in the agent system preferences
            try:
                from agent_system.src.multi_tool_agent.tools.get_user_preferences import set_user_preferences
                preferences = {
                    "unit_system": request.unit_system,
                    "user_id": session_data.get("user_id") if session_data else "anonymous",
                    "email": session_data.get("email") if session_data else "anonymous@example.com",
                    "name": session_data.get("name") if session_data else "Anonymous User"
                }
                set_user_preferences(request.session_id, preferences)
            except ImportError:
                # If the agent system is not available, just log it
                print(f"Agent system preferences not available, but unit system updated: {request.unit_system}")
        
        print(f"User {user_id} updated unit system to: {request.unit_system}")
        
        return UnitSystemResponse(
            success=True,
            data={"message": f"Unit system updated to {request.unit_system}"}
        )
    except Exception as e:
        print(f"Unit system update error: {str(e)}")
        return UnitSystemResponse(
            success=False,
            error=f"Error updating unit system: {str(e)}"
        )

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