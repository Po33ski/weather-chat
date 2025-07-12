import os
import uuid
import hashlib
import secrets
import requests
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from google.adk.sessions import InMemorySessionService
from .models import LoginRequest, RegisterRequest, AuthResponse, SessionInfo, GoogleAuthRequest, GoogleUserInfo

class AuthService:
    def __init__(self):
        self.session_service = InMemorySessionService()
        self.user_sessions: Dict[str, Dict[str, Any]] = {}  # session_id -> session_data
        self.user_credentials: Dict[str, Dict[str, Any]] = {}  # email -> user_data
        self.google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        
    def _verify_google_token(self, id_token: str) -> Optional[GoogleUserInfo]:
        """Verify Google ID token and extract user info"""
        try:
            # Google's token verification endpoint
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            response = requests.get(url)
            
            if response.status_code == 200:
                token_info = response.json()
                
                # Verify the token is for our app
                if self.google_client_id and token_info.get("aud") != self.google_client_id:
                    return None
                
                return GoogleUserInfo(
                    email=token_info.get("email", ""),
                    name=token_info.get("name", ""),
                    picture=token_info.get("picture"),
                    sub=token_info.get("sub", "")
                )
            else:
                return None
        except Exception as e:
            print(f"Error verifying Google token: {e}")
            return None
        
    def _generate_session_id(self) -> str:
        """Generate a unique session ID"""
        return str(uuid.uuid4())
    
    def _generate_user_id(self, email: str) -> str:
        """Generate a user ID based on email"""
        return hashlib.md5(email.encode()).hexdigest()
    
    async def authenticate_with_google(self, request: GoogleAuthRequest) -> AuthResponse:
        """Authenticate user with Google ID token and create Google ADK session"""
        try:
            # Verify the Google ID token
            user_info = self._verify_google_token(request.id_token)
            if not user_info:
                return AuthResponse(
                    success=False,
                    error="Invalid Google token"
                )
            
            email = user_info.email.lower().strip()
            
            # Create or get user
            if email not in self.user_credentials:
                # Create new user from Google OAuth
                user_id = user_info.sub  # Use Google's user ID
                user_data = {
                    "user_id": user_id,
                    "email": email,
                    "name": user_info.name,
                    "picture": user_info.picture,
                    "created_at": datetime.now(),
                    "provider": "google"
                }
                self.user_credentials[email] = user_data
            else:
                # Update existing user info
                user_data = self.user_credentials[email]
                user_data["name"] = user_info.name
                user_data["picture"] = user_info.picture
                user_id = user_data["user_id"]
            
            # Create Google ADK session
            try:
                adk_session = self.session_service.create_session(
                    app_name="weather_center", 
                    user_id=user_id
                )
                adk_session_id = adk_session.id
            except Exception as e:
                print(f"Error creating Google ADK session: {e}")
                return AuthResponse(
                    success=False,
                    error=f"Failed to create AI session: {str(e)}"
                )
            
            # Create our app session
            session_id = self._generate_session_id()
            session_data = {
                "user_id": user_id,
                "email": email,
                "name": user_info.name,
                "picture": user_info.picture,
                "adk_session_id": adk_session_id,
                "created_at": datetime.now(),
                "last_activity": datetime.now(),
                "is_active": True
            }
            
            self.user_sessions[session_id] = session_data
            
            return AuthResponse(
                success=True,
                session_id=session_id,
                user_id=user_id,
                user_info={
                    "email": user_info.email,
                    "name": user_info.name,
                    "picture": user_info.picture
                },
                message="Google authentication successful"
            )
            
        except Exception as e:
            return AuthResponse(
                success=False,
                error=f"Google authentication failed: {str(e)}"
            )

    async def logout_user(self, session_id: str) -> AuthResponse:
        """Logout user and clean up sessions"""
        try:
            if session_id in self.user_sessions:
                session_data = self.user_sessions[session_id]
                
                # Note: Google ADK sessions are managed by InMemorySessionService
                # They will be cleaned up automatically when the service is restarted
                
                # Remove our session
                del self.user_sessions[session_id]
                
                return AuthResponse(
                    success=True,
                    message="Logout successful"
                )
            else:
                return AuthResponse(
                    success=False,
                    error="Session not found"
                )
                
        except Exception as e:
            return AuthResponse(
                success=False,
                error=f"Logout failed: {str(e)}"
            )
    
    def get_session_info(self, session_id: str) -> Optional[SessionInfo]:
        """Get session information"""
        if session_id in self.user_sessions:
            session_data = self.user_sessions[session_id]
            return SessionInfo(
                session_id=session_id,
                user_id=session_data["user_id"],
                email=session_data["email"],
                name=session_data["name"],
                picture=session_data.get("picture"),
                created_at=session_data["created_at"],
                last_activity=session_data["last_activity"],
                is_active=session_data["is_active"]
            )
        return None
    
    def validate_session(self, session_id: str) -> bool:
        """Validate if session exists and is active"""
        return session_id in self.user_sessions and self.user_sessions[session_id]["is_active"]
    
    def get_user_from_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get user data from session"""
        if session_id in self.user_sessions:
            session_data = self.user_sessions[session_id]
            return {
                "user_id": session_data["user_id"],
                "email": session_data["email"],
                "name": session_data["name"],
                "picture": session_data.get("picture"),
                "adk_session_id": session_data.get("adk_session_id")
            }
        return None
    
    def update_session_activity(self, session_id: str):
        """Update session last activity"""
        if session_id in self.user_sessions:
            self.user_sessions[session_id]["last_activity"] = datetime.now()
    
    def update_session_data(self, session_id: str, session_data: Dict[str, Any]):
        """Update session data with new information"""
        if session_id in self.user_sessions:
            # Update existing session data with new data
            self.user_sessions[session_id].update(session_data)
            # Update last activity
            self.user_sessions[session_id]["last_activity"] = datetime.now()
    
    def cleanup_expired_sessions(self, max_age_hours: int = 24):
        """Clean up expired sessions"""
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        expired_sessions = [
            session_id for session_id, session_data in self.user_sessions.items()
            if session_data["last_activity"] < cutoff_time
        ]
        
        for session_id in expired_sessions:
            del self.user_sessions[session_id]

# Create global instance
auth_service = AuthService() 