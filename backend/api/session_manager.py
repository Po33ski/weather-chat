import uuid
from collections import OrderedDict
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from google.adk.sessions import InMemorySessionService

# Must match the app_name the Runner is constructed with — a mismatch makes
# ADK silently fail to find sessions created here.
APP_NAME = "weather_center"

# Sessions live in process memory and any anonymous request can create one, so
# the total is capped. The owner of an evicted session just continues in a new
# one: the frontend swaps to whatever session_id the response carries.
MAX_SESSIONS = 1000


class SessionManager:
    """Lightweight in-memory session registry decoupled from user authentication."""

    def __init__(self, max_sessions: int = MAX_SESSIONS) -> None:
        self.session_service = InMemorySessionService()
        self.max_sessions = max_sessions
        # Ordered by last activity, least recently active first.
        self.sessions: OrderedDict[str, Dict[str, Any]] = OrderedDict()

    async def ensure_session(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Return session data for a server-issued id, or create a new session.

        Only ids present in the registry are honored. An unknown id from the
        client is never adopted — session ids double as bearer tokens here, so
        adopting a client-chosen (guessable) id would let another client attach
        to the same conversation. The frontend already handles this: it swaps
        to whatever session_id the response carries.
        """
        session = self.sessions.get(session_id) if session_id else None

        if session is not None:
            session["last_activity"] = datetime.now()
            self.sessions.move_to_end(session_id)
            return session

        while len(self.sessions) >= self.max_sessions:
            _, oldest = self.sessions.popitem(last=False)
            await self._delete_adk_session(oldest)

        sid = str(uuid.uuid4())
        user_id = f"user-{sid}"
        adk_session = await self.session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
        )
        session = {
            "session_id": sid,
            "user_id": user_id,
            "adk_session_id": adk_session.id,
            "last_activity": datetime.now(),
        }
        self.sessions[sid] = session
        return session

    async def cleanup_expired_sessions(self, max_age_hours: int = 24) -> None:
        """Drop stale sessions from the registry AND the ADK session store."""
        cutoff = datetime.now() - timedelta(hours=max_age_hours)
        expired = [
            sid
            for sid, data in self.sessions.items()
            if data.get("last_activity", datetime.min) < cutoff
        ]
        for sid in expired:
            data = self.sessions.pop(sid, None)
            if data and data.get("adk_session_id"):
                await self._delete_adk_session(data)

    async def _delete_adk_session(self, data: Dict[str, Any]) -> None:
        # Without this, the ADK store keeps the full conversation event
        # history of a session that is no longer reachable — a slow leak.
        await self.session_service.delete_session(
            app_name=APP_NAME,
            user_id=data["user_id"],
            session_id=data["adk_session_id"],
        )


session_manager = SessionManager()
