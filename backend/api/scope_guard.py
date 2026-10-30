import asyncio
import logging
import os
import re
from typing import Any, Iterable, Optional

from google import genai
from google.genai import types
from pydantic import BaseModel

from agent_system.src.utils.load_env_data import load_model

from .scope_prompt import SCOPE_INSTRUCTION
from .session_manager import APP_NAME, session_manager

logger = logging.getLogger(__name__)

# The guard is a cheap pre-filter, not a feature: when the classifier is slow
# or down, the message goes through and the SCOPE rules in the agent prompts
# still apply. Must fit in the 20 s left between the frontend's 120 s timeout
# and the 100 s ADK budget.
_SCOPE_TIMEOUT_SECONDS = 8

# Earlier turns shown to the classifier, so short follow-ups ("and tomorrow?",
# "a tańsze?") are judged in context instead of rejected as meaningless.
_HISTORY_TURNS = 4
_HISTORY_TURN_MAX_CHARS = 300

_DATE_HEADER_PATTERN = re.compile(r"^\[Today is [^\]]*\]\s*")
_FENCED_BLOCK_PATTERN = re.compile(r"```[\s\S]*?```")

_REFUSALS = {
    "pl": (
        "Pomagam tylko w planowaniu podróży: pogoda, atrakcje w miastach "
        "i wyszukiwanie hoteli. Zapytaj np. „Jaka będzie pogoda w Krakowie "
        "w weekend?”"
    ),
    "en": (
        "I can only help with trip planning: weather, attractions in cities, "
        "and hotel search. Try asking, for example, \"What's the weather "
        'in Kraków this weekend?"'
    ),
}


class ScopeVerdict(BaseModel):
    in_scope: bool
    language: str


_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    # Created lazily: genai.Client raises without an API key, and the app
    # must still start when GOOGLE_API_KEY is missing.
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    return _client


def _recent_turns(
    events: Iterable[Any], limit: int = _HISTORY_TURNS
) -> list[tuple[str, str]]:
    """Return the last `limit` (role, text) turns from ADK session events.

    Tool calls, thoughts and partial chunks are skipped; the date header and
    fenced JSON blocks are stripped because they only add noise and tokens.
    """
    turns: list[tuple[str, str]] = []
    for event in events:
        content = getattr(event, "content", None)
        parts = getattr(content, "parts", None) or []
        is_user = getattr(event, "author", None) == "user"
        if not is_user and not event.is_final_response():
            continue
        text = "\n".join(
            part.text
            for part in parts
            if getattr(part, "text", None) and not getattr(part, "thought", False)
        )
        if is_user:
            text = _DATE_HEADER_PATTERN.sub("", text)
        else:
            text = _FENCED_BLOCK_PATTERN.sub("", text)
        text = text.strip()
        if text:
            turns.append(
                ("user" if is_user else "assistant", text[:_HISTORY_TURN_MAX_CHARS])
            )
    return turns[-limit:] if limit > 0 else []


def _build_classifier_input(message: str, turns: list[tuple[str, str]]) -> str:
    history = "\n".join(f"{role}: {text}" for role, text in turns) or "(none)"
    return (
        f"<conversation>\n{history}\n</conversation>\n\n"
        f"<latest_message>\n{message}\n</latest_message>"
    )


def _refusal_for(language: str) -> str:
    code = (language or "").strip().lower()[:2]
    return _REFUSALS.get(code, _REFUSALS["en"])


async def _classify(
    message: str, turns: list[tuple[str, str]]
) -> Optional[ScopeVerdict]:
    """Ask the model whether the message is in scope. None means "unknown"."""
    try:
        async with asyncio.timeout(_SCOPE_TIMEOUT_SECONDS):
            response = await _get_client().aio.models.generate_content(
                model=load_model(),
                contents=_build_classifier_input(message, turns),
                config=types.GenerateContentConfig(
                    system_instruction=SCOPE_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=ScopeVerdict,
                    temperature=0,
                ),
            )
    except Exception as exc:
        logger.warning("Scope check failed, letting the message through: %r", exc)
        return None

    verdict = response.parsed
    if isinstance(verdict, ScopeVerdict):
        return verdict
    logger.warning("Scope check returned no usable verdict, letting it through")
    return None


async def _session_events(session_data: dict) -> list[Any]:
    session = await session_manager.session_service.get_session(
        app_name=APP_NAME,
        user_id=session_data["user_id"],
        session_id=session_data["adk_session_id"],
    )
    return list(session.events) if session else []


async def scope_refusal(message: str, session_data: dict) -> Optional[str]:
    """Return a fixed refusal if the message is off-topic, otherwise None.

    Fails open (returns None) on any error, so the guard can never take the
    chat down — the prompt-level SCOPE rules are the second line of defense.
    """
    try:
        turns = _recent_turns(await _session_events(session_data))
    except Exception as exc:
        logger.warning("Could not read session history for scope check: %r", exc)
        turns = []

    verdict = await _classify(message, turns)
    if verdict is None or verdict.in_scope:
        return None

    logger.info("Scope guard rejected an out-of-scope message")
    return _refusal_for(verdict.language)
