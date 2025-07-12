import requests
import pathlib
import dotenv
import json
from .systems_convert import convert_weather_data

# Load Visual Crossing API key from .env
ENV_PATH = pathlib.Path(__file__).parent.parent / ".env"
values = dotenv.dotenv_values(ENV_PATH)
API_KEY = values.get("VISUAL_CROSSING_API_KEY")
API_HTTP = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"

def get_forecast(city: str, unit_system: str = "METRIC") -> str:
    """
    Fetch weather forecast data for a given city using the Visual Crossing API.
    Returns 15-day forecast data converted to the specified unit system.
    
    Args:
        city: The city name
        unit_system: The unit system to use (US, METRIC, UK). Defaults to METRIC.
    """
    if not city:
        return json.dumps({"error": "No city provided."})
    if not API_KEY:
        return json.dumps({"error": "API key not found."})
    
    # Always fetch in metric (base units) from the API
    url = f"{API_HTTP}{city}?unitGroup=metric&key={API_KEY}&contentType=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        weather_data = response.text
        
        # Convert to the requested unit system
        return convert_weather_data(weather_data, unit_system)
        
    except Exception as e:
        return json.dumps({"error": str(e)}) 