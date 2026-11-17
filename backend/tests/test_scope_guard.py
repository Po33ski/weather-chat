import asyncio
from types import SimpleNamespace

import pytest
from google.adk.events import Event
from google.genai import types

import api.chat_service as chat_service
import api.scope_guard as scope_guard
from api.models import ChatRequest
from api.scope_guard import (
    ScopeVerdict,
    _build_classifier_input,
    _recent_turns,
    _refusal_for,
)


def user_event(text: str) -> Event:
    return Event(
        author="user",
        content=types.Content(role="user", parts=[types.Part(text=text)]),
    )


def agent_event(*parts: types.Part, author: str = "weather_assistant") -> Event:
    return Event(author=author, content=types.Content(role="model", parts=list(parts)))


SESSION = {"user_id": "user-1", "adk_session_id": "adk-1", "session_id": "s-1"}


class TestRecentTurns:
    def test_strips_date_header_from_user_messages(self):
        turns = _recent_turns([user_event("[Today is 2026-10-30, Friday] pogoda")])
        assert turns == [("user", "pogoda")]

    def test_drops_fenced_json_from_agent_replies(self):
        reply = 'Sunny in Kraków.\n\n```weather-json\n{"a": 1}\n```'
        turns = _recent_turns([agent_event(types.Part(text=reply))])
        assert turns == [("assistant", "Sunny in Kraków.")]

    def test_skips_tool_calls_and_thoughts(self):
        call = types.Part(function_call=types.FunctionCall(name="get_forecast"))
        events = [
            agent_event(call),
            agent_event(types.Part(text="hmm", thought=True), types.Part(text="ok")),
        ]
        assert _recent_turns(events) == [("assistant", "ok")]

    def test_keeps_only_the_last_turns(self):
        events = [user_event(f"m{i}") for i in range(10)]
        assert [text for _, text in _recent_turns(events, limit=2)] == ["m8", "m9"]

    def test_truncates_long_turns(self):
        turns = _recent_turns([user_event("x" * 5000)])
        assert len(turns[0][1]) == scope_guard._HISTORY_TURN_MAX_CHARS


class TestBuildClassifierInput:
    def test_contains_history_and_latest_message(self):
        text = _build_classifier_input("a na jutro?", [("user", "pogoda w Gdańsku")])
        assert "user: pogoda w Gdańsku" in text
        assert "<latest_message>\na na jutro?\n</latest_message>" in text

    def test_marks_empty_history(self):
        assert "(none)" in _build_classifier_input("hi", [])


class TestRefusalFor:
    @pytest.mark.parametrize("language", ["pl", "PL", "pl-PL"])
    def test_polish(self, language):
        assert _refusal_for(language).startswith("Pomagam tylko")

    @pytest.mark.parametrize("language", ["en", "de", "", "xx"])
    def test_falls_back_to_english(self, language):
        assert _refusal_for(language).startswith("I can only help")


def fake_client(generate):
    return SimpleNamespace(
        aio=SimpleNamespace(models=SimpleNamespace(generate_content=generate))
    )


class TestClassify:
    def test_returns_parsed_verdict(self, monkeypatch):
        verdict = ScopeVerdict(in_scope=False, language="en")

        async def generate(**kwargs):
            return SimpleNamespace(parsed=verdict)

        monkeypatch.setattr(scope_guard, "_get_client", lambda: fake_client(generate))
        assert asyncio.run(scope_guard._classify("2+2?", [])) == verdict

    def test_fails_open_on_api_error(self, monkeypatch):
        async def generate(**kwargs):
            raise RuntimeError("quota exceeded")

        monkeypatch.setattr(scope_guard, "_get_client", lambda: fake_client(generate))
        assert asyncio.run(scope_guard._classify("2+2?", [])) is None

    def test_fails_open_on_missing_verdict(self, monkeypatch):
        async def generate(**kwargs):
            return SimpleNamespace(parsed=None)

        monkeypatch.setattr(scope_guard, "_get_client", lambda: fake_client(generate))
        assert asyncio.run(scope_guard._classify("2+2?", [])) is None


class TestScopeRefusal:
    def patch(self, monkeypatch, verdict):
        async def classify(message, turns):
            return verdict

        async def events(session_data):
            return []

        monkeypatch.setattr(scope_guard, "_classify", classify)
        monkeypatch.setattr(scope_guard, "_session_events", events)

    def test_refuses_out_of_scope_in_user_language(self, monkeypatch):
        self.patch(monkeypatch, ScopeVerdict(in_scope=False, language="pl"))
        refusal = asyncio.run(scope_guard.scope_refusal("napisz wiersz", SESSION))
        assert refusal == _refusal_for("pl")

    def test_lets_in_scope_through(self, monkeypatch):
        self.patch(monkeypatch, ScopeVerdict(in_scope=True, language="pl"))
        assert asyncio.run(scope_guard.scope_refusal("pogoda", SESSION)) is None

    def test_lets_through_when_classifier_fails(self, monkeypatch):
        self.patch(monkeypatch, None)
        assert asyncio.run(scope_guard.scope_refusal("pogoda", SESSION)) is None

    def test_history_read_failure_still_classifies(self, monkeypatch):
        seen = {}

        async def classify(message, turns):
            seen["turns"] = turns
            return ScopeVerdict(in_scope=False, language="en")

        async def events(session_data):
            raise KeyError("adk_session_id")

        monkeypatch.setattr(scope_guard, "_classify", classify)
        monkeypatch.setattr(scope_guard, "_session_events", events)
        assert asyncio.run(scope_guard.scope_refusal("2+2?", SESSION)) is not None
        assert seen["turns"] == []


class TestChatServiceGate:
    def test_refusal_skips_the_agents(self, monkeypatch):
        monkeypatch.setenv("GOOGLE_API_KEY", "test-key")

        async def refusal(message, session_data):
            return "only trips"

        def no_runner(*args, **kwargs):
            raise AssertionError("agents must not run for off-topic messages")

        monkeypatch.setattr(chat_service, "scope_refusal", refusal)
        monkeypatch.setattr(chat_service, "Runner", no_runner)

        response = asyncio.run(
            chat_service.process_chat_request(ChatRequest(message="2+2?"))
        )
        assert response.success is True
        assert response.data == {"message": "only trips", "sender": "ai"}
        assert response.session_id
