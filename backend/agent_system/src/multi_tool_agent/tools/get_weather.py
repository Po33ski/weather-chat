import requests
import pathlib
import dotenv
import json

# Load Visual Crossing API key from .env
ENV_PATH = pathlib.Path(__file__).parent.parent / ".env"
values = dotenv.dotenv_values(ENV_PATH)
API_KEY = values.get("VISUAL_CROSSING_API_KEY")
API_HTTP = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"

def get_weather(city: str) -> str:
    """
    Fetch weather data for a given city using the Visual Crossing API.
    Returns the JSON response as a string, or an error message as a string.
    """
    if not city:
        return json.dumps({"error": "No city provided."})
    if not API_KEY:
        return json.dumps({"error": "API key not found."})
    url = f"{API_HTTP}{city}?unitGroup=metric&key={API_KEY}&contentType=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.text  # Already a JSON string
    except Exception as e:
        return json.dumps({"error": str(e)})

# if __name__ == "__main__":
#     city = input("Enter city: ")
#     print(get_weather(city)) 