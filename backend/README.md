# Weather Center Chat - Backend

FastAPI backend for the Weather Center Chat application, providing weather data APIs and AI chat functionality with Docker support and secure environment variable handling.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# From project root
docker-compose up backend

# Or build and run backend only
cd backend
docker build -t weather-backend .
docker run -p 8000:8000 \
  -e VISUAL_CROSSING_API_KEY="your_key" \
  -e GOOGLE_API_KEY="your_key" \
  weather-backend
```

### Option 2: Local Development with uv

```bash
cd backend

# Install dependencies using uv (recommended)
uv sync

# Or install dependencies with dev tools
uv sync --dev

# Set up environment (optional for development)
source ../env-scratchpad.sh
# Edit env-scratchpad.sh with your API keys

# Start the server
uv run uvicorn api.main:app --reload
```

### Option 3: Traditional pip (fallback)

```bash
cd backend

# Install dependencies
pip install -e .

# Set up environment (optional for development)
source ../env-scratchpad.sh
# Edit env-scratchpad.sh with your API keys

# Start the server
uvicorn api.main:app --reload
```

## 📁 Architecture

```
backend/
├── api/                    # Main API application
│   ├── main.py            # FastAPI app with endpoints
│   ├── models.py          # Pydantic request/response models
│   └── weather_service.py # Visual Crossing API integration
├── agent_system/          # Google ADK agent system
│   └── src/
│       ├── multi_tool_agent/
│       │   ├── agent.py   # Root agent configuration
│       │   └── tools/     # Weather tools for agents
│       └── utils/
│           └── load_env_data.py # Environment loading utility
├── Dockerfile             # Docker configuration
├── env.example            # Environment template
├── pyproject.toml         # Project configuration and dependencies
├── uv.lock                # Locked dependencies (uv)
└── README.md
```

## ✨ Features

- **🌤️ Weather API**: Current, forecast, and historical weather data
- **🤖 AI Chat**: Google ADK-powered chat assistant with weather tools
- **🔒 Secure**: All external API calls handled by backend
- **📊 Data Validation**: Pydantic models for type safety
- **🚀 Fast**: Async FastAPI with high performance
- **🐳 Docker Ready**: Containerized deployment
- **🔐 Environment Management**: Flexible environment variable handling
- **⚡ Modern Dependencies**: uv for fast dependency management

## 🔧 API Endpoints

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
Enhanced health check endpoint with environment status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-15T14:30:00",
  "environment": {
    "has_google_api_key": true,
    "has_visual_crossing_api_key": true,
    "model": "gemini-2.5-flash",
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

## 🔐 Environment Variables

### Required Variables
| Variable | Description | Source |
|----------|-------------|---------|
| `VISUAL_CROSSING_API_KEY` | Visual Crossing Weather API key | GitHub Secrets / System Environment |
| `GOOGLE_API_KEY` | Google Cloud API key for ADK | GitHub Secrets / System Environment |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `MODEL` | AI model to use | `gemini-2.5-flash` |
| `DISABLE_WEB_DRIVER` | Disable web driver | `0` |
| `ENVIRONMENT` | Environment mode | `development` |
| `VERIFY_ENV` | Force environment verification | `false` |

> **Note:** The backend uses a local SQLite database file (`database.db`) in the backend directory. No external database or `DATABASE_URL` is required. The file is created automatically on first run.

### Environment Loading Strategy

The backend uses an intelligent environment loading system:

1. **System Environment Variables** (highest priority)
2. **System environment variables** (development)
3. **Automatic verification** in production
4. **Graceful warnings** in development

### Local Development Setup

```bash
# Source environment variables
source ../env-scratchpad.sh

# Edit env-scratchpad.sh with your API keys
VISUAL_CROSSING_API_KEY=your_actual_api_key
GOOGLE_API_KEY=your_actual_google_key
```

## 🐳 Docker Deployment

### Architecture with Nginx
- **Nginx** serves static frontend files from `/app/frontend/out`.
- **Nginx** proxies `/api/` requests to the FastAPI backend running on `127.0.0.1:8000`.
- All other requests fallback to `index.html` for client-side routing (Next.js/React Router).
- Both frontend and backend are available on the same domain and port (e.g., `http://localhost` or your Render URL).

### Dockerfile Features
- **Multi-stage build** for optimization
- **Security**: Non-root user execution
- **Health checks** for monitoring
- **Environment variable support**
- **uv dependency management** for faster builds
- **Uses SQLite as the only database (no Postgres required)**
- **Nginx reverse proxy for unified frontend/backend serving**

### Docker Commands

```bash
# Build image
docker build -t weather-backend .

# Run with environment variables
# (No database configuration needed; SQLite file is created automatically)
docker run -p 80:80 \
  -e VISUAL_CROSSING_API_KEY="your_key" \
  -e GOOGLE_API_KEY="your_key" \
  weather-backend
```

> **Note:** API calls from the frontend should use relative URLs (e.g., `/api/weather/current`).

## 📊 Data Models

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

## 🔧 Services

### Weather Service
The `WeatherService` class handles all Visual Crossing API interactions:

- **Current Weather**: Real-time conditions
- **Forecast Weather**: 1-14 day forecasts
- **Historical Weather**: Past weather data
- **Data Validation**: Pydantic model validation
- **Error Handling**: Comprehensive error management
- **Graceful Degradation**: Works without API keys in development

### Agent System
The backend includes a Google ADK agent system with:

- **Root Agent**: Main chat agent
- **Weather Tools**: Specialized weather data tools
- **Multi-tool Integration**: Combines multiple capabilities
- **Session Management**: User session handling

## 🧪 Development

### Local Development Features
- **Graceful handling** of missing API keys
- **Development-friendly** environment loading
- **Comprehensive health checks** with service status
- **Hot reload** with uvicorn
- **Fast dependency management** with uv

### Running in Development
```bash
# Using uv (recommended)
uv run uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# Using traditional pip
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Running in Production
```bash
# Using uv
uv run uvicorn api.main:app --host 0.0.0.0 --port 8000

# Using traditional pip
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

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

### Development Tools
```bash
# Install development dependencies
uv sync --dev

# Run tests
uv run pytest

# Format code
uv run black .
uv run isort .

# Lint code
uv run flake8
```

## 📚 API Documentation

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

## 🛡️ Error Handling

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

## 🔒 Security

- **CORS**: Configured for frontend communication
- **API Keys**: Securely stored in environment variables
- **Input Validation**: Pydantic models validate all inputs
- **Error Sanitization**: Sensitive data not exposed in errors
- **Docker Security**: Non-root user execution
- **Environment Isolation**: Production vs development modes

## 🚀 Deployment

### Render.com Deployment
The backend and frontend are both served from the same container using Nginx. The public Render URL serves both the frontend and proxies API requests to the backend.

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

### Environment Variable Management
- **GitHub Secrets**: For production deployments
- **Render Environment Variables**: For platform-specific settings
- **System environment variables**: For development

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper type hints
3. Include error handling
4. Update API documentation
5. Test all endpoints
6. Ensure Docker compatibility
7. Use uv for dependency management
