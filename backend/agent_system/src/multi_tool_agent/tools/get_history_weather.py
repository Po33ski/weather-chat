import requests
import pathlib
import dotenv
import json
from datetime import datetime
from .systems_convert import convert_weather_data

# Load Visual Crossing API key from .env
ENV_PATH = pathlib.Path(__file__).parent.parent / ".env"
values = dotenv.dotenv_values(ENV_PATH)
API_KEY = values.get("VISUAL_CROSSING_API_KEY")
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

def get_history_weather(city: str, start_date: str, end_date: str, unit_system: str = "METRIC") -> str:
    """
    Fetch historical weather data for a given city and date range using the Visual Crossing API.
    Converts temperature and wind speed fields to the requested unit system.
    Returns the modified JSON response from the API.
    Args:
        city: The city name
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        unit_system: The unit system to use ("US", "METRIC", "UK")
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
        data = json.loads(weather_data)
        # Convert days and hours fields
        if "days" in data:
            for day in data["days"]:
                temp_fields = ["temp", "tempmax", "tempmin", "feelslike", "feelslikemax", "feelslikemin", "dew", "windchill", "heatindex"]
                wind_fields = ["wspd", "wgust", "windspeed", "windspeedmax", "windspeedmean", "windspeedmin"]
                for field in temp_fields:
                    if field in day and day[field] is not None:
                        conv = json.loads(convert_weather_data(day[field], "temperature", unit_system))
                        day[field] = conv["value"]
                        day[field+"_unit"] = conv["unit"]
                for field in wind_fields:
                    if field in day and day[field] is not None:
                        conv = json.loads(convert_weather_data(day[field], "wind_speed", unit_system))
                        day[field] = conv["value"]
                        day[field+"_unit"] = conv["unit"]
                # Convert hours if present
                if "hours" in day:
                    for hour in day["hours"]:
                        for field in temp_fields:
                            if field in hour and hour[field] is not None:
                                conv = json.loads(convert_weather_data(hour[field], "temperature", unit_system))
                                hour[field] = conv["value"]
                                hour[field+"_unit"] = conv["unit"]
                        for field in wind_fields:
                            if field in hour and hour[field] is not None:
                                conv = json.loads(convert_weather_data(hour[field], "wind_speed", unit_system))
                                hour[field] = conv["value"]
                                hour[field+"_unit"] = conv["unit"]
        return json.dumps(data)
    except Exception as e:
        return json.dumps({"error": str(e)}) 