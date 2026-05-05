import asyncio
import os
import re
import json
import logging
from typing import Optional, Tuple

import agent_system.src.multi_tool_agent.agent as agent_module
from google.adk.runners import Runner
from google.genai import types

from .models import ChatRequest, ChatResponse
from .session_manager import session_manager
from .weather_payload import validate_weather_payload
from .hotel_payload import validate_hotel_payload


logger = logging.getLogger(__name__)

# Timeout for the ADK runner. Covers the full round-trip: LLM call(s) + tool
# calls + final response generation. Increase if tools become slower.
_ADK_TIMEOUT_SECONDS = 60

# Matches weather-json, hotel-json, and plain json fenced blocks.
FENCE_PATTERN = re.compile(
    r"```\s*(weather-json|hotel-json|json)\s*\n([\s\S]*?)\n```",
    re.IGNORECASE,
)


def _extract_fenced_json(raw_text: str) -> Optional[Tuple[str, dict]]:
    """Return (fence_type, parsed_dict) for the first fenced JSON block, or None."""
    match = FENCE_PATTERN.search(raw_text)
    if not match:
        return None
    fence_type = match.group(1).lower()
    json_body = match.group(2).strip()
    return fence_type, json.loads(json_body)


def _normalize_agent_response(raw_text: str) -> str:
    if not raw_text:
        return "[Agent error] No response content"

    match = FENCE_PATTERN.search(raw_text)
    if match:
        human_text = raw_text[:match.start()].strip()
        fence_type = match.group(1).lower()
        json_body = match.group(2).strip()
        return (human_text + "\n\n" if human_text else "") + f"```{fence_type}\n{json_body}\n```"

    return raw_text


def _detect_error_in_response(raw_text: str) -> Tuple[bool, Optional[str], Optional[str], Optional[dict]]:
    """
    Detect if the agent response contains an error.
    Agent returns errors in fenced blocks as {"error": "message"}.

    Returns:
        (is_error, error_message, fence_type, json_payload)
    """
    if not raw_text:
        return True, "No response content from agent.", None, None

    try:
        result = _extract_fenced_json(raw_text)
    except (json.JSONDecodeError, TypeError) as exc:
        return True, f"Agent returned malformed JSON: {exc}", None, None

    if result is not None:
        fence_type, parsed_json = result
        if isinstance(parsed_json, dict) and "error" in parsed_json:
            error_msg = parsed_json["error"]
            if error_msg:
                return True, str(error_msg), fence_type, parsed_json
            return True, "Agent encountered an error.", fence_type, parsed_json
        return False, None, fence_type, parsed_json

    return False, None, None, None


def _validate_payload(fence_type: str, payload: dict) -> None:
    """Route payload validation to the correct validator based on fence type and kind."""
    kind = payload.get("meta", {}).get("kind") if isinstance(payload, dict) else None

    if fence_type == "hotel-json" or kind == "hotels":
        validate_hotel_payload(payload)
    else:
        validate_weather_payload(payload)


async def process_chat_request(request: ChatRequest) -> ChatResponse:
    """
    Process a chat request through the ADK agent and return a ChatResponse.

    Always returns ChatResponse (success=True or success=False) — never raises.
    HTTP status is always 200; callers check response.success for error state.
    """
    session_data: Optional[dict] = None
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            return ChatResponse(
                success=False,
                error="AI chat is not available. GOOGLE_API_KEY is not configured.",
            )

        session_manager.cleanup_expired_sessions()
        session_data = await session_manager.ensure_session(request.session_id)

        runner = Runner(
            agent=agent_module.root_agent,
            app_name="weather_center",
            session_service=session_manager.session_service,
        )
        content = types.Content(role="user", parts=[types.Part(text=request.message)])

        try:
            async with asyncio.timeout(_ADK_TIMEOUT_SECONDS):
                events = runner.run_async(
                    user_id=session_data["user_id"],
                    session_id=session_data["adk_session_id"],
                    new_message=content,
                )
                async for event in events:
                    if event.is_final_response():
                        raw_text = ""
                        if getattr(event, "content", None) and getattr(event.content, "parts", None):
                            parts_text = [
                                text
                                for part in event.content.parts
                                if (text := getattr(part, "text", None))
                            ]
                            raw_text = "\n".join(parts_text).strip()

                        is_error, error_message, fence_type, json_payload = _detect_error_in_response(raw_text)
                        if is_error:
                            return ChatResponse(
                                success=False,
                                error=error_message,
                                session_id=session_data["session_id"],
                            )

                        if json_payload is not None:
                            try:
                                _validate_payload(fence_type or "", json_payload)
                            except ValueError as exc:
                                return ChatResponse(
                                    success=False,
                                    error=f"Invalid response data: {exc}",
                                    session_id=session_data["session_id"],
                                )

                        normalized = _normalize_agent_response(raw_text)
                        return ChatResponse(
                            success=True,
                            data={"message": normalized, "sender": "ai"},
                            session_id=session_data["session_id"],
                        )

        except TimeoutError:
            logger.warning("ADK runner timed out after %s seconds", _ADK_TIMEOUT_SECONDS)
            return ChatResponse(
                success=False,
                error="The request timed out. Please try again.",
                session_id=session_data["session_id"] if session_data else None,
            )

        logger.warning("ADK runner finished without a final response event")
        return ChatResponse(
            success=False,
            error="No response from agent. Please try again.",
            session_id=session_data["session_id"] if session_data else None,
        )

    except Exception:
        logger.exception("Unexpected error in chat endpoint")
        return ChatResponse(
            success=False,
            error="An unexpected error occurred. Please try again.",
            session_id=session_data["session_id"] if session_data else None,
        )
