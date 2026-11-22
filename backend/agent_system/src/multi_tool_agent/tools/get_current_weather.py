import json
import os
from typing import Any, Dict

import requests

from .utils import normalize_sunrise_sunset, timeline_params, timeline_url


def get_current_weather(city: str) -> Dict[str, Any]:
    """
    Fetch current weather data for a given city using the Visual Crossing API.
    Returns a dictionary with weather data, or {"error": "message"} on failure.

    Args:
        city: The city name

    Returns:
        Dict containing weather data from API, or {"error": "..."} if the call failed.
    """
    if not city:
        return {"error": "No city provided."}

    api_key = os.getenv("VISUAL_CROSSING_API_KEY")
    if not api_key:
        return {"error": "Weather service API key is not configured."}

    url = timeline_url(city)
    if url is None:
        return {"error": f"City '{city}' not found or invalid."}

    try:
        response = requests.get(url, params=timeline_params(api_key), timeout=10)
        response.raise_for_status()
        weather_data = response.json()
        return normalize_sunrise_sunset(weather_data)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400:
            return {"error": f"City '{city}' not found or invalid."}
        return {"error": f"Weather service error ({e.response.status_code})."}
    except requests.exceptions.Timeout:
        return {"error": "Weather service request timed out."}
    except requests.exceptions.RequestException:
        return {"error": "Weather service is temporarily unavailable."}
    except json.JSONDecodeError:
        return {"error": "Weather service returned invalid data."}
