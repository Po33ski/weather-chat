# Weather Center Chat

A comprehensive weather and AI chat application built with Next.js frontend and FastAPI backend, featuring Google ADK for AI chat and Visual Crossing API for weather data.

## 🌟 Features

- **AI Chat Assistant**: Powered by Google ADK with weather-specific tools
- **Weather Data**: Current, forecast, and historical weather information
- **Google Authentication**: Secure Firebase authentication for chat access
- **Real-time Updates**: Live weather data and chat responses
- **Responsive Design**: Modern UI that works on all devices
- **Docker Support**: Easy deployment with Docker containers

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Python 3.12 and uv dependency management
- **Authentication**: Firebase Authentication with Google OAuth
- **AI**: Google ADK with custom weather tools and sub-agents
- **Weather API**: Visual Crossing Weather API
- **Deployment**: Render.com with Docker containers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.12+
- uv (Python package manager)
- Firebase project
- Google API key
- Visual Crossing API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd weather-center-chat
   ```

2. **Set up environment variables**
   
   **Backend** (`backend/.env`):
   ```bash
   GOOGLE_API_KEY=your_google_api_key_here
   VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here
   ```
   
   **Frontend** (`frontend/.env.local`):
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Start the backend**
   ```bash
   cd backend
   uv sync
   uv run uvicorn api.main:app --reload
   ```

4. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔐 Security

### Environment Variables

All sensitive data is stored as environment variables and never committed to version control:

- **Backend**: Google API key, Visual Crossing API key
- **Frontend**: Firebase configuration, API URLs

### GitHub Actions

The project uses GitHub Actions for CI/CD with secrets management:
- All API keys are stored as GitHub Secrets
- Environment variables are injected during build and deployment
- No sensitive data is exposed in logs or code

### Firebase Authentication

- Google OAuth integration for secure user authentication
- User data stored securely in Firebase
- Session management handled by Firebase
- No custom authentication implementation

## 📚 Documentation

- [Backend API Documentation](backend/api/README.md)
- [Firebase Setup Guide](FIREBASE_ENV_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)

## 🛠️ Development

### Project Structure

```
weather-center-chat/
├── backend/                 # FastAPI backend
│   ├── api/                # API endpoints and models
│   ├── agent_system/       # Google ADK agent system
│   ├── pyproject.toml      # Python dependencies (uv)
│   └── Dockerfile          # Backend container
├── frontend/               # Next.js frontend
│   ├── src/app/           # App components and pages
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Frontend container
├── docker-compose.yml     # Local development
├── render.yaml            # Render deployment config
└── .github/workflows/     # GitHub Actions CI/CD
```

### Key Components

- **Chat System**: Firebase authentication + Google ADK integration
- **Weather Service**: Visual Crossing API integration with Pydantic models
- **Agent System**: Custom weather tools and sub-agents
- **Frontend**: Modern React components with TypeScript

## 🚀 Deployment

### Render.com Deployment

1. **Set up GitHub Secrets** (see [Firebase Setup Guide](FIREBASE_ENV_SETUP.md))
2. **Configure Render.com services** using `render.yaml`
3. **Deploy automatically** via GitHub Actions

### Docker Deployment

```bash
# Local development
docker-compose up

# Production
docker build -t weather-center-chat .
docker run -p 8000:8000 weather-center-chat
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Note**: This application requires valid API keys for Google ADK and Visual Crossing Weather API to function properly. Make sure to set up all environment variables before running the application.





