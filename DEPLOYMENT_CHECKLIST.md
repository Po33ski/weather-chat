# Weather Center Chat - Deployment Checklist

## Environment Variables Setup

### Backend Environment Variables (Render.com)
Set these in your Render.com service environment variables:

```
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
MODEL=gemini-2.0-flash
DISABLE_WEB_DRIVER=0
ENVIRONMENT=production
```

### Frontend Environment Variables (Render.com)
Set these in your Render.com service environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

## Google Cloud Setup

### 1. Google Cloud Project
- Create a new project or use existing one
- Enable the following APIs:
  - Google AI Studio API
  - Google OAuth2 API

### 2. API Keys
- Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Create an API key for Google AI Studio (ADK)
- Restrict the API key to Google AI Studio API only

### 3. OAuth Client ID
- Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Create OAuth 2.0 Client ID
- Set authorized JavaScript origins:
  - `http://localhost:3000` (for development)
  - `https://your-frontend-domain.com` (for production)
- Set authorized redirect URIs:
  - `http://localhost:3000` (for development)
  - `https://your-frontend-domain.com` (for production)

### 4. Visual Crossing Weather API
- Sign up at [Visual Crossing](https://www.visualcrossing.com/weather-api)
- Get your API key

## Render.com Deployment

### 1. Backend Service
- **Name**: `weather-center-chat-backend`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
- **Branch**: `deploy`

### 2. Frontend Service
- **Name**: `weather-center-chat-frontend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Branch**: `deploy`

### 3. Single Container Deployment (Alternative)
If you prefer to deploy both frontend and backend in one container:

- **Name**: `weather-center-chat`
- **Environment**: `Docker`
- **Dockerfile**: Use the root `Dockerfile`
- **Branch**: `deploy`

## Security Considerations

### 1. API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Restrict API keys to specific domains/IPs

### 2. CORS Configuration
- Update CORS settings in production
- Only allow your frontend domain

### 3. Rate Limiting
- Consider implementing rate limiting for API endpoints
- Monitor usage to prevent abuse

## Testing Deployment

### 1. Health Check
- Test `/health` endpoint
- Verify all services are running

### 2. Authentication
- Test Google OAuth login
- Verify session management

### 3. Chat Functionality
- Test AI chat with weather queries
- Verify weather data retrieval

### 4. Weather API
- Test current weather endpoint
- Test forecast endpoint
- Test historical weather endpoint

## Monitoring

### 1. Logs
- Monitor application logs in Render.com
- Set up error alerting

### 2. Performance
- Monitor response times
- Track API usage

### 3. Costs
- Monitor Google Cloud API usage
- Track Visual Crossing API usage

## Troubleshooting

### Common Issues
1. **CORS errors**: Check CORS configuration
2. **Authentication failures**: Verify Google OAuth setup
3. **API key errors**: Check environment variables
4. **Build failures**: Check dependency versions

### Debug Steps
1. Check Render.com logs
2. Verify environment variables
3. Test endpoints locally
4. Check Google Cloud Console for API usage

## Post-Deployment

### 1. Update Documentation
- Update README with production URLs
- Document any environment-specific configurations

### 2. Set Up Monitoring
- Configure health checks
- Set up error tracking

### 3. Performance Optimization
- Enable caching where appropriate
- Optimize database queries
- Monitor resource usage 