# Weather Center Chat - Backend

FastAPI backend for the Weather Center Chat application, providing weather data APIs and AI chat functionality.

## Architecture

```
backend/
├── api/                    # Main API application
│   ├── main.py            # FastAPI app with endpoints
│   ├── models.py          # Pydantic request/response models
│   └── weather_service.py # Visual Crossing API integration
├── agent_system/          # Google ADK agent system
│   └── src/
│       └── multi_tool_agent/
│           ├── agent.py   # Root agent configuration
│           ├── tools/     # Weather tools for agents
│           └── .env       # Environment variables
└── requirements.txt       # Python dependencies
```

## Features

- **🌤️ Weather API**: Current, forecast, and historical weather data
- **🤖 AI Chat**: Google ADK-powered chat assistant with weather tools
- **🔒 Secure**: All external API calls handled by backend
- **📊 Data Validation**: Pydantic models for type safety
- **🚀 Fast**: Async FastAPI with high performance

## API Endpoints

### Weather Endpoints

#### `POST /api/weather/current`
Get current weather for a location.

**Request:**
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
    "conditions": "Partly cloudy",
    "sunrise": "05:30:00",
    "sunset": "20:45:00",
    "timestamp": "2024-06-15T14:30:00",
    "weather_type": "current"
  }
}
```

#### `POST /api/weather/forecast`
Get weather forecast for a location.

**Request:**
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

**Request:**
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

**Request:**
```json
{
  "message": "What's the weather like in London?",
  "conversation_history": []
}
```

#### `GET /health`
Health check endpoint.

## Setup

### Prerequisites

- Python 3.12+
- Visual Crossing Weather API key
- Google Cloud credentials (for AI chat)

### Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   # Create .env file in agent_system/src/multi_tool_agent/
   cp agent_system/src/multi_tool_agent/.env.example agent_system/src/multi_tool_agent/.env
   ```

4. **Edit the .env file:**
   ```env
   VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key
   GOOGLE_API_KEY=your_google_api_key
   ```

5. **Start the server:**
   ```bash
   python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Access API documentation:**
   Navigate to [http://localhost:8000/docs](http://localhost:8000/docs)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VISUAL_CROSSING_API_KEY` | Visual Crossing Weather API key | Yes |
| `GOOGLE_API_KEY` | Google Cloud API key for ADK | Yes |

## Data Models

### WeatherData
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

## Weather Service

The `WeatherService` class handles all Visual Crossing API interactions:

- **Current Weather**: Real-time conditions
- **Forecast Weather**: 1-14 day forecasts
- **Historical Weather**: Past weather data
- **Data Validation**: Pydantic model validation
- **Error Handling**: Comprehensive error management

## Agent System

The backend includes a Google ADK agent system with:

- **Root Agent**: Main chat agent
- **Weather Tools**: Specialized weather data tools
- **Multi-tool Integration**: Combines multiple capabilities
- **Session Management**: User session handling

## Development

### Running in Development
```bash
python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Running in Production
```bash
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```

### Testing
```bash
# Test weather endpoints
curl -X POST "http://localhost:8000/api/weather/current" \
  -H "Content-Type: application/json" \
  -d '{"location": "London"}'

# Test health endpoint
curl http://localhost:8000/health
```

## API Documentation

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

## Error Handling

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

## Security

- **CORS**: Configured for frontend communication
- **API Keys**: Securely stored in environment variables
- **Input Validation**: Pydantic models validate all inputs
- **Error Sanitization**: Sensitive data not exposed in errors

## Contributing

1. Follow the existing code structure
2. Add proper type hints
3. Include error handling
4. Update API documentation
5. Test all endpoints

## License

This project is licensed under the MIT License.
