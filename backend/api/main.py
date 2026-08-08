import logging
import os
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from agent_system.src.utils.load_env_data import get_environment_info, load_env_data

from .chat_service import process_chat_request
from .models import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)


def _client_ip(request: Request) -> str:
    # uvicorn sits behind nginx in the container, so request.client.host is
    # always 127.0.0.1 — the real client is the leftmost X-Forwarded-For hop.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=_client_ip)

# Load environment variables (warn about missing keys, never crash on startup)
try:
    load_env_data()
except ValueError as e:
    logger.warning("Environment startup warning: %s", e)
    logger.warning(
        "Some features may be unavailable until environment variables are configured."
    )

app = FastAPI(
    title="Travel and Weather Center Chat API",
    description="A comprehensive weather and AI chat application API",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allow CORS for local frontend (Next.js/Vite dev and other ports)
# Configure CORS
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
    Health check endpoint that verifies the application is running and the
    environment is properly configured.
    """
    try:
        env_info = get_environment_info()
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "environment": env_info,
            "services": {
                "api": "running",
                "weather_service": "available"
                if env_info["has_visual_crossing_api_key"]
                else "unavailable",
                "ai_chat": "available"
                if env_info["has_google_api_key"]
                else "unavailable",
            },
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "services": {
                "api": "running",
                "weather_service": "unknown",
                "ai_chat": "unknown",
            },
        }


# Mirror health under /api for frontend behind nginx
@app.get("/api/health")
def api_health():
    return health()


# Static file serving is handled by nginx in production. Do not define catch-all
# routes here to avoid intercepting /api/* paths.


# Health endpoints stay unlimited (Render health checks poll them); the chat
# endpoint is capped per client IP because every call spends paid LLM and
# search-API quota.
@app.post("/api/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat_endpoint(request: Request, chat_request: ChatRequest):
    return await process_chat_request(chat_request)
