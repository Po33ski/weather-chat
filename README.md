# Weather Center Chat

AI‑powered weather portal with a modern Next.js frontend and a FastAPI backend. Get current, forecast, and historical weather, chat with an AI assistant (Google ADK), and sign in with Google OAuth or TOTP.

## Highlights

- 🌤️ Weather data: current, 15‑day forecast, and history
- 🧠 AI chat: Google ADK (Agent Development Kit)
- 🔑 Auth: Google OAuth + optional TOTP (QR‑code) login
- 🌍 i18n: quick language switch (EN/PL)
- 🧭 Unit systems: METRIC / UK / US switch
- 🐳 Single Docker image: Nginx serves static Next export and proxies API to FastAPI
- ⚡ Fast dev flow: uv for Python deps, TypeScript on the frontend

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: FastAPI (Python), uv (deps), Google ADK, Visual Crossing Weather API
- Runtime: Nginx (static + reverse proxy)
- Data: SQLite (local file) — simple and zero‑config

## Getting Started

### Prerequisites

1) Google Cloud
- Create a project in Google Cloud Console
- Enable AI Studio / Generative APIs (for Google ADK)
- Create an API key (GOOGLE_API_KEY)
- Create OAuth 2.0 Client ID (Web) for Google sign‑in

2) Visual Crossing
- Create an account and obtain VISUAL_CROSSING_API_KEY

### Local (dev)

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
npm run dev
```

Notes
- In local dev you may set `NEXT_PUBLIC_API_URL=http://localhost:8000` so the frontend calls the backend directly.
- In production use same‑origin (no NEXT_PUBLIC_API_URL), and let Nginx proxy `/api` to FastAPI.

### Docker (single container)

```bash
source env-scratchpad.sh
./deploy-production.sh
```

This builds a multi‑stage image:
- Frontend: Next static export served by Nginx
- Backend: FastAPI behind Nginx, proxied at `/api`

Health check: `GET /api/health`

## Environment Variables

Required
```bash
# Backend
export VISUAL_CROSSING_API_KEY="your_visual_crossing_api_key"
export GOOGLE_API_KEY="your_google_api_key"

# Frontend
export NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_oauth_client_id"

# Optional (prod)
export ENVIRONMENT="production"
# Only if you do cross‑origin calls
export PUBLIC_WEB_ORIGIN="https://your-domain"
```

For local dev only
```bash
export NEXT_PUBLIC_API_URL="http://localhost:8000"
```

## API Endpoints

Auth
- `POST /api/auth/google` — Google OAuth (exchange ID token → session)
- `POST /api/auth/logout` — Invalidate session
- `GET /api/auth/session/{session_id}` — Session info
- `POST /api/auth/totp/setup` — Returns QR code (image/png)
- `POST /api/auth/totp/verify` — Verifies 6‑digit code and creates session
- `GET /api/auth/totp/status/{email}` — Check if TOTP is enabled for a user

Chat
- `POST /api/chat` — AI chat with Google ADK

Weather
- `POST /api/weather/current`
- `POST /api/weather/forecast`
- `POST /api/weather/history`

Health
- `GET /api/health`

## Render.com Deployment

- Use `render.yaml` (env: docker) — it builds the Dockerfile and runs Nginx + FastAPI in one container
- Set env vars in the Render dashboard
- Use same‑origin in production (no `NEXT_PUBLIC_API_URL`); Nginx proxies `/api` → FastAPI

## Project Structure

```
weather-center-chat/
├── backend/
│   ├── api/                    # FastAPI app (endpoints + services)
│   ├── agent_system/           # Google ADK agent + tools
│   ├── pyproject.toml          # Python deps
│   └── uv.lock                 # Locked deps
├── frontend/
│   └── src/app/                # Next.js App Router
├── Dockerfile                  # Multi‑stage; Nginx serves + proxies
├── nginx.conf                  # Nginx (static + /api proxy)
├── render.yaml                 # Render.com config
├── env-scratchpad.sh           # Local env helper (do not commit secrets)
└── deploy-production.sh        # Build & run container locally
```

## Contributing

1) Fork → branch → PR
2) Run locally or via Docker
3) Keep changes typed (TypeScript) and formatted

## License

MIT





