# Deployment Guide - Weather Center Chat

This guide will help you deploy the Weather Center Chat application to [Render.com](https://render.com/) using GitHub environment variables and modern uv dependency management.

## Prerequisites

- [Render.com](https://render.com/) account
- Visual Crossing Weather API key
- Google Cloud API key (for AI chat)
- GitHub repository with your code

## Local Development Setup

### Setting Up Environment Variables for Local Development

The application is designed to work locally with or without API keys. For full functionality, set up your environment variables:

1. **Copy the example environment file**:
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit the `.env` file** and add your API keys:
   ```bash
   # Visual Crossing Weather API
   VISUAL_CROSSING_API_KEY=your_actual_api_key_here
   
   # Google Cloud API Key for ADK (AI Chat)
   GOOGLE_API_KEY=your_actual_google_key_here
   ```

3. **Start the backend**:
   ```bash
   cd backend
   
   # Using uv (recommended)
   uv sync
   uv run uvicorn api.main:app --reload
   
   # Or using traditional pip
   pip install -e .
   uvicorn api.main:app --reload
   ```

### Local Development Behavior

- **With API keys**: Full functionality (weather + AI chat)
- **Without API keys**: Application starts but shows warnings
  - Weather endpoints return error messages
  - AI chat returns "not available" message
  - Health check shows service status

### Testing Local Setup

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test weather endpoint (will fail without API key)
curl -X POST http://localhost:8000/api/weather/current \
  -H "Content-Type: application/json" \
  -d '{"location": "London"}'

# Test chat endpoint (will return "not available" without API key)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "conversation_history": []}'
```

## Environment Variables Setup

### GitHub Repository Secrets

The backend is configured to use environment variables from GitHub Secrets. Set these up in your GitHub repository:

1. **Go to your GitHub repository**
2. **Navigate to Settings → Secrets and variables → Actions**
3. **Add the following repository secrets**:
   - `VISUAL_CROSSING_API_KEY`: Your Visual Crossing Weather API key
   - `GOOGLE_API_KEY`: Your Google Cloud API key for ADK

### How It Works

The backend application is configured to:
- **Prioritize system environment variables** over `.env` files
- **Automatically verify** that required environment variables are available
- **Provide detailed error messages** if variables are missing
- **Include environment status** in the health check endpoint
- **Work gracefully in development** with missing API keys

## Option 1: Deploy Using Render Blueprint (Recommended)

### 1. Prepare Your Repository

1. **Push your code to GitHub** with all the Docker files and configuration
2. **Ensure your repository structure** matches the expected layout:
   ```
   weather-center-chat/
   ├── backend/
   │   ├── Dockerfile
   │   ├── pyproject.toml
   │   ├── uv.lock
   │   └── ...
   ├── frontend/
   │   ├── Dockerfile
   │   ├── package.json
   │   └── ...
   ├── render.yaml
   ├── .github/workflows/deploy.yml
   └── README.md
   ```

### 2. Deploy on Render

1. **Go to [Render.com](https://render.com/)** and sign in
2. **Click "New +"** and select **"Blueprint"**
3. **Connect your GitHub repository**
4. **Select the repository** containing your Weather Center Chat code
5. **Render will detect the `render.yaml`** file automatically
6. **Configure environment variables**:
   - `VISUAL_CROSSING_API_KEY`: Your Visual Crossing API key
   - `GOOGLE_API_KEY`: Your Google Cloud API key
7. **Click "Apply"** to start the deployment

### 3. Monitor Deployment

- **Backend service** will be deployed first
- **Frontend service** will be deployed after backend is healthy
- **Check the logs** for any build or deployment issues
- **Wait for both services** to show "Live" status

## Option 2: Manual Deployment

### Deploy Backend First

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure the service**:
   - **Name**: `weather-center-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install uv && uv sync --frozen --no-dev`
   - **Start Command**: `uv run uvicorn api.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`
4. **Add environment variables**:
   - `VISUAL_CROSSING_API_KEY`: Your Visual Crossing API key
   - `GOOGLE_API_KEY`: Your Google Cloud API key
5. **Deploy the service**

### Deploy Frontend

1. **Create another Web Service** on Render
2. **Connect the same GitHub repository**
3. **Configure the service**:
   - **Name**: `weather-center-frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `frontend`
4. **Add environment variables**:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com`
5. **Deploy the service**

## Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Source |
|----------|-------------|----------|---------|
| `VISUAL_CROSSING_API_KEY` | Your Visual Crossing Weather API key | Yes | GitHub Secrets / Render |
| `GOOGLE_API_KEY` | Your Google Cloud API key for ADK | Yes | GitHub Secrets / Render |
| `PORT` | Port for the application (set by Render) | Auto | Render |
| `MODEL` | AI model to use (default: gemini-2.0-flash) | No | Environment |
| `DISABLE_WEB_DRIVER` | Disable web driver (default: 0) | No | Environment |

### Frontend Environment Variables

| Variable | Description | Required | Source |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | URL of your backend service | Yes | Render |
| `NODE_ENV` | Environment (set by Render) | Auto | Render |

## Backend Environment Loading

The backend uses an enhanced environment loading system:

### Features
- **Automatic verification** of required environment variables
- **Fallback support** for local `.env` files
- **Detailed error messages** for missing variables
- **Environment status** in health check endpoint

### Health Check Endpoint

Visit `/health` to see the current environment status:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00",
  "environment": {
    "has_google_api_key": true,
    "has_visual_crossing_api_key": true,
    "model": "gemini-2.0-flash",
    "disable_web_driver": 0,
    "environment": "production"
  },
  "services": {
    "api": "running",
    "weather_service": "available",
    "ai_chat": "available"
  }
}
```

## Local Testing with Docker

Before deploying, test locally:

```bash
# Set environment variables
export VISUAL_CROSSING_API_KEY="your_api_key"
export GOOGLE_API_KEY="your_google_key"

# Build and run with Docker Compose
docker-compose up --build

# Test the services
curl http://localhost:8000/health
curl http://localhost:3000/
```

## GitHub Actions Integration

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

- **Runs tests** on every push and pull request
- **Uses GitHub Secrets** for environment variables
- **Validates the build** before deployment
- **Provides deployment instructions**
- **Uses uv for dependency management**

### Setting up GitHub Actions

1. **Enable GitHub Actions** in your repository
2. **Set up repository secrets** (see Environment Variables Setup)
3. **Push to main branch** to trigger the workflow
4. **Check Actions tab** for build status

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in `pyproject.toml`
   - Verify Dockerfile syntax
   - Check build logs in Render dashboard
   - Ensure uv is properly installed in Docker

2. **Environment Variables**:
   - Ensure all required environment variables are set
   - Check that API keys are valid
   - Verify variable names match exactly
   - Use the `/health` endpoint to check environment status

3. **Health Check Failures**:
   - Ensure health check endpoints are working
   - Check that services are binding to `0.0.0.0`
   - Verify port configuration
   - Check environment variable availability

4. **Frontend Can't Connect to Backend**:
   - Check that `NEXT_PUBLIC_API_URL` points to the correct backend URL
   - Ensure CORS is configured properly
   - Verify backend service is healthy

### Debugging

1. **Check Render Logs**:
   - Go to your service dashboard
   - Click on "Logs" tab
   - Look for error messages

2. **Test Endpoints**:
   ```bash
   # Test backend health
   curl https://your-backend.onrender.com/health
   
   # Test frontend
   curl https://your-frontend.onrender.com/
   ```

3. **Check Environment Variables**:
   - Go to service settings
   - Verify all environment variables are set correctly
   - Use the health check endpoint to verify environment status

## Post-Deployment

### Verify Deployment

1. **Test Backend API**:
   - Visit: `https://your-backend.onrender.com/docs`
   - Test the health endpoint: `https://your-backend.onrender.com/health`
   - Try a weather API call

2. **Test Frontend**:
   - Visit: `https://your-frontend.onrender.com/`
   - Test weather functionality
   - Verify API communication

3. **Test AI Chat**:
   - Try the chat functionality
   - Verify Google ADK integration

### Monitoring

- **Set up alerts** in Render dashboard
- **Monitor logs** regularly
- **Check service health** status
- **Monitor API usage** for rate limits
- **Use the health check endpoint** for automated monitoring

## Cost Optimization

- **Use Starter plans** for development/testing
- **Monitor usage** to avoid unexpected charges
- **Consider scaling down** during low usage periods
- **Use Render's free tier** for small projects

## Security Considerations

- **Never commit API keys** to your repository
- **Use GitHub Secrets** for sensitive data
- **Use environment variables** for all sensitive data
- **Enable HTTPS** (automatic on Render)
- **Regularly rotate API keys**
- **Monitor for unusual activity**

## Support

- **Render Documentation**: [docs.render.com](https://docs.render.com/)
- **Render Community**: [community.render.com](https://community.render.com/)
- **GitHub Actions**: [docs.github.com/en/actions](https://docs.github.com/en/actions)
- **uv Documentation**: [docs.astral.sh/uv/](https://docs.astral.sh/uv/)
- **GitHub Issues**: For application-specific issues

---

Your Weather Center Chat application should now be successfully deployed on Render with proper environment variable handling and modern uv dependency management! 🚀 