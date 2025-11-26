import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional, Any

from google.adk.sessions import InMemorySessionService


class SessionManager:
    """Lightweight in-memory session registry decoupled from user authentication."""

    def __init__(self) -> None:
        self.session_service = InMemorySessionService()
        self.sessions: Dict[str, Dict[str, Any]] = {}

    async def ensure_session(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Return session data for the provided id or create a new one on the fly."""
        sid = session_id or str(uuid.uuid4())
        session = self.sessions.get(sid)

        if not session:
            user_id = f"user-{sid}"
            adk_session = await self.session_service.create_session(
                app_name="weather_center",
                user_id=user_id,
            )
            session = {
                "session_id": sid,
                "user_id": user_id,
                "adk_session_id": adk_session.id,
                "created_at": datetime.now(),
                "last_activity": datetime.now(),
            }
            self.sessions[sid] = session
            return session

        # Refresh activity timestamp and make sure ADK session exists
        session["last_activity"] = datetime.now()
        if not session.get("adk_session_id"):
            user_id = session.get("user_id") or f"user-{sid}"
            adk_session = await self.session_service.create_session(
                app_name="weather_center",
                user_id=user_id,
            )
            session["user_id"] = user_id
            session["adk_session_id"] = adk_session.id

        return session

    def cleanup_expired_sessions(self, max_age_hours: int = 24) -> None:
        """Drop stale sessions to keep in-memory state under control."""
        cutoff = datetime.now() - timedelta(hours=max_age_hours)
        expired = [
            sid for sid, data in self.sessions.items()
            if data.get("last_activity", datetime.min) < cutoff
        ]
        for sid in expired:
            self.sessions.pop(sid, None)


session_manager = SessionManager()

