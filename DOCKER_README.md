# Docker Guide (Single‑Container)

Run Weather Center Chat as one Docker container: Nginx serves the static Next.js export and proxies `/api` to FastAPI.

## Prerequisites

- Docker installed
- Environment variables set (see `env-scratchpad.sh`)

## Quick Start

```bash
source env-scratchpad.sh
./deploy-production.sh
```

Build stages in Dockerfile
1) Backend builder (uv installs Python deps)
2) Frontend builder (Next.js static export)
3) Runtime (Nginx + FastAPI)

## How it works

- Nginx serves static files from `/app/frontend/out`
- Nginx proxies `/api/` → `http://127.0.0.1:8000`
- Health endpoint (through Nginx): `GET /api/health`
- One public port: `80`

## Env Vars

Required
```bash
VISUAL_CROSSING_API_KEY=...
GOOGLE_API_KEY=...
```

Optional
```bash
ENVIRONMENT=production
MODEL=gemini-2.5-flash
DISABLE_WEB_DRIVER=0
PUBLIC_WEB_ORIGIN=https://weather-chat-6g4p.onrender.com   # only if doing cross-origin
NEXT_PUBLIC_API_URL=http://localhost:8000      # dev overrides only
```

Note
- Backend keeps Google ADK sessions entirely in memory; no external database is required.
- In production, use same-origin calls from the frontend; do NOT set `NEXT_PUBLIC_API_URL`.

## Development with Compose (optional)

```bash
docker-compose up --build
```

## Useful

```bash
# View logs
docker logs -f weather-center-chat

# Stop & remove container
docker stop weather-center-chat || true && docker rm weather-center-chat || true

# Rebuild
docker build -t weather-center-chat:latest .
```