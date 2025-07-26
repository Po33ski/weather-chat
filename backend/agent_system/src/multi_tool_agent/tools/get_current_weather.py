import requests
import os
import json

# Load Visual Crossing API key from environment variables
API_KEY = os.getenv("VISUAL_CROSSING_API_KEY")
API_HTTP = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"

def get_current_weather(city: str) -> str:
    """
    Fetch current weather data for a given city using the Visual Crossing API.
    Returns the raw JSON response from the API.
    
    Args:
        city: The city name
    """
    if not city:
        return json.dumps({"error": "No city provided."})
    if not API_KEY:
        return json.dumps({"error": "API key not found."})
    
    url = f"{API_HTTP}{city}?unitGroup=metric&key={API_KEY}&contentType=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        weather_data = response.text
        return weather_data
    except Exception as e:
        return json.dumps({"error": str(e)}) 