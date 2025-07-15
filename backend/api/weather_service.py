import os
import requests
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
from .models import WeatherData
from agent_system.src.utils.load_env_data import load_env_data
from agent_system.src.multi_tool_agent.tools.get_current_weather import get_current_weather as tool_get_current_weather
from agent_system.src.multi_tool_agent.tools.get_forecast import get_forecast as tool_get_forecast
from agent_system.src.multi_tool_agent.tools.get_history_weather import get_history_weather as tool_get_history_weather
import json

# Load environment variables
load_env_data()

class WeatherService:
    def __init__(self):
        pass  # No need to load API key here, handled by tools

    def _parse_current_weather(self, data: Dict[str, Any], location: str) -> WeatherData:
        current_conditions = data.get('currentConditions', {})
        wind_dir = current_conditions.get('winddir')
        if wind_dir is not None:
            if isinstance(wind_dir, (int, float)):
                wind_dir = str(int(wind_dir))
            elif isinstance(wind_dir, str):
                wind_dir = wind_dir
            else:
                wind_dir = None
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
            wind_speed=current_conditions.get('wspd'),
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
            wind_dir = day.get('winddir')
            if wind_dir is not None:
                if isinstance(wind_dir, (int, float)):
                    wind_dir = str(int(wind_dir))
                elif isinstance(wind_dir, str):
                    wind_dir = wind_dir
                else:
                    wind_dir = None
            weather_data.append(WeatherData(
                location=location,
                temperature=day.get('temp', 0),
                humidity=float(day.get('humidity', 0)) if day.get('humidity') is not None else None,
                wind_speed=day.get('wspd'),
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
            wind_dir = day.get('winddir')
            if wind_dir is not None:
                if isinstance(wind_dir, (int, float)):
                    wind_dir = str(int(wind_dir))
                elif isinstance(wind_dir, str):
                    wind_dir = wind_dir
                else:
                    wind_dir = None
            weather_data.append(WeatherData(
                location=location,
                temperature=day.get('temp', 0),
                humidity=float(day.get('humidity', 0)) if day.get('humidity') is not None else None,
                wind_speed=day.get('wspd'),
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

    def get_current_weather(self, location: str, unit_system: Optional[str] = None) -> WeatherData:
        json_str = tool_get_current_weather(location, unit_system or "METRIC")
        data = json.loads(json_str)
        return self._parse_current_weather(data, location)

    def get_forecast_weather(self, location: str, days: int = 7, unit_system: Optional[str] = None) -> List[WeatherData]:
        json_str = tool_get_forecast(location, unit_system or "METRIC")
        data = json.loads(json_str)
        return self._parse_forecast_weather(data, location)

    def get_history_weather(self, location: str, start_date: date, end_date: date, unit_system: Optional[str] = None) -> List[WeatherData]:
        json_str = tool_get_history_weather(location, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'), unit_system or "METRIC")
        data = json.loads(json_str)
        return self._parse_history_weather(data, location) 