#!/bin/bash

# Production Deployment Script for Weather Center Chat
# This script builds and runs the Docker container for production

set -e

echo "🚀 Starting production deployment..."

# Check if environment variables are set
if [ -z "$VISUAL_CROSSING_API_KEY" ]; then
    echo "❌ Error: VISUAL_CROSSING_API_KEY environment variable is not set"
    echo "   Please source env-scratchpad.sh or set the environment variable"
    exit 1
fi

if [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ Error: GOOGLE_API_KEY environment variable is not set"
    echo "   Please source env-scratchpad.sh or set the environment variable"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "   Please source env-scratchpad.sh or set the environment variable"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_GOOGLE_CLIENT_ID" ]; then
    echo "❌ Error: NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is not set"
    echo "   Please source env-scratchpad.sh or set the environment variable"
    exit 1
fi

if [ -z "$POSTGRES_DB" ]; then
    echo "❌ Error: POSTGRES_DB environment variable is not set"
    echo "   Please source env-scratchpad.sh or set the environment variable"
    exit 1
fi

if [ -z "$POSTGRES_USER" ]; then
    echo "❌ Error: POSTGRES_USER environment variable is not set"
    echo "   Please source env-scratchpad.sh or set the environment variable"
    exit 1
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "❌ Error: POSTGRES_PASSWORD environment variable is not set"
    echo "   Please source env-scratchpad.sh or set the environment variable"
    exit 1
fi

echo "✅ Environment variables are set"

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t weather-center-chat:latest .

# Stop existing container if running
echo "🛑 Stopping existing container..."
docker stop weather-center-chat || true
docker rm weather-center-chat || true

# Run the container
echo "🚀 Starting production container..."
docker run -d \
    --name weather-center-chat \
    --restart unless-stopped \
    -p 80:80 \
    -e DATABASE_URL="$DATABASE_URL" \
    -e POSTGRES_DB="$POSTGRES_DB" \
    -e POSTGRES_USER="$POSTGRES_USER" \
    -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    -e VISUAL_CROSSING_API_KEY="$VISUAL_CROSSING_API_KEY" \
    -e GOOGLE_API_KEY="$GOOGLE_API_KEY" \
    -e NEXT_PUBLIC_GOOGLE_CLIENT_ID="$NEXT_PUBLIC_GOOGLE_CLIENT_ID" \
    -e MODEL="gemini-2.0-flash" \
    -e DISABLE_WEB_DRIVER="0" \
    -e ENVIRONMENT="production" \
    weather-center-chat:latest

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Check if container is running
if docker ps | grep -q weather-center-chat; then
    echo "✅ Container is running successfully!"
    echo "🌐 Application is available at: http://localhost"
    echo "🔍 Health check: http://localhost/health"
else
    echo "❌ Container failed to start"
    docker logs weather-center-chat
    exit 1
fi

# Show container logs
echo "📋 Container logs:"
docker logs weather-center-chat

echo "🎉 Production deployment completed!" 