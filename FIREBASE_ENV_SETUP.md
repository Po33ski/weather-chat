# Firebase Environment Variables Setup

## Security Notice
⚠️ **IMPORTANT**: Never commit Firebase API keys or configuration to version control. Always use environment variables.

## Step 1: Get Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `weather-app-d1527`
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on your web app
6. Copy the configuration values

## Step 2: Local Development Setup

Create a `.env.local` file in the `frontend/` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAF211VEk8d_wEFW5qfFYNCJhhPpEkjtbQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=weather-app-d1527.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=weather-app-d1527
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=weather-app-d1527.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=674980846342
NEXT_PUBLIC_FIREBASE_APP_ID=1:674980846342:web:ffbb028f47198ced7fdc87
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-TV3L04WHXG
```

## Step 3: GitHub Actions Setup

Add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add each Firebase configuration value:

### Required GitHub Secrets:

| Secret Name | Value |
|-------------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyAF211VEk8d_wEFW5qfFYNCJhhPpEkjtbQ` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `weather-app-d1527.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `weather-app-d1527` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `weather-app-d1527.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `674980846342` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:674980846342:web:ffbb028f47198ced7fdc87` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-TV3L04WHXG` |

## Step 4: Update GitHub Actions Workflow

Update your `.github/workflows/deploy.yml` to include Firebase environment variables:

```yaml
# Add this to your existing workflow
- name: Deploy to Render
  env:
    NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
    NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
    NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }}
  run: |
    # Your deployment commands here
```

## Step 5: Render.com Setup

Add the same environment variables to your Render.com service:

1. Go to your Render.com dashboard
2. Select your frontend service
3. Go to "Environment" tab
4. Add each Firebase environment variable

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different Firebase projects** for development and production
3. **Regularly rotate API keys** if needed
4. **Monitor Firebase usage** in the console
5. **Set up proper Firebase security rules**

## Verification

To verify the setup is working:

1. **Local Development:**
   ```bash
   cd frontend
   npm run dev
   # Check browser console for any Firebase errors
   ```

2. **Production:**
   - Deploy and check that authentication works
   - Verify environment variables are loaded correctly

## Troubleshooting

### Common Issues:

1. **"Firebase not initialized" error**
   - Check that all environment variables are set
   - Verify the values match your Firebase project

2. **"Invalid API key" error**
   - Ensure the API key is correct
   - Check that the project ID matches

3. **"Auth domain not allowed" error**
   - Verify the auth domain in Firebase console
   - Check that your domain is authorized

## Next Steps

After setting up the environment variables:

1. Test local development
2. Deploy to production
3. Verify authentication works in both environments
4. Monitor Firebase usage and costs 