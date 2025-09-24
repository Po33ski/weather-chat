#!/usr/bin/env python3
"""
Assert-based checks for local backend functionality.

You can run this directly (python test_local.py) or with pytest.
Skips strict assertions for endpoints that require missing API keys.
"""

import os
import requests

BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")


def _get(path: str, **kwargs) -> requests.Response:
    return requests.get(f"{BASE_URL}{path}", timeout=15, **kwargs)


def _post(path: str, json_body: dict, **kwargs) -> requests.Response:
    return requests.post(
        f"{BASE_URL}{path}", json=json_body, headers={"Content-Type": "application/json"}, timeout=25, **kwargs
    )


def test_health():
    print("1) Health check...")
    resp = _get("/health")
    assert resp.status_code == 200, f"/health status {resp.status_code}"
    data = resp.json()
    assert isinstance(data, dict)
    assert "status" in data, "missing 'status' in /health response"
    assert "services" in data and isinstance(data["services"], dict), "missing 'services' details"
    print("   ✅ /health ok")


def test_root():
    print("2) Root endpoint...")
    resp = _get("/")
    assert resp.status_code == 200, f"/ status {resp.status_code}"
    data = resp.json()
    assert "message" in data and isinstance(data["message"], str)
    print("   ✅ / ok")


def test_weather_current():
    print("3) Weather current...")
    if not os.getenv("VISUAL_CROSSING_API_KEY"):
        print("   ⚠️  Skipping strict assert: VISUAL_CROSSING_API_KEY not set")
        return
    resp = _post("/api/weather/current", {"location": "London"})
    assert resp.status_code == 200, f"weather/current status {resp.status_code}"
    data = resp.json()
    assert data.get("success") is True, f"weather/current failed: {data}"
    assert "data" in data and isinstance(data["data"], dict), "missing weather data"
    assert "temperature" in data["data"], "missing temperature in weather data"
    print("   ✅ weather/current ok")


def test_chat():
    print("4) Chat...")
    if not os.getenv("GOOGLE_API_KEY"):
        print("   ⚠️  Skipping strict assert: GOOGLE_API_KEY not set")
        return
    resp = _post("/api/chat", {"message": "Hello", "conversation_history": []})
    assert resp.status_code == 200, f"/api/chat status {resp.status_code}"
    data = resp.json()
    # Backend returns { message: '...' }
    assert "message" in data and isinstance(data["message"], str) and len(data["message"]) > 0
    print("   ✅ /api/chat ok")


def main():
    print("🌤️  Testing Weather Center Chat Backend")
    print("=" * 50)
    test_health()
    test_root()
    test_weather_current()
    test_chat()
    print("\nAll checks completed.")


if __name__ == "__main__":
    main()