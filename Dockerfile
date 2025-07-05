# Multi-stage Dockerfile for Weather Center Chat
# Builds both backend and frontend, serves from single container

# Stage 1: Build Backend
FROM python:3.12-slim as backend-builder

# Install uv
RUN pip install uv

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/pyproject.toml backend/
COPY backend/uv.lock backend/

# Install backend dependencies
WORKDIR /app/backend
RUN uv sync --frozen --no-dev

# Copy backend source code
COPY backend/ .

# Stage 2: Build Frontend
FROM node:18-alpine as frontend-builder

# Set working directory
WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Copy frontend source code
COPY frontend/ .

# Build frontend
RUN npm run build

# Stage 3: Production Runtime
FROM python:3.12-slim

# Install nginx and other dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Create app directory
WORKDIR /app

# Copy backend from builder
COPY --from=backend-builder /app/backend /app/backend

# Copy frontend build from builder
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/public /app/frontend/public
COPY --from=frontend-builder /app/frontend/package*.json /app/frontend/

# Install frontend production dependencies
WORKDIR /app/frontend
RUN npm ci --only=production

# Create nginx configuration
RUN mkdir -p /etc/nginx/sites-available
COPY nginx.conf /etc/nginx/sites-available/default

# Create startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start the application
CMD ["/app/start.sh"] 