# Weather Center Chat

A comprehensive weather and AI chat application built with Next.js frontend and FastAPI backend, featuring Google ADK for AI chat and Google OAuth for authentication.

## Features

- 🌤️ **Weather Data**: Current, forecast, and historical weather information
- 🤖 **AI Chat**: Powered by Google ADK (Agent Development Kit)
- 🔐 **Authentication**: Google OAuth integration
- 📱 **Responsive Design**: Modern UI with Tailwind CSS
- 🚀 **Fast Performance**: Optimized for speed and user experience

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
- **Google OAuth** - Authentication verification

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

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   source env-scratchpad.sh
   # Edit env-scratchpad.sh with your actual API keys
   ```

4. **Run the backend**
   ```bash
   uvicorn api.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   source env-scratchpad.sh
   # Edit env-scratchpad.sh with your actual API keys
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```

## Environment Variables

### Environment Variables (env-scratchpad.sh)
```bash
# Backend
export VISUAL_CROSSING_API_KEY="your_visual_crossing_api_key"
export GOOGLE_API_KEY="your_google_api_key"
export DATABASE_URL="postgresql+psycopg2://popard:malySlon1@localhost:5432/weatherdb"

# Frontend
export NEXT_PUBLIC_API_URL="http://localhost:8000"
export NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_oauth_client_id"
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

## Google Cloud Setup

### 1. Enable APIs
- Google AI Studio API
- Google OAuth2 API

### 2. Create API Key
- Go to [Credentials](https://console.cloud.google.com/apis/credentials)
- Create API key for Google AI Studio
- Restrict to Google AI Studio API only

### 3. Create OAuth Client ID
- Go to [Credentials](https://console.cloud.google.com/apis/credentials)
- Create OAuth 2.0 Client ID
- Set authorized origins:
  - `http://localhost:3000` (development)
  - `https://your-domain.com` (production)

## Deployment

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

### Quick Deploy to Render.com

1. **Backend Service**
   - Environment: Python 3
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`

2. **Frontend Service**
   - Environment: Node
   - Build: `npm install && npm run build`
   - Start: `npm start`

## Project Structure

```
weather-center-chat/
├── backend/
│   ├── api/
│   │   ├── main.py              # FastAPI app
│   │   ├── auth_service.py      # Authentication service
│   │   ├── weather_service.py   # Weather API service
│   │   └── models.py            # Pydantic models
│   ├── agent_system/            # Google ADK agents
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── components/      # React components
│   │       ├── chat/           # Chat page
│   │       └── views/          # Page views
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the [deployment checklist](DEPLOYMENT_CHECKLIST.md)
2. Review the [project status](PROJECT_STATUS.md)
3. Open an issue on GitHub





