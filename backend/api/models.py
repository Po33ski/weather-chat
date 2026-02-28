from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


# Pydantic Models for API


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[dict[str, Any]] = Field(default_factory=list)
    session_id: str | None = None

class ChatResponse(BaseModel):
    success: bool
    data: dict[str, Any] | None = None
    error: str | None = None
    session_id: str | None = None

