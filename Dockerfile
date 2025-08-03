# Multi-stage Dockerfile for Weather Center Chat
# Builds both backend and frontend, serves from single container

# Stage 1: Build Backend
FROM ghcr.io/astral-sh/uv:python3.12-bookworm AS backend-builder

# Install system dependencies including PostgreSQL client
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libpq-dev \
    libsnappy-dev \
    make \
    gcc \
    g++ \
    libc6-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend files first
COPY backend/ .

# Install backend dependencies using uv sync
RUN uv sync

# Install uvicorn as a tool
RUN uv tool install uvicorn

# Stage 2: Build Frontend
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Copy frontend source code
COPY frontend/ .

# Build frontend with static export
RUN npm run build

# Stage 3: Production Runtime
FROM ghcr.io/astral-sh/uv:python3.12-bookworm

# Install PostgreSQL client and other dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpq5 \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend from builder
COPY --from=backend-builder /app /app/backend

# Copy frontend static export from builder
COPY --from=frontend-builder /app/frontend/out /app/frontend/out

# Install backend dependencies in runtime stage
WORKDIR /app/backend
RUN uv sync

# Install uvicorn as a tool in runtime stage
RUN uv tool install uvicorn

# Copy nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Create startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["/app/start.sh"] 