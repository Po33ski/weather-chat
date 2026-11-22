import asyncio

import httpx
import pytest

import api.main as main
from api.models import ChatResponse


def call(method: str, path: str, **kwargs) -> httpx.Response:
    async def run():
        transport = httpx.ASGITransport(app=main.app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            return await client.request(method, path, **kwargs)

    main.limiter.reset()
    try:
        return asyncio.run(run())
    finally:
        main.limiter.reset()


class TestHealth:
    @pytest.mark.parametrize("path", ["/health", "/api/health"])
    def test_reports_configured_services(self, monkeypatch, path):
        monkeypatch.setenv("GOOGLE_API_KEY", "test-key")
        monkeypatch.delenv("VISUAL_CROSSING_API_KEY", raising=False)

        response = call("GET", path)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "healthy"
        assert body["services"]["ai_chat"] == "available"
        assert body["services"]["weather_service"] == "unavailable"

    def test_reports_the_deployment_environment(self, monkeypatch):
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.delenv("NODE_ENV", raising=False)
        body = call("GET", "/health").json()
        assert body["environment"]["environment"] == "production"

    def test_response_never_contains_key_values(self, monkeypatch):
        monkeypatch.setenv("GOOGLE_API_KEY", "secret-value")
        assert "secret-value" not in call("GET", "/health").text


class TestChatEndpoint:
    @pytest.mark.parametrize(
        "body",
        [
            {},
            {"message": ""},
            {"message": "   "},
            {"message": "x" * 4001},
            {"message": "x", "session_id": "s" * 129},
        ],
    )
    def test_invalid_body_is_rejected_before_the_agents(self, monkeypatch, body):
        async def must_not_run(request):
            raise AssertionError("invalid requests must not reach the agents")

        monkeypatch.setattr(main, "process_chat_request", must_not_run)
        assert call("POST", "/api/chat", json=body).status_code == 422

    def test_valid_body_returns_the_service_response(self, monkeypatch):
        async def reply(request):
            assert request.message == "pogoda"
            return ChatResponse(
                success=True,
                data={"message": "ok", "sender": "ai"},
                session_id="s-1",
            )

        monkeypatch.setattr(main, "process_chat_request", reply)

        response = call("POST", "/api/chat", json={"message": "  pogoda  "})

        assert response.status_code == 200
        assert response.json()["data"]["message"] == "ok"
        assert response.json()["session_id"] == "s-1"

    def test_missing_google_key_is_a_clean_failure(self, monkeypatch):
        monkeypatch.delenv("GOOGLE_API_KEY", raising=False)

        response = call("POST", "/api/chat", json={"message": "pogoda"})

        assert response.status_code == 200
        assert response.json()["success"] is False
        assert "GOOGLE_API_KEY" in response.json()["error"]
