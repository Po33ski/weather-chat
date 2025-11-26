# Weather Center Chat

Weather Center Chat pairs a statically exported Next.js interface with a FastAPI backend and a Google ADK agent graph. Users ask for weather insights, the agent replies with a short natural-language summary plus a deterministic `weather-json` block, and the frontend renders both the chat bubble and a structured weather panel in real time. The experience is intentionally chat-first, with supporting dashboards for current, forecast, and historical weather so the AI responses can be visualized instantly.

The UI is fully responsive and ships inside the same container as the backend: Nginx serves the static export and proxies `/api` calls to FastAPI. No external database is required—the backend keeps lightweight Google ADK sessions in memory per browser session.

## Features

- AI chat powered by Google ADK, returning human text + `weather-json`
- Weather data via Visual Crossing: current, 15-day forecast, and history
- Multi-language UX (EN/PL) and unit toggles (Metric / US / UK)
- Static Next.js export served by Nginx alongside the API
- Single Docker image for local and production deployments

## Architecture

- **Frontend (Next.js App Router, TypeScript, Tailwind)**
  - `ChatPage` renders the conversation UI + `AiWeatherPanel`
  - `parseAiMessage` splits agent replies into `humanText` and structured data
  - `LanguageProvider` and `UnitSystemContext` drive formatting
  - Static export (`output: 'export'`) lives in `frontend/out`
- **Backend (FastAPI)**
  - `main.py` wires health checks, weather routes, and `/api/chat`
  - `weather_service.py` fetches and normalizes Visual Crossing responses
  - `chat_service.py` streams prompts to the Google ADK runner
  - `session_manager.py` keeps ADK sessions in memory and auto-cleans stale entries
- **Runtime**
  - Nginx serves the static frontend and proxies `/api` back to FastAPI
  - `deploy-production.sh` builds and runs the multi-stage Docker image locally

## AI Chat Flow

- `frontend/src/app/views/ChatPage.tsx` renders the chat bubbles and weather widgets.
- Messages go to `/api/chat`, which boots/refreshes a lightweight ADK session.
- The ADK runner streams the final response; the backend concatenates every text part so the fenced JSON block is never dropped.
- The frontend deterministically separates the human summary from the `weather-json` block and feeds it into `AiWeatherPanel`.

## Google ADK Agent Graph

```
backend/agent_system/src/multi_tool_agent/
├── agent.py                 # root agent stitched into FastAPI
├── prompt.py                # core instructions + context template
├── sub_agents/
│   └── get_weather/
│       ├── agent.py         # specialist enforcing output contract
│       └── prompt.py
└── tools/
    ├── get_current_weather.py
    ├── get_forecast.py
    └── get_history_weather.py
```

- The root agent loads into `google.adk.runners.Runner`, tracks context (city/date/language), and delegates to the weather specialist.
- The weather specialist guarantees every reply follows the `weather-json` contract and only calls tools when the CONTEXT TEMPLATE is complete.
- Tool wrappers call the FastAPI services so the agent stays grounded on deterministic values.

## Local Development (quick start)

Requirements: Python 3.12 with `uv`, Node.js 18+, and API keys for Google Generative AI + Visual Crossing.

```bash
# Backend
cd backend
uv sync
source ../env-scratchpad.sh   # exports GOOGLE_API_KEY, VISUAL_CROSSING_API_KEY
uv run uvicorn api.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
source ../env-scratchpad.sh   # exports NEXT_PUBLIC_GOOGLE_CLIENT_ID
# Optional: override API URL when developing without Nginx
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## Docker (single container)

```bash
source env-scratchpad.sh
./deploy-production.sh
```

- **backend-builder** installs Python deps with `uv`.
- **frontend-builder** runs `npm ci` + `npm run build` to emit the static export.
- **runtime** copies both artifacts, installs Nginx, and launches FastAPI + Nginx via `start.sh`.

Health check: `GET /api/health`

`docker-compose.yml` mirrors the same container locally, binding Nginx to port 80 while passing through the required secrets.

## AI Chat Output Contract

The agent must return a single string containing:

1. A short human summary (1–3 sentences)
2. A fenced JSON block labeled `weather-json`

```weather-json
{
  "meta": {
    "city": "<city>",
    "kind": "current|forecast|history",
    "date": "YYYY-MM-DD|null",
    "date_range": "YYYY-MM-DD..YYYY-MM-DD|null",
    "language": "<ISO 639-1>"
  },
  "current": {                 // for kind=current
    "temp": 18, "tempmax": 19, "tempmin": 12,
    "windspeed": 22, "winddir": 180,
    "pressure": 1016, "humidity": 65,
    "sunrise": "06:12", "sunset": "19:18",
    "conditions": "Light rain"
  },
  "days": [ ... ]              // for kind=forecast/history
}
```

Example backend payload (note: numbers stay unit-agnostic; the UI handles formatting):

````json
{
  "success": true,
  "data": {
    "message": "Light showers over Warsaw today—grab an umbrella.\n\n```weather-json\n{\n  \"meta\": {\n    \"city\": \"Warsaw\",\n    \"kind\": \"forecast\",\n    \"date\": null,\n    \"date_range\": \"2025-11-12..2025-11-19\",\n    \"language\": \"pl\"\n  },\n  \"days\": [\n    {\n      \"datetime\": \"2025-11-12\",\n      \"tempmax\": 6,\n      \"tempmin\": 1,\n      \"windspeed\": 18,\n      \"humidity\": 70,\n      \"conditions\": \"Cloudy\"\n    }\n  ]\n}\n```",
    "sender": "ai"
  },
  "session_id": "..."
}
````

## Getting Started

### Prerequisites

1. **Google Cloud**
   - Enable AI Studio / Generative APIs
   - Create API key → `GOOGLE_API_KEY`
   - Provision OAuth 2.0 Client ID (Web) → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
2. **Visual Crossing**
   - Create `VISUAL_CROSSING_API_KEY`

### Environment Variables

```bash
# Backend
GOOGLE_API_KEY=...
VISUAL_CROSSING_API_KEY=...

# Frontend
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...

# Optional
ENVIRONMENT=development|production
PUBLIC_WEB_ORIGIN=https://your-domain   # only if doing cross-origin dev
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints (summary)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health`, `/api/health` | Runtime + dependency checks |
| POST | `/api/weather/current` | Current conditions |
| POST | `/api/weather/forecast` | Up-to-15-day forecast |
| POST | `/api/weather/history` | Historical slice for a date range |
| POST | `/api/chat` | Chat with the Google ADK agent |

## Frontend Overview

- Project layout lives under `frontend/src/app/` with feature folders for components, contexts, hooks, services, and views.
- `ContextProviderComponent` exposes language, city, unit-system, and modal state so every page reads consistent global data.
- `AiWeatherPanel` renders:
  - `WeatherView` for `kind=current`
  - `List` for `kind=forecast` or `kind=history`
- `parseAiMessage` separates the `weather-json` fence from the chat text, returning `AiMeta` + `AiChatData` for visualization.

## Backend Overview

- `models.py` defines the request/response contracts shared with the frontend.
- `weather_service.py` normalizes Visual Crossing responses into typed Pydantic models.
- `chat_service.py` streams prompts to the Google ADK runner, normalizes the reply, and returns both the message and session id.
- `session_manager.py` maintains in-memory sessions via `google.adk.sessions.InMemorySessionService`, cleaning idle ones every time a request arrives.

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

## Notes & Tips

- The chat UI parses AI responses into two pieces: human text → chat bubble; `weather-json` → `AiWeatherPanel`.
- Language detection lives entirely inside the agent prompts; the backend simply forwards text.
- Because ADK sessions stay in memory, restarting the backend resets conversations—store `session_id` on the client if you need continuity between reloads.
- Use `test_local.py` to smoke-test `/health`, `/api/chat`, and other critical endpoints once the stack is running.

## Render / Production Deployment

- Use `render.yaml` (Docker environment) to deploy the multi-stage image.
- Provide the same environment variables in the Render dashboard; no database configuration is required.
- Always use same-origin calls in production—keep `NEXT_PUBLIC_API_URL` unset so the frontend talks to relative `/api` paths through Nginx.
