from fastapi import FastAPI, Request, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from agent_system.src.utils.load_env_data import load_env_data, get_environment_info
import agent_system.src.multi_tool_agent.agent as agent_module
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types
import os
from datetime import datetime
from .models import (
    CurrentWeatherRequest, ForecastWeatherRequest, HistoryWeatherRequest,
    CurrentWeatherResponse, ForecastWeatherResponse, HistoryWeatherResponse,
    AuthResponse, LogoutRequest, SessionInfo, GoogleAuthRequest, 
    ChatRequest, ChatResponse
)
from .weather_service import weather_service
from .auth_service import auth_service
import pyotp
import qrcode
from io import BytesIO
from starlette.responses import StreamingResponse

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
        return JSONResponse(status_code=404, content={"success": False, "error": "Session not found or inactive"})
    return session_info

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            return ChatResponse(
                success=False,
                error="AI chat is not available. Please set the GOOGLE_API_KEY environment variable."
            )

        # Determine effective unit system (prefer last message, then request, default METRIC)
        last_msg = request.conversation_history[-1] if request.conversation_history else None
        effective_unit_system = (last_msg.get("unitSystem") if last_msg else None) or request.unit_system or "METRIC"

        # Require a valid app session to use chat
        if not request.session_id or not auth_service.validate_session(request.session_id):
            return ChatResponse(
                success=False,
                error="Authentication required. Please sign in again."
            )

        effective_user_id = request.user_id or "anonymous"
        adk_session_id = None

        # Reuse a single long-lived session service across requests
        session_service = auth_service.session_service

        # Retrieve user and any existing ADK session id from the stored app session
        session_rec = auth_service.user_sessions.get(request.session_id)
        if session_rec:
            effective_user_id = session_rec.get("user_id", effective_user_id)
            adk_session_id = session_rec.get("adk_session_id")
            auth_service.update_session_activity(request.session_id)

        # Ensure we have an ADK session bound to this app session
        if not adk_session_id:
            adk_session = await session_service.create_session(app_name="weather_center", user_id=effective_user_id)
            adk_session_id = adk_session.id
            auth_service.update_session_data(request.session_id, {"adk_session_id": adk_session_id})

        # Build runner using the shared session_service
        runner = Runner(agent=agent_module.root_agent, app_name="weather_center", session_service=session_service)
        content = types.Content(role='user', parts=[types.Part(text=request.message)])

        # Prefer running within the established ADK session when available
        selected_session_id = adk_session_id

        events = runner.run_async(user_id=effective_user_id, session_id=selected_session_id, new_message=content)
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
                    data={"message": normalized, "sender": "ai"}
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

@app.post("/api/auth/totp/setup")
async def totp_setup(email: str = Form(...)):
    """Setup TOTP for a user and return QR code"""
    try:
        # Check if user exists, if not create one
        user = auth_service.get_user_by_email(email)
        if not user:
            # Create a new user for TOTP authentication
            user = auth_service.create_user(email=email, name=email.split('@')[0])
        
        # Generate TOTP secret and save it
        secret = pyotp.random_base32()
        updated_user = auth_service.set_totp_secret(email, secret)
        
        if not updated_user:
            return {"success": False, "error": "Failed to setup TOTP"}
        
        # Generate QR code
        uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=email, 
            issuer_name="WeatherCenter"
        )
        img = qrcode.make(uri)
        buf = BytesIO()
        img.save(buf)
        buf.seek(0)
        
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        return {"success": False, "error": f"Setup failed: {str(e)}"}

@app.post("/api/auth/totp/verify")
async def totp_verify(email: str = Form(...), code: str = Form(...)):
    """Verify TOTP code and create session"""
    try:
        if auth_service.verify_totp(email, code):
            # Get or create user
            user = auth_service.get_user_by_email(email)
            if not user:
                return {"success": False, "error": "User not found"}
            
            # Create session similar to Google auth
            session_id = auth_service._generate_session_id()
            session_data = {
                "user_id": user.id,
                "email": user.email,
                "name": user.name,
                "picture": None,  # TOTP users don't have profile pictures
                "adk_session_id": None,  # Will be created when needed
                "created_at": datetime.now(),
                "last_activity": datetime.now(),
                "is_active": True
            }
            
            auth_service.user_sessions[session_id] = session_data
            
            return AuthResponse(
                success=True,
                session_id=session_id,
                user_id=user.id,
                user_info={
                    "email": user.email,
                    "name": user.name,
                    "picture": None
                },
                message="TOTP authentication successful"
            )
        else:
            return AuthResponse(
                success=False,
                error="Invalid TOTP code"
            )
    except Exception as e:
        return AuthResponse(
            success=False,
            error=f"TOTP verification failed: {str(e)}"
        )

@app.get("/api/auth/totp/status/{email}")
async def totp_status(email: str):
    """Check if a user has TOTP enabled"""
    try:
        user = auth_service.get_user_by_email(email)
        if not user:
            return {"success": False, "error": "User not found"}
        
        return {
            "success": True,
            "has_totp": user.is_totp_enabled if user else False,
            "email": email
        }
    except Exception as e:
        return {"success": False, "error": f"Status check failed: {str(e)}"} 