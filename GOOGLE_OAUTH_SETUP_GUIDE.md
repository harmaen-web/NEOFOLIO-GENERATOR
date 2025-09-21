# Google OAuth Setup Guide

## Why You're Seeing Random Accounts

The current implementation uses **mock accounts** because it doesn't have your real Google OAuth credentials configured. To use your actual Google account, you need to set up Google OAuth.

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Portfolio Generator"
4. Click "Create"

### 2. Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized origins:
   - `http://localhost:5179` (for development)
   - `https://yourdomain.com` (for production)
5. Click "Create"
6. **Copy your Client ID** (you'll need this)

### 4. Configure the Application

Replace `YOUR_GOOGLE_CLIENT_ID` in `src/components/RealGoogleOAuth.jsx` with your actual Client ID:

```javascript
client_id: 'your-actual-client-id-here.apps.googleusercontent.com',
```

### 5. Test the Integration

1. Save the file
2. Refresh your application
3. Click "Continue with Google"
4. You'll see the real Google account selection popup
5. Choose your actual Google account

## Alternative: Quick Demo Setup

If you want to test immediately without setting up OAuth, I can create a demo version that simulates the real Google experience but uses your preferred account details.

## What This Fixes

- ✅ **Real Google Account Selection** - Choose from your actual Google accounts
- ✅ **No More Random Accounts** - Only your real accounts appear
- ✅ **Proper OAuth Flow** - Standard Google sign-in experience
- ✅ **Account Switching** - Switch between your real Google accounts

## Need Help?

If you need help with the setup or want me to create a demo version, just let me know!
