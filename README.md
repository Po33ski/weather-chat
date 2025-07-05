# Weather Center Chat

A modern weather application with AI chat integration powered by Google ADK, built with Next.js frontend and FastAPI backend. The application provides current weather, forecasts, historical data, and AI-powered chat assistance.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd weather-center-chat

# Set environment variables
export VISUAL_CROSSING_API_KEY="your_api_key"
export GOOGLE_API_KEY="your_google_key"

# Start with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development

#### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- Visual Crossing Weather API key
- Google Cloud credentials (for AI chat)

#### Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment (optional for development)
cp env.example .env
# Edit .env with your API keys

# Start the server
uvicorn api.main:app --reload
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 📁 Project Structure

```
weather-center-chat/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # React components
│   │   │   ├── views/          # Page components
│   │   │   ├── services/       # API services
│   │   │   └── ...
│   │   └── ...
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── backend/           # FastAPI application
│   ├── api/           # Main API application
│   │   ├── main.py    # FastAPI app with endpoints
│   │   ├── models.py  # Pydantic models
│   │   └── weather_service.py # Weather API service
│   ├── agent_system/  # Google ADK agent system
│   ├── Dockerfile
│   ├── requirements.txt
│   └── env.example
├── docker-compose.yml # Local development setup
├── render.yaml        # Render deployment configuration
├── DEPLOYMENT.md      # Detailed deployment guide
└── README.md
```

## ✨ Features

- **🌤️ Weather Data**: Current weather, forecasts, and historical data
- **🤖 AI Chat Assistant**: Powered by Google ADK with weather tools
- **🔒 Secure Architecture**: Backend handles all external API calls
- **📱 Modern UI**: Responsive design with Tailwind CSS
- **🔧 Type Safety**: Full TypeScript support with Pydantic models
- **📊 Data Visualization**: Interactive weather displays and charts
- **🐳 Docker Support**: Easy deployment with Docker and Docker Compose
- **☁️ Cloud Ready**: Deploy to Render.com with GitHub environment variables

## 🏗️ Architecture

### Secure Backend-First Design
- **Frontend** communicates only with our **Backend API**
- **Backend** handles all external API calls (Visual Crossing Weather API, Google ADK)
- **No direct API calls** from frontend to external services
- **Enhanced security** with API keys stored securely in backend

### Data Flow
1. User enters location in frontend
2. Frontend sends request to our backend API
3. Backend calls Visual Crossing Weather API
4. Backend processes and validates data with Pydantic models
5. Backend returns clean, validated JSON to frontend
6. Frontend displays weather data

## 🌐 Application Pages

### Weather Pages
- **`/current`**: Real-time weather conditions with hourly breakdown
- **`/forecast`**: 15-day weather forecast
- **`/history`**: Historical weather data with date range selection

### Features
- **Current Weather**: Temperature, humidity, wind, pressure, UV index, sunrise/sunset
- **Forecast**: Daily temperature ranges, conditions, wind data
- **History**: Past weather data and trends
- **AI Chat**: Weather-related queries powered by Google ADK
- **Measurement Systems**: Metric, Imperial (British), Imperial (American)

## 🔧 API Endpoints

### Weather Endpoints
- `POST /api/weather/current` - Get current weather for a location
- `POST /api/weather/forecast` - Get weather forecast (1-14 days)
- `POST /api/weather/history` - Get historical weather data

### Chat Endpoints
- `POST /api/chat` - Chat with AI assistant
- `GET /health` - Health check with environment status

### Example Requests

**Current Weather:**
```bash
curl -X POST "http://localhost:8000/api/weather/current" \
  -H "Content-Type: application/json" \
  -d '{"location": "London"}'
```

**Forecast Weather:**
```bash
curl -X POST "http://localhost:8000/api/weather/forecast" \
  -H "Content-Type: application/json" \
  -d '{"location": "London", "days": 7}'
```

**Health Check:**
```bash
curl http://localhost:8000/health
```

## 🔐 Environment Variables

### Backend Environment
```env
# Required
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key
GOOGLE_API_KEY=your_google_api_key

# Optional
MODEL=gemini-2.0-flash
DISABLE_WEB_DRIVER=0
ENVIRONMENT=development
```

### Frontend Environment
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚀 Deployment

### Local Testing
```bash
# Test the application
python test_local.py

# Or use Docker Compose
docker-compose up --build
```

### Production Deployment
The application is configured for deployment to [Render.com](https://render.com/) with:

- **Docker containers** for both frontend and backend
- **GitHub environment variables** for secure API key management
- **Automatic health checks** and monitoring
- **Zero-downtime deployments**

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🧪 Development

### Local Development Features
- **Graceful handling** of missing API keys
- **Development-friendly** environment loading
- **Comprehensive health checks** with service status
- **Hot reload** for both frontend and backend

### Testing
```bash
# Test backend functionality
python test_local.py

# Test with Docker
docker-compose up --build
```

### Environment Setup
1. **Copy environment template**: `cp backend/env.example backend/.env`
2. **Add your API keys** to the `.env` file
3. **Start the services** (see Quick Start section)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: [Weather Center Chat](https://weather-center-ts-new.vercel.app/)
- **API Documentation**: Available at `/docs` when backend is running
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Weather Center Chat** - Your intelligent weather companion! 🌤️🤖





