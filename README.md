# Weather Center Chat

Weather Center Chat centers on a single conversational experience: users ask for weather insights, and a Google ADK agent replies with short human-friendly text plus a deterministic `weather-json` block that powers the chat UI.

## AI Chat Flow

- `frontend/src/app/views/ChatPage.tsx` renders the chat surface and consumes the `weather-json` payload.
- `/api/chat` (FastAPI) maintains lightweight per-browser sessions and streams prompts into a Google ADK runner.
- The backend concatenates every text part from the agent so the fenced block and the human text arrive as one message and the frontend can split them deterministically.

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

## Project Structure

```
weather-center-chat/
├── backend/
│   ├── api/                    # FastAPI app (endpoints, services)
│   ├── agent_system/           # Google ADK agent(s) + prompts/tools
│   ├── pyproject.toml
│   └── uv.lock
├── frontend/
│   └── src/app/                # Next.js App Router
├── Dockerfile                  # Multi-stage image
├── nginx.conf                  # Nginx static + /api proxy
├── render.yaml                 # Render config
├── env-scratchpad.sh           # Local env helper
└── deploy-production.sh        # One-shot local Docker run
```

- The root agent (Runner) tracks conversation context (city/date/language) and delegates to `get_weather` when it has enough info.
- The specialist enforces the output contract and only calls tool wrappers once the CONTEXT TEMPLATE is complete.

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
# Optional: point the frontend straight at FastAPI without Nginx
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## Docker (single container)

```bash
source env-scratchpad.sh
./deploy-production.sh
```

The script builds the multi-stage image (backend builder → frontend builder → runtime), launches Nginx on port 80, and proxies `/api` requests to FastAPI. Verify readiness with `curl http://localhost/api/health`, then visit `http://localhost:3000` to chat with the assistant.

### Environment Variables

```bash
# Backend (required)
GOOGLE_API_KEY=...
VISUAL_CROSSING_API_KEY=...

# Frontend (optional for local dev without Nginx)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- Keep secrets out of version control; `env-scratchpad.sh` is for local experimentation only.
- Production deployments should omit `NEXT_PUBLIC_API_URL` so the frontend calls relative `/api` routes through Nginx (same-origin).

