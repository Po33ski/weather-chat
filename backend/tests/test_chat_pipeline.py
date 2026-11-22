import asyncio
import json
import threading

import httpx
from google.adk.agents import Agent
from google.adk.models.base_llm import BaseLlm
from google.adk.models.llm_response import LlmResponse
from google.adk.tools.agent_tool import AgentTool
from google.genai import types
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

import api.chat_service as chat_service
import api.main as main
from api.models import ChatRequest, ChatResponse


class ScriptedLlm(BaseLlm):
    """Offline model: optionally calls one tool, then returns a fixed reply."""

    model: str = "scripted"
    tool: str = ""
    args: dict = {}
    loop: bool = False
    reply: str = "done"

    async def generate_content_async(self, llm_request, stream=False):
        parts = llm_request.contents[-1].parts or []
        answered = any(part.function_response for part in parts)
        if self.tool and (self.loop or not answered):
            part = types.Part(
                function_call=types.FunctionCall(name=self.tool, args=self.args)
            )
        else:
            part = types.Part(text=self.reply)
        yield LlmResponse(content=types.Content(role="model", parts=[part]))


def use_agent(monkeypatch, agent: Agent) -> None:
    async def in_scope(message, session_data):
        return None

    monkeypatch.setenv("GOOGLE_API_KEY", "test-key")
    monkeypatch.setattr(chat_service, "scope_refusal", in_scope)
    monkeypatch.setattr(chat_service.agent_module, "root_agent", agent)


class TestChatPipeline:
    def test_blocking_tool_does_not_stall_the_event_loop(self, monkeypatch):
        started = threading.Event()
        released = threading.Event()
        seen = {}

        def blocking_tool() -> dict:
            """Waits for a signal only a running event loop can send."""
            started.set()
            seen["released"] = released.wait(timeout=2)
            return {"ok": True}

        use_agent(
            monkeypatch,
            Agent(
                name="test_root",
                model=ScriptedLlm(tool="blocking_tool"),
                tools=[blocking_tool],
            ),
        )

        async def scenario():
            async def release():
                while not started.is_set():
                    await asyncio.sleep(0.005)
                released.set()

            releaser = asyncio.create_task(release())
            response = await chat_service.process_chat_request(ChatRequest(message="x"))
            await releaser
            return response

        assert asyncio.run(scenario()).success is True
        assert seen["released"] is True

    def test_client_receives_the_sanitized_payload(self, monkeypatch):
        payload = {
            "meta": {"city": "Warsaw", "kind": "hotels", "language": "en"},
            "hotels": [{"name": "H", "url": "javascript:alert(1)", "rating": 42}],
        }
        reply = f"Hotels\n\n```hotel-json\n{json.dumps(payload)}\n```"
        use_agent(monkeypatch, Agent(name="test_root", model=ScriptedLlm(reply=reply)))

        response = asyncio.run(
            chat_service.process_chat_request(ChatRequest(message="x"))
        )

        assert response.success is True
        _, sent = chat_service._extract_fenced_json(response.data["message"])
        assert sent["hotels"][0]["url"] == ""
        assert sent["hotels"][0]["rating"] is None


class TestLlmCallLimit:
    @staticmethod
    def looping_agent(calls: list[int], name: str = "test_root") -> Agent:
        def ping() -> dict:
            """Records one call."""
            calls.append(1)
            return {"ok": True}

        return Agent(name=name, model=ScriptedLlm(tool="ping", loop=True), tools=[ping])

    @staticmethod
    def assert_stopped(response: ChatResponse, calls: list[int]) -> None:
        assert response.success is False
        assert "too many steps" in response.error
        assert response.session_id
        assert 0 < len(calls) <= chat_service._MAX_LLM_CALLS

    def test_looping_model_is_stopped(self, monkeypatch):
        calls: list[int] = []
        use_agent(monkeypatch, self.looping_agent(calls))

        response = asyncio.run(
            chat_service.process_chat_request(ChatRequest(message="x"))
        )

        self.assert_stopped(response, calls)

    def test_looping_nested_agent_tool_is_stopped(self, monkeypatch):
        calls: list[int] = []
        child = self.looping_agent(calls, name="child")
        root = Agent(
            name="test_root",
            model=ScriptedLlm(tool="child", args={"request": "x"}),
            tools=[AgentTool(child)],
        )
        use_agent(monkeypatch, root)

        response = asyncio.run(
            chat_service.process_chat_request(ChatRequest(message="x"))
        )

        self.assert_stopped(response, calls)


class TestRateLimitClientIdentity:
    @staticmethod
    def post_all(monkeypatch, forwarded_values: list[str]) -> list[int]:
        async def ok(request):
            return ChatResponse(success=True)

        monkeypatch.setattr(main, "process_chat_request", ok)
        app = ProxyHeadersMiddleware(main.app, trusted_hosts="127.0.0.1,10.0.0.0/8")
        transport = httpx.ASGITransport(app=app, client=("127.0.0.1", 50000))

        async def run():
            async with httpx.AsyncClient(
                transport=transport, base_url="http://test"
            ) as client:
                return [
                    (
                        await client.post(
                            "/api/chat",
                            json={"message": "x"},
                            headers={"X-Forwarded-For": value},
                        )
                    ).status_code
                    for value in forwarded_values
                ]

        main.limiter.reset()
        try:
            return asyncio.run(run())
        finally:
            main.limiter.reset()

    def test_forged_leftmost_hop_cannot_reset_the_limit(self, monkeypatch):
        chain = [f"198.51.100.{i}, 203.0.113.7, 10.0.0.1" for i in range(12)]
        statuses = self.post_all(monkeypatch, chain)
        assert statuses.count(200) == 10
        assert statuses.count(429) == 2

    def test_different_clients_have_separate_limits(self, monkeypatch):
        chain = [f"203.0.113.{i}, 10.0.0.1" for i in range(12)]
        assert self.post_all(monkeypatch, chain) == [200] * 12
