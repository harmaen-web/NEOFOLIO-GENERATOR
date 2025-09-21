import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Demo Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyDemo-Key-Replace-With-Your-Actual-Key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project-id",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider for account selection
googleProvider.setCustomParameters({
  prompt: 'select_account' // This forces account selection
});

export default app;


