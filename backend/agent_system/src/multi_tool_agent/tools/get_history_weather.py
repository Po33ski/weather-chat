import requests
import os
import json
from datetime import datetime
from typing import Dict, Any

from .exceptions import ToolValidationError, ToolConfigurationError, ToolAPIError

# Load Visual Crossing API key from environment variables
API_KEY = os.getenv("VISUAL_CROSSING_API_KEY")
API_HTTP = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"

def normal_date_formatted(d: datetime) -> str:
    """
    Format date to YYYY-MM-DD format, similar to the frontend function.
    """
    if d:
        return (
            str(d.year) +
            "-" +
            ("0" + str(d.month + 1))[-2:] +
            "-" +
            ("0" + str(d.day))[-2:]
        )
    return ""

def get_history_weather(city: str, start_date: str, end_date: str) -> Dict[str, Any]:
    """
    Fetch historical weather data for a given city and date range using the Visual Crossing API.
    Returns a dictionary with weather data.
    
    Args:
        city: The city name
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
    
    Returns:
        Dict containing weather data from API
    
    Raises:
        ToolValidationError: If city, start_date, or end_date is not provided
        ToolConfigurationError: If API key is not configured
        ToolAPIError: If API request fails or response cannot be parsed
    """
    if not city:
        raise ToolValidationError("No city provided.")
    if not start_date or not end_date:
        raise ToolValidationError("Both start_date and end_date are required.")
    if not API_KEY:
        raise ToolConfigurationError("API key not found.")
    
    url = f"{API_HTTP}{city}/{start_date}/{end_date}?unitGroup=metric&key={API_KEY}&contentType=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        weather_data = response.json()  # Parse JSON to dict
        return weather_data
    except requests.exceptions.RequestException as e:
        raise ToolAPIError(f"API request failed: {str(e)}") from e
    except json.JSONDecodeError as e:
        raise ToolAPIError(f"Failed to parse API response: {str(e)}") from e 