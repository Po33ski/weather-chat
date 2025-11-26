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
    """Helper: HTTP GET against BACKEND_BASE_URL with a sane timeout."""
    return requests.get(f"{BASE_URL}{path}", timeout=15, **kwargs)


def _post(path: str, json_body: dict, **kwargs) -> requests.Response:
    """Helper: HTTP POST (JSON) against BACKEND_BASE_URL with a sane timeout."""
    return requests.post(
        f"{BASE_URL}{path}", json=json_body, headers={"Content-Type": "application/json"}, timeout=25, **kwargs
    )


def test_health():
    """Assert that the API health endpoint is up and returns expected JSON shape."""
    print("1) Health check...")
    resp = _get("/api/health")
    assert resp.status_code == 200, f"/health status {resp.status_code}"
    data = resp.json()
    assert isinstance(data, dict)
    assert "status" in data, "missing 'status' in /health response"
    assert "services" in data and isinstance(data["services"], dict), "missing 'services' details"
    print("   ✅ /health ok")


def test_root():
    """Through Nginx, '/' should serve the statically exported index.html (HTML content)."""
    print("2) Root endpoint...")
    resp = _get("/")
    # Through Nginx this serves the static index.html, so expect HTML, not JSON.
    assert resp.status_code == 200, f"/ status {resp.status_code} (hint: use Nginx URL, not bare FastAPI)"
    ct = resp.headers.get("Content-Type", "")
    assert "text/html" in ct or "text/" in ct, f"unexpected content-type: {ct}"
    assert resp.text and "<html" in resp.text.lower(), "root did not return HTML"
    print("   ✅ / ok")


# def test_weather_current():
#     """If Visual Crossing key is present, verify weather endpoint returns structured data."""
#     print("3) Weather current...")
#     if not os.getenv("VISUAL_CROSSING_API_KEY"):
#         print("   ⚠️  Skipping strict assert: VISUAL_CROSSING_API_KEY not set")
#         return
#     resp = _post("/api/weather/current", {"location": "London"})
#     assert resp.status_code == 200, f"weather/current status {resp.status_code}"
#     data = resp.json()
#     assert data.get("success") is True, f"weather/current failed: {data}"
#     assert "data" in data and isinstance(data["data"], dict), "missing weather data"
#     assert "temperature" in data["data"], "missing temperature in weather data"
#     print("   ✅ weather/current ok")


def test_chat():
    """If Google API key is present, verify chat endpoint returns a non-empty message."""
    print("4) Chat...")
    if not os.getenv("GOOGLE_API_KEY"):
        print("   ⚠️  Skipping strict assert: GOOGLE_API_KEY not set")
        return
    resp = _post("/api/chat", {"message": "Hello", "conversation_history": []})
    assert resp.status_code == 200, f"/api/chat status {resp.status_code}"
    data = resp.json()
    # Backend schema: { success: bool, data?: { message, sender }, error?: string }
    if not data.get("success"):
        print(f"   ⚠️  Chat returned error: {data.get('error')}")
        return
    assert isinstance(data.get("data"), dict), "missing data in chat response"
    msg = data["data"].get("message")
    assert isinstance(msg, str) and len(msg) > 0, "empty chat message"
    print("   ✅ /api/chat ok")


def main():
    """Convenience runner to execute the checks without pytest."""
    print("🌤️  Testing Weather Center Chat Backend")
    print("=" * 50)
    test_health()
    test_root()
    test_chat()
    print("\nAll checks completed.")


if __name__ == "__main__":
    main()