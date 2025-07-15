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

def get_current_weather(city: str, unit_system: str = "METRIC") -> str:
    """
    Fetch current weather data for a given city using the Visual Crossing API.
    Converts temperature and wind speed fields to the requested unit system.
    Returns the modified JSON response from the API.
    Args:
        city: The city name
        unit_system: The unit system to use ("US", "METRIC", "UK")
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
        data = json.loads(weather_data)
        # Convert currentConditions fields
        if "currentConditions" in data:
            cc = data["currentConditions"]
            temp_fields = ["temp", "feelslike", "dew", "windchill", "heatindex"]
            wind_fields = ["wspd", "wgust"]
            for field in temp_fields:
                if field in cc and cc[field] is not None:
                    conv = json.loads(convert_weather_data(cc[field], "temperature", unit_system))
                    cc[field] = conv["value"]
                    cc[field+"_unit"] = conv["unit"]
            for field in wind_fields:
                if field in cc and cc[field] is not None:
                    conv = json.loads(convert_weather_data(cc[field], "wind_speed", unit_system))
                    cc[field] = conv["value"]
                    cc[field+"_unit"] = conv["unit"]
        return json.dumps(data)
    except Exception as e:
        return json.dumps({"error": str(e)}) 