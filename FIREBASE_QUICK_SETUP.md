# 🚀 Quick Firebase Setup for Google Sign-In

## Step 1: Create Firebase Project (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `portfolio-generator`
4. Enable Google Analytics (optional)
5. Click **"Create project"**

## Step 2: Enable Google Authentication (1 minute)

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click **"Google"** provider
3. Toggle **"Enable"** ON
4. Add your support email
5. Click **"Save"**

## Step 3: Get Your Config (1 minute)

1. Firebase Console → **Project Settings** (gear icon)
2. Scroll to **"Your apps"** → Click **Web icon** `</>`
3. App nickname: `Portfolio Generator`
4. Click **"Register app"**
5. **Copy the config object**

## Step 4: Update Your App (30 seconds)

Replace the config in `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Step 5: Add Authorized Domain (30 seconds)

1. Firebase Console → **Authentication** → **Settings**
2. Scroll to **"Authorized domains"**
3. Click **"Add domain"**
4. Add: `localhost`

## Step 6: Test It! 🎉

1. Run: `npm run dev`
2. Click **"Log In"** or **"Sign Up"**
3. Click **"Continue with Google"**
4. Select your Google account
5. See success toast! ✅

---

## 🔧 Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Add `localhost` to authorized domains

### "Firebase: Error (auth/api-key-not-valid)" 
- Check your API key is correct

### "Firebase: Error (auth/operation-not-allowed)"
- Enable Google provider in Firebase Console

### "Nothing happens when clicking Continue with Google"
- Check browser console for errors
- Verify Firebase config is correct
- Make sure popup blockers are disabled

---

## ✨ What You Get

- ✅ **Real Google OAuth** with account selection
- ✅ **Beautiful toasts** for success/error feedback  
- ✅ **Session persistence** across browser refreshes
- ✅ **User profile** in navbar with avatar
- ✅ **Secure logout** with confirmation
- ✅ **Modern UI** with smooth animations

**Total setup time: ~5 minutes** 🚀


