from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent_system.src.utils.load_env_data import load_env_data, get_environment_info
import os
from datetime import datetime
from .models import ChatRequest, ChatResponse

from .chat_service import process_chat_request

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
    return await process_chat_request(request)




#For eventualy future use:
# @app.post("/api/weather/current", response_model=CurrentWeatherResponse)
# def get_current_weather(request: CurrentWeatherRequest):
#     try:
#         data = weather_service.get_current_weather(request.location)
#         return CurrentWeatherResponse(success=True, data=data)
#     except Exception as e:
#         return CurrentWeatherResponse(success=False, error=str(e))

# @app.post("/api/weather/forecast", response_model=ForecastWeatherResponse)
# def get_forecast_weather(request: ForecastWeatherRequest):
#     try:
#         data = weather_service.get_forecast_weather(request.location, request.days)
#         return ForecastWeatherResponse(success=True, data=data)
#     except Exception as e:
#         return ForecastWeatherResponse(success=False, error=str(e))

# @app.post("/api/weather/history", response_model=HistoryWeatherResponse)
# def get_history_weather(request: HistoryWeatherRequest):
#     try:
#         data = weather_service.get_history_weather(request.location, request.start_date, request.end_date)
#         return HistoryWeatherResponse(success=True, data=data)
#     except Exception as e:
#         return HistoryWeatherResponse(success=False, error=str(e))