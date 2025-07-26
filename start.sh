#!/bin/bash

# Start backend FastAPI server using uv run
echo "Starting FastAPI backend..."
cd /app/backend
uv run python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 