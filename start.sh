#!/bin/bash

set -euo pipefail

# Start FastAPI backend in the background using the prebuilt virtual environment
cd /app/backend

# Activate project venv if present (created by `uv sync` during image build)
if [ -f ".venv/bin/activate" ]; then
	. .venv/bin/activate
fi

python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 &

# Wait until backend is ready before starting nginx (avoids 502s during cold start)
echo "Waiting for FastAPI to become ready on http://127.0.0.1:8000/api/health ..."
for i in $(seq 1 60); do
	if curl -fsS http://127.0.0.1:8000/api/health >/dev/null; then
		echo "FastAPI is ready. Starting nginx."
		break
	fi
	sleep 1
done

# Start Nginx in the foreground
nginx -g 'daemon off;' 