# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication with Google Provider for your Portfolio Generator application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "portfolio-generator")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project dashboard, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Google" provider
5. Toggle "Enable" to turn it on
6. Add your project support email
7. Click "Save"

## Step 3: Get Your Firebase Configuration

1. In your Firebase project dashboard, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon (</>) to add a web app
5. Enter your app nickname (e.g., "Portfolio Generator Web")
6. Check "Also set up Firebase Hosting" if you want to deploy later
7. Click "Register app"
8. Copy the Firebase configuration object

## Step 4: Configure Your App

1. Open `src/firebase/config.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to Authentication > Settings
2. Scroll down to "Authorized domains"
3. Add your development domain: `localhost`
4. Add your production domain when you deploy

## Step 6: Test Your Setup

1. Run your application: `npm run dev`
2. Click "Log In" or "Sign Up" in the navbar
3. Click "Continue with Google"
4. Select your Google account
5. You should be logged in successfully!

## Features Included

✅ **Google OAuth with Account Selection**: Users can choose from their Google accounts  
✅ **Session Persistence**: Users stay logged in across browser sessions  
✅ **Modern UI**: Clean, responsive design with smooth animations  
✅ **User Profile Display**: Shows user's name, email, and profile picture  
✅ **Secure Logout**: Properly clears authentication state  
✅ **Error Handling**: Graceful error handling for authentication failures  

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console

2. **"Firebase: Error (auth/api-key-not-valid)"**
   - Check that your API key is correct in the config

3. **"Firebase: Error (auth/operation-not-allowed)"**
   - Make sure Google provider is enabled in Firebase Console

4. **"Firebase: Error (auth/popup-closed-by-user)"**
   - User closed the popup before completing authentication

### Development vs Production:

- **Development**: Use `localhost` as authorized domain
- **Production**: Add your actual domain (e.g., `yourdomain.com`)

## Security Notes

- Never commit your Firebase config with real API keys to public repositories
- Use environment variables for production deployments
- Regularly rotate your API keys
- Monitor authentication usage in Firebase Console

## Next Steps

Once Firebase is configured, your authentication will work seamlessly with:
- Real Google account selection
- Secure user sessions
- Professional user experience
- No more "malformed request" errors

Your Portfolio Generator now has enterprise-grade authentication! 🚀


