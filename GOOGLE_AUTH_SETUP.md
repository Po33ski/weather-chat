# Firebase Authentication Setup Guide

## Overview
This guide will help you set up Firebase authentication for the Weather Center Chat application using your existing Firebase project.

## ✅ Already Configured

Your Firebase configuration is already set up in `frontend/src/app/config/firebase.ts` with:
- **Project ID**: weather-app-d1527
- **API Key**: AIzaSyAF211VEk8d_wEFW5qfFYNCJhhPpEkjtbQ
- **Auth Domain**: weather-app-d1527.firebaseapp.com

## Step 1: Verify Firebase Configuration

The Firebase config is already configured in your project. Make sure the following dependencies are installed:

```bash
cd frontend
npm install firebase react-firebase-hooks
```

## Step 2: Configure Environment Variables

### Frontend (.env.local)
Create a `.env.local` file in the `frontend/` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
Make sure your `backend/.env` file has:

```bash
# Google API Key (for AI chat)
GOOGLE_API_KEY=your_google_api_key_here

# Visual Crossing API Key (for weather data)
VISUAL_CROSSING_API_KEY=your_visual_crossing_api_key_here
```

## Step 3: Test the Setup

1. Start the backend:
   ```bash
   cd backend
   uv run uvicorn api.main:app --reload
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Go to `http://localhost:3000/chat`
4. You should see a "Sign in with Google" button
5. Click it and complete the Firebase authentication flow

## How It Works

### Authentication Flow:
1. User clicks "Sign in with Google"
2. Firebase opens a popup with Google OAuth
3. User authenticates with Google
4. Firebase creates/updates user in your Firebase project
5. User can now access the AI chat feature

### User Management:
- Users are automatically stored in Firebase Authentication
- User data includes: email, display name, photo URL
- Session persists across browser sessions
- Users can logout using the logout button

## Troubleshooting

### Common Issues:

1. **"Firebase not initialized" error**
   - Make sure Firebase dependencies are installed
   - Check that the Firebase config is correct

2. **"Google sign-in popup blocked" error**
   - Allow popups for localhost:3000
   - Try clicking the button again

3. **"Backend not connected" error**
   - Make sure your backend is running on `http://localhost:8000`
   - Check that CORS is properly configured

4. **"Authentication failed" error**
   - Check Firebase console for authentication errors
   - Verify Google sign-in is enabled in Firebase console

## Firebase Console Setup

If you need to modify Firebase settings:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `weather-app-d1527`
3. Go to Authentication > Sign-in method
4. Make sure Google is enabled as a sign-in provider
5. Configure authorized domains if needed

## Security Notes

- Firebase handles all authentication securely
- User data is stored in Firebase Authentication
- API keys are already configured and working
- No additional security setup needed

## Production Deployment

For production deployment:

1. Update authorized domains in Firebase console
2. Set up proper environment variables in your deployment platform
3. Use HTTPS for all URLs
4. Configure proper CORS settings in the backend

## Benefits of Firebase Auth

- **Secure**: Google handles security
- **Simple**: No custom OAuth implementation needed
- **Scalable**: Firebase handles user management
- **Reliable**: Google's infrastructure
- **Free**: Generous free tier for authentication 