from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date


# Pydantic Models for API
class WeatherLocation(BaseModel):
    city: str
    state: Optional[str] = None
    country: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None

class CurrentWeatherRequest(BaseModel):
    location: str

class ForecastWeatherRequest(BaseModel):
    location: str
    days: int = 7

class HistoryWeatherRequest(BaseModel):
    location: str
    start_date: date
    end_date: date

class WeatherData(BaseModel):
    location: str
    temperature: float
    humidity: Optional[float] = None  # Changed from int to float
    wind_speed: Optional[float] = None
    wind_direction: Optional[Union[str, float]] = None  # Changed to handle both string and float
    pressure: Optional[float] = None
    visibility: Optional[float] = None
    uv_index: Optional[int] = None
    conditions: Optional[str] = None
    icon: Optional[str] = None
    sunrise: Optional[str] = None  # Added sunrise field
    sunset: Optional[str] = None   # Added sunset field
    timestamp: datetime
    weather_type: str

class CurrentWeatherResponse(BaseModel):
    success: bool
    data: Optional[WeatherData] = None
    error: Optional[str] = None

class ForecastWeatherResponse(BaseModel):
    success: bool
    data: Optional[List[WeatherData]] = None
    error: Optional[str] = None

class HistoryWeatherResponse(BaseModel):
    success: bool
    data: Optional[List[WeatherData]] = None
    error: Optional[str] = None

class WeatherStatsResponse(BaseModel):
    success: bool
    location: str
    stats: Dict[str, Any]
    error: Optional[str] = None 

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[Dict[str, Any]]  # Each entry must include text and sender
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    session_id: Optional[str] = None
