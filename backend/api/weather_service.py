import os
import requests
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
from .models import WeatherData
from agent_system.src.utils.load_env_data import load_env_data, load_visual_crossing_api_key

# Load environment variables
load_env_data()

class WeatherService:
    def __init__(self):
        self.api_key = load_visual_crossing_api_key()
        self.base_url = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline"
        
        if self.api_key:
            print(f"Weather service initialized with API key: {self.api_key[:8]}...")
        else:
            print("⚠️  Weather service initialized without API key - weather features will not work")
            print("   Set VISUAL_CROSSING_API_KEY environment variable for weather functionality")

    def _make_api_request(self, location: str, start_date: str, end_date: str, include: str = "current,days,hours") -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("VISUAL_CROSSING_API_KEY not set. Please set this environment variable to use weather features.")
        
        url = f"{self.base_url}/{location}/{start_date}/{end_date}"
        params = {
            'unitGroup': 'metric',
            'include': include,
            'key': self.api_key,
            'contentType': 'json'
        }
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")

    def _parse_current_weather(self, data: Dict[str, Any], location: str) -> WeatherData:
        current_conditions = data.get('currentConditions', {})
        
        # Handle wind_direction conversion
        wind_dir = current_conditions.get('winddir')
        if wind_dir is not None:
            if isinstance(wind_dir, (int, float)):
                wind_dir = str(int(wind_dir))  # Convert to string
            elif isinstance(wind_dir, str):
                wind_dir = wind_dir
            else:
                wind_dir = None
        
        # Get sunrise/sunset from the first day (current day)
        days = data.get('days', [])
        sunrise = None
        sunset = None
        if days:
            first_day = days[0]
            sunrise = first_day.get('sunrise')
            sunset = first_day.get('sunset')
        
        return WeatherData(
            location=location,
            temperature=current_conditions.get('temp', 0),
            humidity=float(current_conditions.get('humidity', 0)) if current_conditions.get('humidity') is not None else None,
            wind_speed=current_conditions.get('windspeed'),
            wind_direction=wind_dir,
            pressure=current_conditions.get('pressure'),
            visibility=current_conditions.get('visibility'),
            uv_index=current_conditions.get('uvindex'),
            conditions=current_conditions.get('conditions'),
            icon=current_conditions.get('icon'),
            sunrise=sunrise,
            sunset=sunset,
            timestamp=datetime.now(),
            weather_type='current'
        )

    def _parse_forecast_weather(self, data: Dict[str, Any], location: str) -> List[WeatherData]:
        days = data.get('days', [])
        weather_data = []
        
        for day in days:
            # Handle wind_direction conversion
            wind_dir = day.get('winddir')
            if wind_dir is not None:
                if isinstance(wind_dir, (int, float)):
                    wind_dir = str(int(wind_dir))  # Convert to string
                elif isinstance(wind_dir, str):
                    wind_dir = wind_dir
                else:
                    wind_dir = None
            
            weather_data.append(WeatherData(
                location=location,
                temperature=day.get('temp', 0),
                humidity=float(day.get('humidity', 0)) if day.get('humidity') is not None else None,
                wind_speed=day.get('windspeed'),
                wind_direction=wind_dir,
                pressure=day.get('pressure'),
                visibility=day.get('visibility'),
                uv_index=day.get('uvindex'),
                conditions=day.get('conditions'),
                icon=day.get('icon'),
                sunrise=day.get('sunrise'),
                sunset=day.get('sunset'),
                timestamp=datetime.strptime(day.get('datetime', ''), '%Y-%m-%d'),
                weather_type='forecast'
            ))
        
        return weather_data

    def _parse_history_weather(self, data: Dict[str, Any], location: str) -> List[WeatherData]:
        days = data.get('days', [])
        weather_data = []
        
        for day in days:
            # Handle wind_direction conversion
            wind_dir = day.get('winddir')
            if wind_dir is not None:
                if isinstance(wind_dir, (int, float)):
                    wind_dir = str(int(wind_dir))  # Convert to string
                elif isinstance(wind_dir, str):
                    wind_dir = wind_dir
                else:
                    wind_dir = None
            
            weather_data.append(WeatherData(
                location=location,
                temperature=day.get('temp', 0),
                humidity=float(day.get('humidity', 0)) if day.get('humidity') is not None else None,
                wind_speed=day.get('windspeed'),
                wind_direction=wind_dir,
                pressure=day.get('pressure'),
                visibility=day.get('visibility'),
                uv_index=day.get('uvindex'),
                conditions=day.get('conditions'),
                icon=day.get('icon'),
                sunrise=day.get('sunrise'),
                sunset=day.get('sunset'),
                timestamp=datetime.strptime(day.get('datetime', ''), '%Y-%m-%d'),
                weather_type='history'
            ))
        
        return weather_data

    def get_current_weather(self, location: str) -> WeatherData:
        today = date.today().strftime('%Y-%m-%d')
        data = self._make_api_request(location, today, today, "current")
        return self._parse_current_weather(data, location)

    def get_forecast_weather(self, location: str, days: int = 7) -> List[WeatherData]:
        start_date = date.today().strftime('%Y-%m-%d')
        end_date = (date.today() + timedelta(days=days-1)).strftime('%Y-%m-%d')
        data = self._make_api_request(location, start_date, end_date, "days")
        return self._parse_forecast_weather(data, location)

    def get_history_weather(self, location: str, start_date: date, end_date: date) -> List[WeatherData]:
        start_str = start_date.strftime('%Y-%m-%d')
        end_str = end_date.strftime('%Y-%m-%d')
        data = self._make_api_request(location, start_str, end_str, "days")
        return self._parse_history_weather(data, location) 