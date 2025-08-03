# Docker Setup for Weather Center Chat

This document explains how to build and run the Weather Center Chat application using Docker.

## Prerequisites

- Docker installed on your system
- Environment variables set (see `env-scratchpad.sh`)

## Quick Start

### 1. Set Environment Variables

```bash
source env-scratchpad.sh
```

### 2. Build and Run with Docker Compose (Recommended for Development)

```bash
# Build and start all services (PostgreSQL + Application)
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 3. Build and Run with Production Script

```bash
# Build and run production container
./deploy-production.sh
```

## Docker Configuration

### Multi-Stage Build

The Dockerfile uses a multi-stage build process:

1. **Backend Builder**: Installs Python dependencies using `uv`
2. **Frontend Builder**: Builds Next.js application
3. **Production Runtime**: Combines both with nginx

### Key Features

- ✅ **Uses `uv`** for fast Python dependency management
- ✅ **PostgreSQL client libraries** included
- ✅ **Non-root user** for security
- ✅ **Health checks** for monitoring
- ✅ **Nginx reverse proxy** for frontend/backend routing
- ✅ **Environment variable support**

## Environment Variables

The following environment variables are required:

| Variable | Description | Required |
|----------|-------------|----------|
| `VISUAL_CROSSING_API_KEY` | Weather API key | Yes |
| `GOOGLE_API_KEY` | Google AI API key | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | OAuth client ID | Yes |
| `MODEL` | AI model (default: gemini-2.0-flash) | No |
| `DISABLE_WEB_DRIVER` | Web driver setting (default: 0) | No |
| `ENVIRONMENT` | Environment (default: production) | No |

> **Note:** The backend uses a local SQLite database file (`database.db`) in the backend directory. No external database or `DATABASE_URL` is required. The file is created automatically on first run.

## Docker Compose Services

### PostgreSQL Database
- **Image**: `postgres:16`
- **Database**: `weatherdb`
- **User**: `popard`
- **Password**: `malySlon1`
- **Port**: `5432`

## Nginx Reverse Proxy Architecture

- **Nginx** serves static frontend files from `/app/frontend/out`.
- **Nginx** proxies `/api/` requests to the FastAPI backend running on `127.0.0.1:8000`.
- All other requests fallback to `index.html` for client-side routing (Next.js/React Router).
- Both frontend and backend are available on the same domain and port (e.g., `http://localhost` or your Render URL).

> **Note:** API calls from the frontend should use relative URLs (e.g., `/api/weather/current`).

### Weather Center Chat Application
- **Port**: `80`
- **Health Check**: `http://localhost/health`
- **Dependencies**: None (uses SQLite for backend)
- **Served by Nginx reverse proxy**

## Production Deployment

### Using Docker Compose

```