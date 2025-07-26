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
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `VISUAL_CROSSING_API_KEY` | Weather API key | Yes |
| `GOOGLE_API_KEY` | Google AI API key | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | OAuth client ID | Yes |
| `MODEL` | AI model (default: gemini-2.0-flash) | No |
| `DISABLE_WEB_DRIVER` | Web driver setting (default: 0) | No |
| `ENVIRONMENT` | Environment (default: production) | No |

## Docker Compose Services

### PostgreSQL Database
- **Image**: `postgres:16`
- **Database**: `weatherdb`
- **User**: `popard`
- **Password**: `malySlon1`
- **Port**: `5432`

### Weather Center Chat Application
- **Port**: `80`
- **Health Check**: `http://localhost/health`
- **Dependencies**: PostgreSQL

## Production Deployment

### Using Docker Compose

```bash
# Set environment variables
export VISUAL_CROSSING_API_KEY="your_key"
export GOOGLE_API_KEY="your_key"
export DATABASE_URL="your_database_url"
export NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_client_id"

# Deploy
docker-compose up -d --build
```

### Using Production Script

```bash
# Source environment variables
source env-scratchpad.sh

# Deploy
./deploy-production.sh
```

## Health Checks

- **Application**: `http://localhost/health`
- **Database**: PostgreSQL health check in docker-compose
- **Container**: Docker health check configured

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   ```bash
   source env-scratchpad.sh
   ```

2. **Database Connection Failed**
   - Check if PostgreSQL is running
   - Verify `DATABASE_URL` is correct

3. **Build Fails**
   - Check Docker has enough memory (4GB+ recommended)
   - Clear Docker cache: `docker system prune`

4. **Port Already in Use**
   - Change port in docker-compose.yml
   - Or stop existing service: `docker-compose down`

### Logs

```bash
# View application logs
docker-compose logs weather-app

# View database logs
docker-compose logs postgres

# Follow logs
docker-compose logs -f weather-app
```

## Development vs Production

### Development
- Use `docker-compose up` for local development
- Includes PostgreSQL database
- Hot reloading available

### Production
- Use `./deploy-production.sh` for production
- Requires external database
- Optimized for performance

## Security Features

- ✅ Non-root user execution
- ✅ Minimal attack surface
- ✅ Health checks for monitoring
- ✅ Environment variable isolation
- ✅ No secrets in image layers

## Performance Optimizations

- ✅ Multi-stage build reduces image size
- ✅ Layer caching for faster builds
- ✅ Nginx for static file serving
- ✅ Gzip compression enabled
- ✅ Production-optimized dependencies 