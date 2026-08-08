from __future__ import annotations

from typing import Annotated, Any

from pydantic import BaseModel, Field, StringConstraints

# Pydantic Models for API


class ChatRequest(BaseModel):
    # This is a public endpoint: reject blank messages before they burn an
    # LLM call, and cap the size so oversized bodies can't run up API cost.
    message: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)
    ]
    conversation_history: list[dict[str, Any]] = Field(default_factory=list)
    session_id: Annotated[str, StringConstraints(max_length=128)] | None = None


class ChatResponse(BaseModel):
    success: bool
    data: dict[str, Any] | None = None
    error: str | None = None
    session_id: str | None = None
