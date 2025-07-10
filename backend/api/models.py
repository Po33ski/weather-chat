from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date

# Authentication Models
class GoogleAuthRequest(BaseModel):
    id_token: str  # Google ID token from frontend

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None
    provider: str = "google"  # "google" or "email"

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class AuthResponse(BaseModel):
    success: bool
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    user_info: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    error: Optional[str] = None

class LogoutRequest(BaseModel):
    session_id: str

class SessionInfo(BaseModel):
    session_id: str
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    created_at: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    is_active: bool

class GoogleUserInfo(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    sub: str  # Google user ID

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

# Chat Response Models with Description and Table Support
class WeatherDayData(BaseModel):
    description: str
    datetime: str
    temp: float
    tempmax: float
    tempmin: float
    winddir: str
    windspeed: float
    conditions: str
    sunrise: str
    sunset: str
    pressure: Optional[float] = None
    humidity: Optional[float] = None

class ChatCurrentWeatherResponse(BaseModel):
    type: str = "current_weather"
    success: bool
    data: WeatherData
    description: str
    show_table: bool = False

class ChatForecastWeatherResponse(BaseModel):
    type: str = "forecast_weather"
    success: bool
    data: List[WeatherDayData]
    description: str
    show_table: bool = True
    location: str
    period: str = "forecast"

class ChatHistoryWeatherResponse(BaseModel):
    type: str = "history_weather"
    success: bool
    data: List[WeatherDayData]
    description: str
    show_table: bool = True
    location: str
    period: str = "history"

class ChatResponse(BaseModel):
    message: str
    sender: str = "ai"
    weather_data: Optional[Union[ChatCurrentWeatherResponse, ChatForecastWeatherResponse, ChatHistoryWeatherResponse]] = None 