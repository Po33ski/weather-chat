import requests
import os
import json
from typing import Dict, Any

from .exceptions import ToolValidationError, ToolConfigurationError, ToolAPIError
from .utils import normalize_sunrise_sunset

# Load Visual Crossing API key from environment variables
API_KEY = os.getenv("VISUAL_CROSSING_API_KEY")
API_HTTP = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"

def get_forecast(city: str) -> Dict[str, Any]:
    """
    Fetch weather forecast data for a given city using the Visual Crossing API.
    Returns a dictionary with weather data.
    
    Args:
        city: The city name
    
    Returns:
        Dict containing weather data from API
    
    Raises:
        ToolValidationError: If city is not provided
        ToolConfigurationError: If API key is not configured
        ToolAPIError: If API request fails or response cannot be parsed
    """
    if not city:
        raise ToolValidationError("No city provided.")
    if not API_KEY:
        raise ToolConfigurationError("API key not found.")
    
    url = f"{API_HTTP}{city}?unitGroup=metric&key={API_KEY}&contentType=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        weather_data = response.json()  # Parse JSON to dict
        return normalize_sunrise_sunset(weather_data)
    except requests.exceptions.RequestException as e:
        raise ToolAPIError(f"API request failed: {str(e)}") from e
    except json.JSONDecodeError as e:
        raise ToolAPIError(f"Failed to parse API response: {str(e)}") from e 