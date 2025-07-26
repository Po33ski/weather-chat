# FastAPI Backend API

FastAPI backend for the Weather Center Chat application, providing weather data APIs and AI chat functionality with enhanced environment management and health monitoring.

## 🚀 Quick Start

```bash
# From backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment (optional for development)
source ../../env-scratchpad.sh
# Edit env-scratchpad.sh with your API keys

# Start the server
uvicorn api.main:app --reload
```

## 📁 API Structure

```
api/
├── main.py              # FastAPI application with all endpoints
├── models.py            # Pydantic request/response models
└── weather_service.py   # Visual Crossing API integration
```

## 🔧 Endpoints

### Health & Status Endpoints

#### `GET /health`
Enhanced health check endpoint with environment status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-15T14:30:00",
  "environment": {
    "has_google_api_key": true,
    "has_visual_crossing_api_key": true,
    "model": "gemini-2.0-flash",
    "disable_web_driver": 0,
    "environment": "development"
  },
  "services": {
    "api": "running",
    "weather_service": "available",
    "ai_chat": "available"
  }
}
```

#### `GET /`
Root endpoint with API information.

**Response:**
```json
{
  "message": "Weather Center Chat API",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

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

**Response:**
```json
{
  "message": "The current weather in London is 18.5°C with partly cloudy conditions...",
  "sender": "ai"
}
```

## 🔐 Environment Variables

### Required Variables
| Variable | Description | Source |
|----------|-------------|---------|
| `VISUAL_CROSSING_API_KEY` | Visual Crossing Weather API key | GitHub Secrets / System Environment |
| `GOOGLE_API_KEY` | Google Cloud API key for ADK | GitHub Secrets / System Environment |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `MODEL` | AI model to use | `gemini-2.0-flash` |
| `DISABLE_WEB_DRIVER` | Disable web driver | `0` |
| `ENVIRONMENT` | Environment mode | `development` |

### Environment Loading Strategy

The API uses an intelligent environment loading system:

1. **System Environment Variables** (highest priority)
2. **System environment variables** (development)
3. **Automatic verification** in production
4. **Graceful warnings** in development

## 📊 Data Models

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

#### ChatRequest
```python
class ChatRequest(BaseModel):
    message: str
    conversation_history: list
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

class ForecastWeatherResponse(BaseModel):
    success: bool
    data: Optional[List[WeatherData]] = None
    error: Optional[str] = None

class HistoryWeatherResponse(BaseModel):
    success: bool
    data: Optional[List[WeatherData]] = None
    error: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    sender: str = "ai"
```

## 🔧 Services

### Weather Service
The `WeatherService` class handles all Visual Crossing API interactions:

- **Current Weather**: Real-time conditions with sunrise/sunset
- **Forecast Weather**: 1-14 day forecasts
- **Historical Weather**: Past weather data
- **Data Validation**: Pydantic model validation
- **Error Handling**: Comprehensive error management
- **Graceful Degradation**: Works without API keys in development

### AI Chat Service
The chat endpoint integrates with Google ADK:

- **Natural Language Processing**: Understands weather queries
- **Weather Tools**: Access to weather data through tools
- **Session Management**: User session handling
- **Error Handling**: Graceful fallback when API key is missing

## 🧪 Development

### Local Development Features
- **Graceful handling** of missing API keys
- **Development-friendly** environment loading
- **Comprehensive health checks** with service status
- **Hot reload** with uvicorn

### Testing
```bash
# Test from project root
python test_local.py

# Test individual endpoints
curl -X POST "http://localhost:8000/api/weather/current" \
  -H "Content-Type: application/json" \
  -d '{"location": "London"}'

curl http://localhost:8000/health
```

### Error Handling
The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common error scenarios:
- Invalid location
- API rate limits
- Network connectivity issues
- Invalid date ranges
- Missing API keys (with helpful messages)

## 📚 API Documentation

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

## 🔒 Security

- **CORS**: Configured for frontend communication
- **API Keys**: Securely stored in environment variables
- **Input Validation**: Pydantic models validate all inputs
- **Error Sanitization**: Sensitive data not exposed in errors
- **Environment Isolation**: Production vs development modes

## 🚀 Deployment

### Docker Support
The API is containerized and ready for deployment:

```bash
# Build and run with Docker
docker build -t weather-backend .
docker run -p 8000:8000 \
  -e VISUAL_CROSSING_API_KEY="your_key" \
  -e GOOGLE_API_KEY="your_key" \
  weather-backend
```

### Render.com Deployment
Configured for deployment to Render.com with:
- **Docker container** deployment
- **GitHub environment variables** integration
- **Automatic health checks**
- **Zero-downtime deployments**

See [DEPLOYMENT.md](../../DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper type hints
3. Include error handling
4. Update API documentation
5. Test all endpoints
6. Ensure Docker compatibility

## 📄 License

This project is licensed under the MIT License. 