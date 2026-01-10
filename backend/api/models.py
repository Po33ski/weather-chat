from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date


# Pydantic Models for API


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[Dict[str, Any]]  # Each entry must include text and sender
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    session_id: Optional[str] = None
