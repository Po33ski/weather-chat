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

def get_current_weather(city: str, unit_system: str = "METRIC", session_id: str = "") -> str:
    """
    Fetch current weather data for a given city using the Visual Crossing API.
    Returns the JSON response converted to the specified unit system.
    
    Args:
        city: The city name
        unit_system: The unit system to use (US, METRIC, UK). Defaults to METRIC.
        session_id: Optional session ID to get user preferences if unit_system is not specified.
    """
    if not city:
        return json.dumps({"error": "No city provided."})
    if not API_KEY:
        return json.dumps({"error": "API key not found."})
    
    # If unit_system is METRIC (default) and session_id is provided, try to get user preferences
    if unit_system == "METRIC" and session_id:
        try:
            from .get_user_preferences import get_user_preferences
            pref_result = get_user_preferences(session_id)
            pref_data = json.loads(pref_result)
            user_unit_system = pref_data.get("unit_system", "METRIC")
            if user_unit_system != "METRIC":
                unit_system = user_unit_system
        except Exception:
            # If getting preferences fails, continue with METRIC
            pass
    
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