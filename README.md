# Weather Center Chat

Weather Center Chat focuses on a single conversational experience: users ask for weather insights, and the app orchestrates Google ADK agents to produce concise human responses plus a structured `weather-json` payload that powers the chat UI.

## AI Chat Flow

- A Next.js chat surface (`frontend/src/app/views/ChatPage.tsx`) renders the human-friendly message and consumes the structured `weather-json` block returned by the agent.
- The FastAPI backend exposes `/api/chat`, keeps lightweight per-browser sessions alive, and pipes user prompts into a Google ADK runner.
- The response travels back as one string that combines chat text and the fenced JSON block so the frontend can deterministically split it.

## Google ADK Agent Graph

```
backend/agent_system/src/multi_tool_agent/
├── agent.py                 # root agent stitched into FastAPI
├── prompt.py                # global instructions/shared context template
├── sub_agents/
│   └── get_weather/
│       ├── agent.py         # specialist enforcing output contract
│       └── prompt.py
└── tools/
    ├── get_current_weather.py
    ├── get_forecast.py
    └── get_history_weather.py
```

- The root agent loads into a `google.adk.runners.Runner`, maintains the chat context (city, date range, unit system), and decides when to delegate to the weather specialist.
- The weather specialist ensures every reply follows the `weather-json` contract and only calls tools when the context is complete.
- Tool wrappers read normalized weather data from the backend service, keeping the agent grounded on deterministic values instead of free-form hallucinations.

## Local Development (quick start)

Requirements: Python 3.12 with `uv`, Node.js 18+, and API keys for Google Generative AI + Visual Crossing.

```bash
# 1. Backend
cd backend
uv sync
source ../env-scratchpad.sh   # exports GOOGLE_API_KEY, VISUAL_CROSSING_API_KEY
uv run uvicorn api.main:app --reload --port 8000

# 2. Frontend (new terminal)
cd frontend
npm install
source ../env-scratchpad.sh   # exports NEXT_PUBLIC_GOOGLE_CLIENT_ID
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## Docker (single container)

```bash
source env-scratchpad.sh
./deploy-production.sh
```

The script builds the multi-stage image (backend builder → frontend builder → runtime), launches Nginx on port 80, and proxies `/api` requests to FastAPI. Use `curl http://localhost/api/health` to confirm the stack is ready.

Visit `http://localhost:3000`, sign in, and start chatting—the assistant will stream Google ADK-backed weather answers into the single-page experience.
