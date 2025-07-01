from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent_system.src.utils.load_env_data import load_env_data
import agent_system.src.multi_tool_agent.agent as agent_module
from agent_system.src.multi_tool_agent.agent import root_agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types
import asyncio

import os

# Load environment variables (if needed)
load_env_data()

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    conversation_history: list

class ChatResponse(BaseModel):
    message: str
    sender: str = "ai"

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    user_message = request.message
    # Setup session and runner
    session_service = InMemorySessionService()
    session = session_service.create_session(app_name="weather_center", user_id="user")
    runner = Runner(agent=agent_module.root_agent, app_name="weather_center", session_service=session_service)
    content = types.Content(role='user', parts=[types.Part(text=user_message)])
    events = runner.run_async(user_id="user", session_id=session.id, new_message=content)
    async for event in events:
        if event.is_final_response():
            # Get the text from the agent's response
            text = event.content.parts[0].text if event.content and event.content.parts else "[Agent error] No response content"
            return ChatResponse(message=text or "[Agent error] No response content")
    return ChatResponse(message="[Agent error] No response from agent.") 