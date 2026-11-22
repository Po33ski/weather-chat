#!/bin/bash

# Proxies uvicorn may trust in X-Forwarded-For: nginx plus the platform's
# internal hops. The rate limiter keys on the rightmost address outside this
# list. Platforms with public proxy hops override it (see render.yaml).
export FORWARDED_ALLOW_IPS="${FORWARDED_ALLOW_IPS:-127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,100.64.0.0/10,fc00::/7}"

# Start FastAPI backend in the background
cd /app/backend
# FastAPI handles LLM output and holds the API keys, so it runs unprivileged.
# Loopback only: nginx, with its body-size limit, stays the single way in.
HOME=/tmp setpriv --reuid=app --regid=app --init-groups --no-new-privs --inh-caps=-all \
  /app/backend/.venv/bin/python -m uvicorn api.main:app --host 127.0.0.1 --port 8000 &

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