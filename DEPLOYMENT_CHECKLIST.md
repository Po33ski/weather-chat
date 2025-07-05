# Deployment Checklist - Deploy Branch

## 🚀 Deployment Steps

### 1. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions and add these secrets:

#### Backend Secrets:
- `VISUAL_CROSSING_API_KEY` - Your Visual Crossing Weather API key
- `GOOGLE_API_KEY` - Your Google API key for AI chat

#### Frontend Secrets:
- `NEXT_PUBLIC_API_URL` - Your production backend URL (e.g., `https://your-backend.onrender.com`)
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
git commit -m "Ready for deployment"

# Push to deploy branch
git push origin deploy
```

### 3. Set Up Render.com Services

#### Backend Service:
1. Go to [Render.com](https://render.com)
2. Create new **Web Service**
3. Connect your GitHub repository
4. Set **Branch** to `deploy`
5. Set **Root Directory** to `backend`
6. Set **Build Command**: `uv sync && uv run uvicorn api.main:app --host 0.0.0.0 --port $PORT`
7. Set **Start Command**: `uv run uvicorn api.main:app --host 0.0.0.0 --port $PORT`

#### Backend Environment Variables:
- `VISUAL_CROSSING_API_KEY` - Your Visual Crossing API key
- `GOOGLE_API_KEY` - Your Google API key

#### Frontend Service:
1. Create another **Web Service**
2. Connect your GitHub repository
3. Set **Branch** to `deploy`
4. Set **Root Directory** to `frontend`
5. Set **Build Command**: `npm install && npm run build`
6. Set **Start Command**: `npm start`

#### Frontend Environment Variables:
- `NEXT_PUBLIC_API_URL` - Your backend service URL
- `NEXT_PUBLIC_FIREBASE_API_KEY` - `AIzaSyAF211VEk8d_wEFW5qfFYNCJhhPpEkjtbQ`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - `weather-app-d1527.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - `weather-app-d1527`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - `weather-app-d1527.appspot.com`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - `674980846342`
- `NEXT_PUBLIC_FIREBASE_APP_ID` - `1:674980846342:web:ffbb028f47198ced7fdc87`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - `G-TV3L04WHXG`

### 4. Deploy

1. **Deploy Backend First**
   - Click "Create Web Service" for backend
   - Wait for deployment to complete
   - Copy the backend URL

2. **Update Frontend Environment**
   - Set `NEXT_PUBLIC_API_URL` to your backend URL
   - Deploy frontend service

3. **Test the Application**
   - Visit your frontend URL
   - Test weather features
   - Test chat authentication
   - Test AI chat functionality

## ✅ Verification Checklist

- [ ] GitHub Secrets added
- [ ] Code pushed to `deploy` branch
- [ ] Backend service created on Render
- [ ] Frontend service created on Render
- [ ] Environment variables set correctly
- [ ] Backend deploys successfully
- [ ] Frontend deploys successfully
- [ ] Weather API endpoints work
- [ ] Firebase authentication works
- [ ] AI chat functionality works
- [ ] Health check endpoint responds

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Render logs for specific errors
   - Verify all environment variables are set
   - Ensure dependencies are correctly specified

2. **CORS Errors**
   - Make sure `NEXT_PUBLIC_API_URL` is correct
   - Check that backend CORS allows frontend domain

3. **Authentication Issues**
   - Verify Firebase configuration
   - Check that authorized domains include your frontend URL

4. **API Key Errors**
   - Ensure all API keys are valid and have proper permissions
   - Check that keys are correctly set in environment variables

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify GitHub Actions workflow runs successfully
3. Test endpoints individually
4. Check browser console for frontend errors

---

**Ready to deploy! 🚀** 