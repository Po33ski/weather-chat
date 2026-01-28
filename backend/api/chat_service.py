import os
import re
import json
from typing import Optional, Tuple

import agent_system.src.multi_tool_agent.agent as agent_module
from google.adk.runners import Runner
from google.genai import types

from .models import ChatRequest, ChatResponse
from .session_manager import session_manager


def _missing_env_response() -> ChatResponse:
    return ChatResponse(
        success=False,
        error="AI chat is not available. Please set the GOOGLE_API_KEY environment variable.",
    )


def _normalize_agent_response(raw_text: str) -> str:
    if not raw_text:
        return "[Agent error] No response content"

    fence_pattern = re.compile(r"```\s*(weather-json|json)\s*\n([\s\S]*?)\n```", re.IGNORECASE)
    match = fence_pattern.search(raw_text)
    if match:
        human_text = raw_text[:match.start()].strip()
        json_body = match.group(2).strip()
        return (human_text + "\n\n" if human_text else "") + f"```weather-json\n{json_body}\n```"

    return raw_text


def _detect_error_in_response(raw_text: str) -> Tuple[bool, Optional[str]]:
    """
    Detect if the agent response contains an error.
    Agent returns errors in fenced blocks as {"error": "message"}.
    
    Returns:
        Tuple[bool, Optional[str]]: (is_error, error_message)
        - is_error: True if error detected, False otherwise
        - error_message: Extracted error message if error found, None otherwise
    """
    if not raw_text:
        return True, "[Agent error] No response content"
    
    # Check fenced blocks (weather-json or json) for error
    fence_pattern = re.compile(r"```\s*(weather-json|json)\s*\n([\s\S]*?)\n```", re.IGNORECASE)
    match = fence_pattern.search(raw_text)
    
    if match:
        json_body = match.group(2).strip()
        try:
            parsed_json = json.loads(json_body)
            # If JSON contains an "error" key, it's an error response
            if isinstance(parsed_json, dict) and "error" in parsed_json:
                error_msg = parsed_json["error"]
                if error_msg:
                    return True, str(error_msg)
        except (json.JSONDecodeError, TypeError):
            # If JSON parsing fails, it's not a valid error format
            pass
    
    # No error detected
    return False, None


async def process_chat_request(request: ChatRequest) -> ChatResponse:
    session_data: Optional[dict] = None
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            return _missing_env_response()

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
                is_error, error_message = _detect_error_in_response(raw_text)
                
                if is_error:
                    # Return error response
                    return ChatResponse(
                        success=False,
                        error=error_message or "[Agent error] Error detected in response",
                        session_id=session_data["session_id"],
                    )
                
                # Normal response - normalize and return
                normalized = _normalize_agent_response(raw_text)

                return ChatResponse(
                    success=True,
                    data={"message": normalized, "sender": "ai"},
                    session_id=session_data["session_id"],
                )

        return ChatResponse(
            success=False,
            error="[Agent error] No response from agent.",
            session_id=session_data["session_id"],
        )
    except Exception as exc:  # noqa: BLE001
        print(f"Chat endpoint error: {exc}")
        return ChatResponse(
            success=False,
            error=f"Error: {exc}",
            session_id=session_data["session_id"] if session_data else request.session_id,
        )

