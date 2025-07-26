# Weather Center Chat

A comprehensive weather and AI chat application built with Next.js frontend and FastAPI backend, featuring Google ADK for AI chat and Google OAuth for authentication.

## Features

- 🌤️ **Weather Data**: Current, forecast, and historical weather information
- 🤖 **AI Chat**: Powered by Google ADK (Agent Development Kit)
- 🔐 **Authentication**: Google OAuth integration
- 📱 **Responsive Design**: Modern UI with Tailwind CSS
- 🚀 **Fast Performance**: Optimized for speed and user experience
- 🐳 **Docker Ready**: Complete containerization support

## Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Google OAuth** - Authentication

### Backend
- **FastAPI** - Python web framework
- **Google ADK** - AI chat functionality
- **Visual Crossing API** - Weather data
- **PostgreSQL** - Database
- **uv** - Modern Python dependency management

## Quick Start

### Prerequisites

1. **Google Cloud Project**
   - Create a project at [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google AI Studio API
   - Create an API key for Google ADK
   - Create OAuth 2.0 Client ID

2. **Visual Crossing Weather API**
   - Sign up at [Visual Crossing](https://www.visualcrossing.com/weather-api)
   - Get your API key

3. **PostgreSQL Database**
   - Install PostgreSQL locally or use a cloud service

### Option 1: Docker (Recommended)

1. **Set environment variables**:
   ```bash
   source env-scratchpad.sh
   ```

2. **Run with Docker Compose** (includes PostgreSQL):
   ```bash
   docker-compose up --build
   ```

3. **Or run production container**:
   ```bash
   ./deploy-production.sh
   ```

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   uv sync
   ```

3. **Set up environment variables**:
   ```bash
   source ../env-scratchpad.sh
   ```

4. **Run the backend**:
   ```bash
   uv run uvicorn api.main:app --reload
   ```

#### Frontend Setup

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   source ../env-scratchpad.sh
   ```

4. **Run the frontend**:
   ```bash
   npm run dev
   ```

## Environment Variables

### Required Variables (env-scratchpad.sh)
```bash
# PostgreSQL Database
export POSTGRES_DB="weatherdb"
export POSTGRES_USER="popard"
export POSTGRES_PASSWORD="malySlon1"

# Backend
export VISUAL_CROSSING_API_KEY="your_visual_crossing_api_key"
export GOOGLE_API_KEY="your_google_api_key"
export DATABASE_URL="postgresql+psycopg2://popard:malySlon1@localhost:5432/weatherdb"

# Frontend
export NEXT_PUBLIC_API_URL="http://localhost:8000"
export NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_oauth_client_id"
```

## Docker Setup

For detailed Docker instructions, see [DOCKER_README.md](DOCKER_README.md).

### Quick Docker Commands

```bash
# Development with PostgreSQL
docker-compose up --build

# Production deployment
./deploy-production.sh

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session/{session_id}` - Get session info

### Chat
- `POST /api/chat` - AI chat endpoint

### Weather
- `POST /api/weather/current` - Current weather
- `POST /api/weather/forecast` - Weather forecast
- `POST /api/weather/history` - Historical weather

### Health
- `GET /health` - Health check
- `GET /` - API information

## Deployment

### Render.com Deployment
- Use the `render.yaml` configuration
- Set environment variables in Render dashboard
- Deploy from GitHub repository

### Docker Deployment
- Use `./deploy-production.sh` for production
- Use `docker-compose.yml` for development

## Project Structure

```
weather-center-chat/
├── backend/                    # FastAPI backend
│   ├── api/                   # API endpoints
│   ├── agent_system/          # AI agent system
│   ├── pyproject.toml         # Python dependencies
│   └── uv.lock               # Locked dependencies
├── frontend/                   # Next.js frontend
│   ├── src/app/               # React components
│   └── package.json           # Node.js dependencies
├── docker-compose.yml          # Local development
├── Dockerfile                  # Production container
├── env-scratchpad.sh          # Environment variables
├── deploy-production.sh        # Production deployment
└── README.md                  # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker: `docker-compose up --build`
5. Submit a pull request

## License

This project is licensed under the MIT License.





