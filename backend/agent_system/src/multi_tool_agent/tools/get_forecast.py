import requests
import json
import os
from typing import Dict, Any

from .utils import normalize_sunrise_sunset

API_HTTP = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"


def get_forecast(city: str) -> Dict[str, Any]:
    """
    Fetch weather forecast data for a given city using the Visual Crossing API.
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

    url = f"{API_HTTP}{city}?unitGroup=metric&key={api_key}&contentType=json"
    try:
        response = requests.get(url, timeout=10)
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
