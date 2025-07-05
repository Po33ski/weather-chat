# Deployment Checklist - Single Container (Deploy Branch)

## 🚀 Deployment Steps

### 1. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions and add these secrets:

#### Backend Secrets:
- `VISUAL_CROSSING_API_KEY` - Your Visual Crossing Weather API key
- `GOOGLE_API_KEY` - Your Google API key for AI chat

#### Frontend Secrets:
- `NEXT_PUBLIC_API_URL` - Your production URL (e.g., `https://your-app.onrender.com`)
- `NEXT_PUBLIC_FIREBASE_API_KEY` - `AIzaSyAF211VEk8d_wEFW5qfFYNCJhhPpEkjtbQ`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - `weather-app-d1527.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - `weather-app-d1527`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - `weather-app-d1527.appspot.com`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - `674980846342`
- `NEXT_PUBLIC_FIREBASE_APP_ID` - `1:674980846342:web:ffbb028f47198ced7fdc87`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - `G-TV3L04WHXG`

### 2. Push to Deploy Branch

```bash
# Create and switch to deploy branch (if not already done)
git checkout -b deploy

# Add all changes
git add .

# Commit changes
git commit -m "Ready for deployment - single container"

# Push to deploy branch
git push origin deploy
```

### 3. Set Up Render.com Service

#### Single Web Service:
1. Go to [Render.com](https://render.com)
2. Create new **Web Service**
3. Connect your GitHub repository
4. Set **Branch** to `deploy`
5. Set **Root Directory** to `.` (root of repository)
6. Set **Build Command**: `docker build -t weather-center-chat .`
7. Set **Start Command**: `docker run -p $PORT:80 weather-center-chat`

#### Environment Variables:
- `VISUAL_CROSSING_API_KEY` - Your Visual Crossing API key
- `GOOGLE_API_KEY` - Your Google API key
- `NEXT_PUBLIC_API_URL` - Your app URL (same as the service URL)
- `NEXT_PUBLIC_FIREBASE_API_KEY` - `AIzaSyAF211VEk8d_wEFW5qfFYNCJhhPpEkjtbQ`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - `weather-app-d1527.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - `weather-app-d1527`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - `weather-app-d1527.appspot.com`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - `674980846342`
- `NEXT_PUBLIC_FIREBASE_APP_ID` - `1:674980846342:web:ffbb028f47198ced7fdc87`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - `G-TV3L04WHXG`

### 4. Deploy

1. **Deploy Single Service**
   - Click "Create Web Service"
   - Wait for Docker build and deployment to complete
   - Your app will be available at the provided URL

2. **Test the Application**
   - Visit your app URL
   - Test weather features
   - Test chat authentication
   - Test AI chat functionality

## ✅ Verification Checklist

- [ ] GitHub Secrets added
- [ ] Code pushed to `deploy` branch
- [ ] Single Web Service created on Render
- [ ] Environment variables set correctly
- [ ] Docker build completes successfully
- [ ] Service deploys successfully
- [ ] Frontend loads correctly
- [ ] Weather API endpoints work (`/api/weather/*`)
- [ ] Firebase authentication works
- [ ] AI chat functionality works
- [ ] Health check endpoint responds (`/health`)

## 🔧 Troubleshooting

### Common Issues:

1. **Docker Build Failures**
   - Check Render logs for specific build errors
   - Verify all files are present (Dockerfile, nginx.conf, start.sh)
   - Ensure dependencies are correctly specified

2. **Port Configuration**
   - Make sure `NEXT_PUBLIC_API_URL` points to your app URL (not `/api`)
   - The app serves both frontend and API from the same domain

3. **CORS Errors**
   - CORS is handled by nginx configuration
   - API requests should go to `/api/*` endpoints

4. **Authentication Issues**
   - Verify Firebase configuration
   - Check that authorized domains include your app URL

5. **API Key Errors**
   - Ensure all API keys are valid and have proper permissions
   - Check that keys are correctly set in environment variables

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify GitHub Actions workflow runs successfully
3. Test endpoints individually (`/health`, `/api/weather/current`)
4. Check browser console for frontend errors

## 🐳 Docker Details

The single container approach:
- **Backend**: FastAPI server running on port 8000
- **Frontend**: Next.js static files served by nginx
- **Nginx**: Reverse proxy routing `/api/*` to backend, serving frontend for other requests
- **Health Check**: Available at `/health` endpoint

## 🚀 Benefits of Single Container

- ✅ Simpler deployment (one service instead of two)
- ✅ No CORS issues (same domain)
- ✅ Easier environment variable management
- ✅ Reduced costs (single service)
- ✅ Faster deployment

---

**Ready to deploy! 🚀** 