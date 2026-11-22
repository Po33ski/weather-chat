import asyncio
from datetime import datetime, timedelta

from api.session_manager import APP_NAME, SessionManager


def adk_session(manager: SessionManager, data: dict):
    return asyncio.run(
        manager.session_service.get_session(
            app_name=APP_NAME,
            user_id=data["user_id"],
            session_id=data["adk_session_id"],
        )
    )


def new_session(manager: SessionManager, session_id: str | None = None) -> dict:
    return asyncio.run(manager.ensure_session(session_id))


class TestEnsureSession:
    def test_known_id_returns_the_same_session(self):
        manager = SessionManager()
        first = new_session(manager)
        assert new_session(manager, first["session_id"]) is first

    def test_unknown_client_id_is_never_adopted(self):
        manager = SessionManager()
        session = new_session(manager, "client-chosen-id")
        assert session["session_id"] != "client-chosen-id"
        assert "client-chosen-id" not in manager.sessions


class TestSessionCap:
    def test_total_never_exceeds_the_cap(self):
        manager = SessionManager(max_sessions=3)
        for _ in range(10):
            new_session(manager)
        assert len(manager.sessions) == 3

    def test_oldest_session_is_evicted_from_both_stores(self):
        manager = SessionManager(max_sessions=2)
        oldest = new_session(manager)
        new_session(manager)
        new_session(manager)
        assert oldest["session_id"] not in manager.sessions
        assert adk_session(manager, oldest) is None

    def test_activity_protects_a_session_from_eviction(self):
        manager = SessionManager(max_sessions=2)
        active = new_session(manager)
        idle = new_session(manager)
        new_session(manager, active["session_id"])
        new_session(manager)
        assert active["session_id"] in manager.sessions
        assert idle["session_id"] not in manager.sessions

    def test_evicted_id_gets_a_new_session(self):
        manager = SessionManager(max_sessions=1)
        evicted = new_session(manager)
        new_session(manager)
        replacement = new_session(manager, evicted["session_id"])
        assert replacement["session_id"] != evicted["session_id"]


class TestCleanup:
    def test_expired_session_is_removed_from_both_stores(self):
        manager = SessionManager()
        stale = new_session(manager)
        fresh = new_session(manager)
        stale["last_activity"] = datetime.now() - timedelta(hours=25)

        asyncio.run(manager.cleanup_expired_sessions())

        assert stale["session_id"] not in manager.sessions
        assert adk_session(manager, stale) is None
        assert fresh["session_id"] in manager.sessions
