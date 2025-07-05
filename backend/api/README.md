# FastAPI Backend API

FastAPI backend for the Weather Center Chat application, providing weather data APIs and AI chat functionality.

## API Structure

```
api/
├── main.py              # FastAPI application with all endpoints
├── models.py            # Pydantic request/response models
└── weather_service.py   # Visual Crossing API integration
```

## Endpoints

### Weather Endpoints

#### `POST /api/weather/current`
Get current weather for a location.

**Request Body:**
```json
{
  "location": "London"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location": "London",
    "temperature": 18.5,
    "humidity": 65.2,
    "wind_speed": 12.3,
    "wind_direction": "180",
    "pressure": 1013.2,
    "visibility": 10.0,
    "uv_index": 5,
    "conditions": "Partly cloudy",
    "icon": "partly-cloudy-day",
    "sunrise": "05:30:00",
    "sunset": "20:45:00",
    "timestamp": "2024-06-15T14:30:00",
    "weather_type": "current"
  }
}
```

#### `POST /api/weather/forecast`
Get weather forecast for a location.

**Request Body:**
```json
{
  "location": "London",
  "days": 7
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "location": "London",
      "temperature": 18.5,
      "humidity": 65.2,
      "wind_speed": 12.3,
      "wind_direction": "180",
      "pressure": 1013.2,
      "conditions": "Partly cloudy",
      "sunrise": "05:30:00",
      "sunset": "20:45:00",
      "timestamp": "2024-06-15T00:00:00",
      "weather_type": "forecast"
    }
  ]
}
```

#### `POST /api/weather/history`
Get historical weather data for a location.

**Request Body:**
```json
{
  "location": "London",
  "start_date": "2024-06-01",
  "end_date": "2024-06-07"
}
```

### Chat Endpoints

#### `POST /api/chat`
Chat with AI assistant powered by Google ADK.

**Request Body:**
```json
{
  "message": "What's the weather like in London?",
  "conversation_history": []
}
```

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Setup

### Prerequisites

- Python 3.12+
- Visual Crossing Weather API key
- Google Cloud credentials (for AI chat)

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   # Create .env file in agent_system/src/multi_tool_agent/
   cp ../agent_system/src/multi_tool_agent/.env.example ../agent_system/src/multi_tool_agent/.env
   ```

3. **Edit the .env file:**
   ```env
   VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key
   GOOGLE_API_KEY=your_google_api_key
   ```

4. **Run the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access API documentation:**
   Navigate to [http://localhost:8000/docs](http://localhost:8000/docs)

## Data Models

### Request Models

#### CurrentWeatherRequest
```python
class CurrentWeatherRequest(BaseModel):
    location: str
```

#### ForecastWeatherRequest
```python
class ForecastWeatherRequest(BaseModel):
    location: str
    days: int = 7
```

#### HistoryWeatherRequest
```python
class HistoryWeatherRequest(BaseModel):
    location: str
    start_date: date
    end_date: date
```

### Response Models

#### WeatherData
```python
class WeatherData(BaseModel):
    location: str
    temperature: float
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[Union[str, float]] = None
    pressure: Optional[float] = None
    visibility: Optional[float] = None
    uv_index: Optional[int] = None
    conditions: Optional[str] = None
    icon: Optional[str] = None
    sunrise: Optional[str] = None
    sunset: Optional[str] = None
    timestamp: datetime
    weather_type: str
```

#### API Response Wrapper
```python
class CurrentWeatherResponse(BaseModel):
    success: bool
    data: Optional[WeatherData] = None
    error: Optional[str] = None
```

## Weather Service

The `WeatherService` class provides:

- **Visual Crossing API Integration**: Direct communication with weather data provider
- **Data Parsing**: Converts API responses to standardized format
- **Error Handling**: Comprehensive error management
- **Type Safety**: Pydantic model validation

### Key Methods

- `get_current_weather(location: str)`: Get current weather
- `get_forecast_weather(location: str, days: int)`: Get forecast
- `get_history_weather(location: str, start_date: date, end_date: date)`: Get historical data

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common error scenarios:
- Invalid location names
- API rate limits exceeded
- Network connectivity issues
- Invalid date ranges
- Missing API keys

## Security Features

- **CORS Configuration**: Configured for frontend communication
- **API Key Security**: Keys stored in environment variables, never exposed
- **Input Validation**: All inputs validated with Pydantic models
- **Error Sanitization**: Sensitive data not exposed in error messages

## Testing

### Manual Testing
```bash
# Test current weather
curl -X POST "http://localhost:8000/api/weather/current" \
  -H "Content-Type: application/json" \
  -d '{"location": "London"}'

# Test forecast
curl -X POST "http://localhost:8000/api/weather/forecast" \
  -H "Content-Type: application/json" \
  -d '{"location": "London", "days": 7}'

# Test health endpoint
curl http://localhost:8000/health
```

### API Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Notes

- The backend loads API keys securely from the `.env` file located in the `agent_system/src/multi_tool_agent/` directory
- The API does **not** expose API keys to the frontend or clients
- All weather data is fetched from Visual Crossing Weather API
- AI chat functionality is powered by Google ADK with integrated weather tools
- The API uses Pydantic models for request/response validation and type safety 