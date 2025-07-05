#!/bin/bash

# Start nginx in background
echo "Starting nginx..."
nginx

# Start backend FastAPI server
echo "Starting FastAPI backend..."
cd /app/backend
uv run uvicorn api.main:app --host 0.0.0.0 --port 8000 