from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent_system.src.utils.load_env_data import load_env_data, get_environment_info
import agent_system.src.multi_tool_agent.agent as agent_module
from google.adk.runners import Runner
from google.genai import types
import os
from datetime import datetime
from .models import (
    CurrentWeatherRequest, ForecastWeatherRequest, HistoryWeatherRequest,
    CurrentWeatherResponse, ForecastWeatherResponse, HistoryWeatherResponse,
    ChatRequest, ChatResponse
)
from .weather_service import weather_service
from .session_manager import session_manager

# Load environment variables (if needed)
load_env_data()

app = FastAPI(
    title="Weather Center Chat API",
    description="A comprehensive weather and AI chat application API",
    version="1.0.0"
)

# Allow CORS for local frontend
# Configure CORS
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# In production behind nginx, frontend and backend share the same origin
# You may add your public domain here if needed
public_domain = os.getenv("PUBLIC_WEB_ORIGIN")
if public_domain: 
    allowed_origins.append(public_domain)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (conditioned for production only)
# app.mount("/static", StaticFiles(directory="/app/frontend/out"), name="static")

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

# Mirror health under /api for frontend behind nginx
@app.get("/api/health")
def api_health():
    return health()

# Static file serving is handled by nginx in production. Do not define catch-all
# routes here to avoid intercepting /api/* paths.

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    session_data = None
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            return ChatResponse(
                success=False,
                error="AI chat is not available. Please set the GOOGLE_API_KEY environment variable."
            )

        # Clean up any stale sessions before ensuring/creating a new one
        session_manager.cleanup_expired_sessions()

        # Ensure we have a session (create one if frontend sent none)
        session_data = await session_manager.ensure_session(request.session_id)

        # Determine effective unit system (prefer last message, then request, default METRIC)
        last_msg = request.conversation_history[-1] if request.conversation_history else None
        effective_unit_system = (last_msg.get("unitSystem") if last_msg else None) or request.unit_system or "METRIC"

        # Build runner using the shared session_service
        runner = Runner(
            agent=agent_module.root_agent,
            app_name="weather_center",
            session_service=session_manager.session_service,
        )
        content = types.Content(role='user', parts=[types.Part(text=request.message)])

        events = runner.run_async(
            user_id=session_data["user_id"],
            session_id=session_data["adk_session_id"],
            new_message=content,
        )
        async for event in events:
            if event.is_final_response():
                # Concatenate all text parts then normalize to a single short text + one fenced JSON block labeled weather-json
                raw_text = ""
                if getattr(event, 'content', None) and getattr(event.content, 'parts', None):
                    parts_text = []
                    for part in event.content.parts:
                        try:
                            t = getattr(part, 'text', None)
                            if t:
                                parts_text.append(t)
                        except Exception:
                            continue
                    raw_text = "\n".join(parts_text).strip()

                if not raw_text:
                    raw_text = "[Agent error] No response content"

                # Normalize: keep only the first fenced JSON block; relabel to weather-json if needed
                import re
                fence_pattern = re.compile(r"```\s*(weather-json|json)\s*\n([\s\S]*?)\n```", re.IGNORECASE)
                match = fence_pattern.search(raw_text)
                if match:
                    human_text = raw_text[:match.start()].strip()
                    json_body = match.group(2).strip()
                    normalized = (human_text + "\n\n" if human_text else "") + "```weather-json\n" + json_body + "\n```"
                else:
                    # No fenced block found; return as-is
                    normalized = raw_text

                return ChatResponse(
                    success=True,
                    data={"message": normalized, "sender": "ai"},
                    session_id=session_data["session_id"],
                )
        return ChatResponse(
            success=False,
            error="[Agent error] No response from agent.",
            session_id=session_data["session_id"],
        )
    except Exception as e:
        print(f"Chat endpoint error: {str(e)}")
        return ChatResponse(
            success=False,
            error=f"Error: {str(e)}",
            session_id=session_data["session_id"] if session_data else request.session_id,
        )


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