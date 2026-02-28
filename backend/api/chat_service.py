import os
import re
import json
import logging
from typing import Optional, Tuple

import agent_system.src.multi_tool_agent.agent as agent_module
from fastapi import HTTPException, status
from google.adk.runners import Runner
from google.genai import types

from .models import ChatRequest, ChatResponse
from .session_manager import session_manager
from .weather_payload import validate_weather_payload


logger = logging.getLogger(__name__)

FENCE_PATTERN = re.compile(
    r"```\s*(weather-json|json)\s*\n([\s\S]*?)\n```",
    re.IGNORECASE,
)


def _raise_http_error(
    message: str,
    status_code: int,
    session_id: Optional[str] = None,
) -> None:
    detail = {"error": message}
    if session_id:
        detail["session_id"] = session_id
    raise HTTPException(status_code=status_code, detail=detail)


def _extract_fenced_json(raw_text: str) -> Optional[dict]:
    match = FENCE_PATTERN.search(raw_text)
    if not match:
        return None
    json_body = match.group(2).strip()
    return json.loads(json_body)


def _normalize_agent_response(raw_text: str) -> str:
    if not raw_text:
        return "[Agent error] No response content"

    match = FENCE_PATTERN.search(raw_text)
    if match:
        human_text = raw_text[:match.start()].strip()
        json_body = match.group(2).strip()
        return (human_text + "\n\n" if human_text else "") + f"```weather-json\n{json_body}\n```"

    return raw_text


def _detect_error_in_response(raw_text: str) -> Tuple[bool, Optional[str], Optional[dict]]:
    """
    Detect if the agent response contains an error.
    Agent returns errors in fenced blocks as {"error": "message"}.

    Returns:
        (is_error, error_message, json_payload)
    """
    if not raw_text:
        return True, "[Agent error] No response content", None

    try:
        parsed_json = _extract_fenced_json(raw_text)
    except (json.JSONDecodeError, TypeError) as exc:
        return True, f"[Agent error] Invalid JSON in weather-json block: {exc}", None

    if parsed_json is not None:
        if isinstance(parsed_json, dict) and "error" in parsed_json:
            error_msg = parsed_json["error"]
            if error_msg:
                return True, str(error_msg), parsed_json
            return True, "[Agent error] Error detected in response", parsed_json
        return False, None, parsed_json

    return False, None, None


async def process_chat_request(request: ChatRequest) -> ChatResponse:
    session_data: Optional[dict] = None
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            _raise_http_error(
                "AI chat is not available. Please set the GOOGLE_API_KEY environment variable.",
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        session_manager.cleanup_expired_sessions()
        session_data = await session_manager.ensure_session(request.session_id)

        runner = Runner(
            agent=agent_module.root_agent,
            app_name="weather_center",
            session_service=session_manager.session_service,
        )
        content = types.Content(role="user", parts=[types.Part(text=request.message)])

        events = runner.run_async(
            user_id=session_data["user_id"],
            session_id=session_data["adk_session_id"],
            new_message=content,
        )
        async for event in events:
            if event.is_final_response():
                raw_text = ""
                if getattr(event, "content", None) and getattr(event.content, "parts", None):
                    parts_text = []
                    for part in event.content.parts:
                        text = getattr(part, "text", None)
                        if text:
                            parts_text.append(text)
                    raw_text = "\n".join(parts_text).strip()

                # Detect if response contains an error
                is_error, error_message, json_payload = _detect_error_in_response(raw_text)
                
                if is_error:
                    _raise_http_error(
                        error_message or "[Agent error] Error detected in response",
                        status.HTTP_502_BAD_GATEWAY,
                        session_id=session_data["session_id"],
                    )

                if json_payload is not None:
                    try:
                        validate_weather_payload(json_payload)
                    except ValueError as exc:
                        _raise_http_error(
                            f"Invalid weather-json payload: {exc}",
                            status.HTTP_502_BAD_GATEWAY,
                            session_id=session_data["session_id"],
                        )
                
                # Normal response - normalize and return
                normalized = _normalize_agent_response(raw_text)

                return ChatResponse(
                    success=True,
                    data={"message": normalized, "sender": "ai"},
                    session_id=session_data["session_id"],
                )

        _raise_http_error(
            "[Agent error] No response from agent.",
            status.HTTP_502_BAD_GATEWAY,
            session_id=session_data["session_id"] if session_data else request.session_id,
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Chat endpoint error")
        _raise_http_error(
            f"Error: {exc}",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            session_id=session_data["session_id"] if session_data else request.session_id,
        )

