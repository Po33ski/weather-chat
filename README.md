# Weather Center Chat

AI‑powered weather portal with a modern Next.js frontend and a FastAPI backend. Get current, forecast, and historical weather, and chat with an AI assistant (Google ADK). Sign in with Google OAuth or TOTP.

## Features

- Weather: current, 15‑day forecast, and history
- AI chat (Google ADK): answers in natural language + structured JSON payload
- Auth: Google OAuth + optional TOTP (QR‑code)
- i18n: EN/PL via `LanguageContext`
- Unit systems: METRIC / UK / US via `UnitSystemContext`
- Single Docker image: Nginx serves static Next export and proxies `/api` → FastAPI

## Architecture

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
  - Static export (`output: 'export'`) served by Nginx
  - Chat UI (`Chat.tsx`) splits AI message into:
    - humanText (short text for chat bubble)
    - weather‑json (fenced block) → parsed on frontend
  - AiWeatherPanel: renders parsed data
    - kind=current → `WeatherView` (tiles)
    - kind=forecast/history → `List` (table)
- Backend: FastAPI
  - Weather: Visual Crossing API client
  - AI: Google ADK agent (get_weather) with strict output format
  - Auth: Google OAuth, TOTP endpoints
- Runtime: Nginx (static + reverse proxy)

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

This builds a multi‑stage image:
- Frontend: Next static export served by Nginx
- Backend: FastAPI behind Nginx, proxied at `/api`

Health check: `GET /api/health`

### Render Deployment

- Use `render.yaml` (env: docker) — builds `Dockerfile` and runs Nginx + FastAPI in one container
- Set env vars in Render dashboard
- Use same‑origin in production (don’t set `NEXT_PUBLIC_API_URL`); Nginx proxies `/api` → FastAPI

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
# If doing cross‑origin
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
├── Dockerfile                  # Multi‑stage image
├── nginx.conf                  # Nginx static + /api proxy
├── render.yaml                 # Render config
├── env-scratchpad.sh           # Local env helper
└── deploy-production.sh        # One‑shot local Docker run
```

## Notes & Tips

- Chat UI parses AI responses: human text → chat bubble; `weather-json` → `AiWeatherPanel`.
- `AiWeatherPanel` shows meta (city/date/date_range) and renders:
  - `WeatherView` for current
  - `List` for forecast/history
- Global Language and Unit contexts drive formatting; AI JSON stays unit‑agnostic.
## Notes & Tips

- Chat UI parses AI responses: human text → chat bubble; `weather-json` → `AiWeatherPanel`.
- `AiWeatherPanel` shows meta (city/date/date_range) and renders:
  - `WeatherView` for current
  - `List` for forecast/history
- Global Language and Unit contexts drive formatting; AI JSON stays unit‑agnostic.







