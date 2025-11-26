# Weather Center Chat

Weather Center Chat blends a statically exported Next.js interface with a FastAPI backend and Google ADK agents so authenticated users can ask for weather insights in natural language. It serves concise answers, renders structured dashboards for current, forecast, and historical conditions, and keeps the transport format predictable for downstream integrations. The product ships with four primary pages: Chat, Current Weather, Forecast, and History - but only with the Chat experience acting as the hero view for demos because it showcases the Google ADK orchestration and how agent responses feed the frontend widgets.

AI-powered weather portal with a modern Next.js frontend and a FastAPI backend. Get current, forecast, and historical weather, and chat with an AI assistant (Google ADK). Sign in with Google OAuth or TOTP.

The interface is fully responsive, scaling cleanly from mobile to widescreen layouts. The `.github` directory holds the CI/CD workflows that run automated tests and coordinate GitHub-based deployments.

## Features

- Weather: current, 15-day forecast, and history
- AI chat (Google ADK): answers in natural language + structured JSON payload
- Auth: Google OAuth + optional TOTP (QR-code)
- i18n: EN/PL via `LanguageContext`
- Unit systems: METRIC / UK / US via `UnitSystemContext`
- Single Docker image: Nginx serves static Next export and proxies `/api` → FastAPI

## Architecture

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
  - Static export (`output: 'export'`) served by Nginx
  - Chat UI (`Chat.tsx`) splits AI message into:
    - humanText (short text for chat bubble)
    - weather-json (fenced block) → parsed on frontend
  - AiWeatherPanel: renders parsed data
    - kind=current → `WeatherView` (tiles)
    - kind=forecast/history → `List` (table)
- Backend: FastAPI
  - Weather: Visual Crossing API client
  - AI: Google ADK agent (get_weather) with strict output format
  - Auth: Google OAuth, TOTP endpoints
- Runtime: Nginx (static + reverse proxy)
- CI/CD: GitHub Actions workflows in `.github/workflows/` keep `main` lean and build/test deployment artifacts from `deploy`.

## AI Agent System

Agent code lives in `backend/agent_system/src/multi_tool_agent/` and follows the Google ADK (Application Development Kit) patterns:

```
backend/agent_system/src/multi_tool_agent/
├── agent.py
├── prompt.py
├── sub_agents/
│   └── get_weather/
│       ├── agent.py
│       └── prompt.py
└── tools/
    ├── get_current_weather.py
    ├── get_forecast.py
    └── get_history_weather.py
```

- `root_agent` (`agent.py`) is the entry point that the FastAPI chat endpoint loads into a `google.adk.runners.Runner`. Its prompt maintains a context template (city, dates, unit system, requested weather slice) and decides when the user message contains enough information to delegate work to the weather specialist.
- `get_weather_agent` (`sub_agents/get_weather/agent.py`) is the specialist child agent. Its instruction set enforces strict output formatting (short human text followed by exactly one fenced `weather-json` block) and validates the context template before calling tools.
- The three tool functions wrap our backend weather service and expose current, forecast, and historical queries. They always return normalized JSON from the curated weather dataset, which keeps the agent grounded on deterministic facts. The result behaves like a lightweight grounding/RAG layer—even though there is no embedding index—because the agent never hallucinates outside the structured payload that the service returns. A full-blown RAG stack (vector store + hybrid retrieval) lives in another project of mine.
- `load_env_data.py` centralizes model selection (`MODEL` defaults to `gemini-2.5-flash`) and API key loading so both the backend runtime and the agent tools see the same configuration. 

During a chat request the backend reuses a single `InMemorySessionService` to keep Google ADK sessions alive per user. The runner streams events, concatenates all text parts from the final message, and the endpoint rewrites the payload so the frontend can reliably parse the fenced JSON block.

## Backend

The FastAPI service in `backend/api/` exposes REST endpoints plus the streaming chat bridge. Key modules:

- `main.py` wires routes, CORS, health checks, the chat pipeline, and authentication flows.
- `weather_service.py` calls the Visual Crossing API, normalizes responses into `WeatherData` Pydantic models, and supports current, forecast, and historical queries.
- `auth_service.py` mixes Google OAuth sign-in, optional TOTP verification, and Peewee models stored in the local SQLite file (`backend/database.db`). ADK sessions stay in memory but user metadata persists.
- `models.py` defines typed request/response schemas for all endpoints so shared contracts stay explicit.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health`, `/api/health` | Runtime and environment status (also used by Docker health checks) |
| POST | `/api/auth/google` | Google OAuth sign-in and ADK session bootstrap |
| POST | `/api/auth/logout` | Invalidate app session and clean ADK bindings |
| GET | `/api/auth/session/{session_id}` | Retrieve session metadata for hydration on the client |
| POST | `/api/auth/totp/setup` | Generate a QR code (PNG) and secret for TOTP users |
| POST | `/api/auth/totp/verify` | Verify a 6-digit code and mint an application session |
| GET | `/api/auth/totp/status/{email}` | Check whether TOTP is already configured |
| POST | `/api/weather/current` | Current conditions via Visual Crossing |
| POST | `/api/weather/forecast` | Up-to-15-day forecast |
| POST | `/api/weather/history` | Historical slice for a date range |
| POST | `/api/chat` | Proxy between the frontend and the Google ADK agent graph |

FastAPI is a great fit here because the project stays compact, we rely heavily on Pydantic models for validation, and the async-first design meshes with Google ADK’s streaming interface without extra ceremony. Staying in Python also means the agent scaffolding, Peewee ORM, and application code share one language, which keeps the integration with Google ADK’s Python SDK frictionless.

The backend ships via a single Docker image (`Dockerfile`) that:
- Builds Python dependencies with `uv`, then installs the frontend.
- Runs `npm run build` to generate a static export of the Next.js app.
- Starts FastAPI (`uvicorn`) and Nginx together with `start.sh`, where Nginx serves the static export and proxies `/api` back to the Python service.

Environment variables you must provide include `VISUAL_CROSSING_API_KEY`, `GOOGLE_API_KEY`, and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; `env-scratchpad.sh` is a helper for local development.

The chat endpoint returns the short human summary followed by the fenced JSON block inside the single `message` field so the frontend can split the two parts deterministically:

````json
{
  "success": true,
  "data": {
    "message": "Light showers over Warsaw today—grab an umbrella.\n\n```weather-json\n{\n  \"meta\": {\n    \"city\": \"Warsaw\",\n    \"kind\": \"forecast\",\n    \"date\": null,\n    \"date_range\": \"2025-11-12..2025-11-19\",\n    \"language\": \"pl\",\n    \"unit_system\": \"METRIC\"\n  },\n  \"days\": [\n    {\n      \"datetime\": \"2025-11-12\",\n      \"tempmax\": 6,\n      \"tempmin\": 1,\n      \"windspeed\": 18,\n      \"humidity\": 70,\n      \"conditions\": \"Cloudy\"\n    }\n  ]\n}\n```",
    "sender": "ai"
  }
}
````

## Frontend

The frontend (`frontend/`) is a Next.js 14 App Router project written in TypeScript and styled with Tailwind CSS. The layout component wraps the entire tree in shared providers so chat, dashboards, and supporting pages all read consistent state.

- Project layout: `src/app/` holds routes, views, and feature folders such as `components/`, `hooks/`, `contexts/`, `services/`, `utils/`, and `views/`. The root page renders `ChatPage`, which couples the conversation area with the AI-driven weather panel.
- Static export: `next.config.mjs` sets `output: 'export'`, so `npm run build` produces `/frontend/out`. Nginx (see `nginx.conf`) serves those files and proxies any `/api/*` request to FastAPI, letting us ship a single container.
- Custom hooks:
  - `useAuthService` centralizes Google Identity Services, TOTP flows, localStorage hydration, and session validation.
  - `useLocalStorage` provides an SSR-safe wrapper that syncs across tabs via `StorageEvent`.
  - `useIsAuthenticated` offers a lightweight flag for components that only need to know whether a user is signed in.
- Context providers (`ContextProviderComponent`) expose language, unit system, city, auth, and modal state. The language and unit contexts drive formatting so the UI can interpret the raw numbers supplied by the agent.
- Authentication: the `AuthWindow` component renders both the Google OAuth button and the `TotpAuth` flow. The client exchanges tokens with the backend endpoints listed above and stores session state in localStorage.
- AI response handling: when `/api/chat` returns a message, `parseAiMessage` strips out the fenced `weather-json` block, returning `humanText` for the chat bubble and `AiMeta`/`AiChatData` for the visualization layer. `AiWeatherPanel` then renders current conditions, forecast tables, or historical lists depending on `meta.kind`. A typical payload looks like:

```weather-json
{
  "meta": {
    "city": "Warsaw",
    "kind": "forecast",
    "date": null,
    "date_range": "2025-11-12..2025-11-19",
    "language": "pl",
    "unit_system": "METRIC"
  },
  "days": [
    { "datetime": "2025-11-12", "tempmax": 6, "tempmin": 1, "windspeed": 18, "humidity": 70, "conditions": "Cloudy" }
  ]
}
```

Because the frontend splits the response into chat-facing text and structured data for widgets, the UI stays resilient even if additional AI metadata appears in the JSON.

Nginx adds gzip compression, long-lived caching headers for static assets, and disables caching for HTML so the App Router’s prerendered pages stay fresh. In development you can bypass Nginx by pointing `NEXT_PUBLIC_API_URL` at your FastAPI port and running `npm run dev`.

## AI Chat Output Contract

The agent must return a single string with:

1) Short human text (1–3 sentences)
2) One fenced JSON block labeled `weather-json`:

```weather-json
{
  "meta": {
    "city": "<city>",
    "kind": "current|forecast|history",
    "date": "YYYY-MM-DD|null",
    "date_range": "YYYY-MM-DD..YYYY-MM-DD|null",
    "language": "<lang>",
    "unit_system": "US|METRIC|UK"
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

Example backend payload combining both the chat-friendly text and the fenced JSON:

````json
{
  "success": true,
  "data": {
    "message": "Light showers over Warsaw today—grab an umbrella.\n\n```weather-json\n{\n  \"meta\": {\n    \"city\": \"Warsaw\",\n    \"kind\": \"forecast\",\n    \"date\": null,\n    \"date_range\": \"2025-11-12..2025-11-19\",\n    \"language\": \"pl\",\n    \"unit_system\": \"METRIC\"\n  },\n  \"days\": [\n    {\n      \"datetime\": \"2025-11-12\",\n      \"tempmax\": 6,\n      \"tempmin\": 1,\n      \"windspeed\": 18,\n      \"humidity\": 70,\n      \"conditions\": \"Cloudy\"\n    }\n  ]\n}\n```",
    "sender": "ai"
  }
}
````

Notes:
- Numbers are raw (no units). The UI formats units using contexts.
- Backend now concatenates all text parts from the AI final response to ensure the fenced JSON is included.

## Getting Started

### Prerequisites

1) Google Cloud
- Enable AI Studio / Generative APIs
- Create API key → `GOOGLE_API_KEY`
- Create OAuth 2.0 Client ID (Web) → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

2) Visual Crossing
- Get `VISUAL_CROSSING_API_KEY`

### Local Development

Backend
```bash
cd backend
uv sync
source ../env-scratchpad.sh
uv run uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend
```bash
cd frontend
npm install
source ../env-scratchpad.sh
# optional in dev to avoid Nginx: point frontend at backend directly
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

### Docker (single container)

```bash
source env-scratchpad.sh
./deploy-production.sh
```

This builds a multi-stage image:

- **backend-builder** installs Python dependencies with `uv`, readying the FastAPI code and agent runtime.
- **frontend-builder** runs `npm ci` and `npm run build` to generate the static Next.js export while injecting `NEXT_PUBLIC_GOOGLE_CLIENT_ID` during build time.
- **runtime** copies both artifacts, installs Nginx alongside the backend, and launches FastAPI plus Nginx via `start.sh`. Requests to `/api` go to FastAPI, and everything else is served from `frontend/out`.

Health check: `GET /api/health`

`docker-compose.yml` is only for local development. It builds the same image, binds Nginx on port 80, and passes through the required API keys so you can smoke-test the full stack without wiring GitHub workflows.

### Render Deployment

- Use `render.yaml` (env: docker) — builds `Dockerfile` and runs Nginx + FastAPI in one container
- Set env vars in Render dashboard
- Use same-origin in production (don’t set `NEXT_PUBLIC_API_URL`); Nginx proxies `/api` → FastAPI

## Environment Variables

Required
```bash
# Backend
VISUAL_CROSSING_API_KEY=...
GOOGLE_API_KEY=...

# Frontend
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...

# Optional
ENVIRONMENT=production
# If doing cross-origin
PUBLIC_WEB_ORIGIN=https://your-domain
```

## API Endpoints (summary)

Auth
- `POST /api/auth/google`
- `POST /api/auth/logout`
- `GET /api/auth/session/{session_id}`
- `POST /api/auth/totp/setup` → png
- `POST /api/auth/totp/verify`
- `GET /api/auth/totp/status/{email}`

Chat
- `POST /api/chat`

Weather
- `POST /api/weather/current`
- `POST /api/weather/forecast`
- `POST /api/weather/history`

Health
- `GET /api/health`

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

- Chat UI parses AI responses: human text → chat bubble; `weather-json` → `AiWeatherPanel`.
- `AiWeatherPanel` shows meta (city/date/date_range) and renders:
  - `WeatherView` for current
  - `List` for forecast/history
- Global Language and Unit contexts drive formatting; AI JSON stays unit-agnostic.
- Nginx adds gzip compression, long-lived caching headers for static assets, and disables caching for HTML so the App Router’s prerendered pages stay fresh.

## CI/CD

Two GitHub Actions workflows live in `.github/workflows/`:

- `ci.yml` triggers on pushes or pull requests to `main`. Today it checks out the repo, installs Python 3.12 and `uv`, and prints a placeholder instead of running real tests (“No tests yet”), acting as a scaffold for future coverage.
- `deploy.yml` runs when you push to the `deploy` branch and executes three jobs:
  - **deploy** builds the Docker image with the frontend build argument, saves it as `image.tar`, and uploads it as an artifact.
  - **test** downloads the image, runs the container with secrets, waits for `/api/health`, installs backend dependencies via `uv`, and executes `test_local.py` against the container through the exposed Nginx port. It always tears down the container afterward.
  - **render_deploy** depends on the previous job and, when the branch is `deploy`, prints manual deployment instructions for Render (so the user can reuse the artifact and secrets).

This setup lets you keep the `main` branch lightweight while treating the `deploy` branch as the hand-off point for artifacts, integration smoke tests, and eventual manual deployment.
