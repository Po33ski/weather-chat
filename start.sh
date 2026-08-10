#!/bin/bash

# Start FastAPI backend in the background
cd /app/backend
uv run python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 &

# Wait for the backend to accept requests before letting nginx serve traffic.
# Without this, nginx starts immediately and can proxy /api/* to a backend
# that isn't listening yet, causing 502s on cold starts.
echo "Waiting for backend to become ready..."
for i in $(seq 1 60); do
  if curl -sf http://127.0.0.1:8000/health > /dev/null; then
    echo "Backend is ready."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Backend did not become ready in time, starting nginx anyway."
  fi
  sleep 1
done

# Start Nginx in the foreground
nginx -g 'daemon off;'