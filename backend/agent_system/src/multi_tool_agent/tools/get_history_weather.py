import requests
import os
import json
from datetime import datetime

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

def get_history_weather(city: str, start_date: str, end_date: str) -> str:
    """
    Fetch historical weather data for a given city and date range using the Visual Crossing API.
    Returns the raw JSON response from the API.
    
    Args:
        city: The city name
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
    """
    if not city:
        return json.dumps({"error": "No city provided."})
    if not start_date or not end_date:
        return json.dumps({"error": "Both start_date and end_date are required."})
    if not API_KEY:
        return json.dumps({"error": "API key not found."})
    
    url = f"{API_HTTP}{city}/{start_date}/{end_date}?unitGroup=metric&key={API_KEY}&contentType=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        weather_data = response.text
        return weather_data
    except Exception as e:
        return json.dumps({"error": str(e)}) 