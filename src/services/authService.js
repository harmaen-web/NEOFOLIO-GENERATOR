import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

class AuthService {
  constructor() {
    this.auth = auth;
    this.googleProvider = googleProvider;
  }

  // Google Sign In with account selection
  async signInWithGoogle() {
    try {
      console.log('AuthService: Starting Google Sign-In...');
      console.log('AuthService: Auth object:', this.auth);
      console.log('AuthService: Provider object:', this.googleProvider);
      
      const result = await signInWithPopup(this.auth, this.googleProvider);
      console.log('AuthService: Sign-in result:', result);
      
      const user = result.user;
      console.log('AuthService: User object:', user);
      
      // Extract user information
      const userData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        picture: user.photoURL,
        emailVerified: user.emailVerified,
        provider: 'google'
      };

      console.log('AuthService: Extracted user data:', userData);

      return {
        success: true,
        user: userData,
        message: 'Successfully signed in with Google'
      };
    } catch (error) {
      console.error('AuthService: Google sign-in error:', error);
      console.error('AuthService: Error code:', error.code);
      console.error('AuthService: Error message:', error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to sign in with Google'
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      await firebaseSignOut(this.auth);
      return {
        success: true,
        message: 'Successfully signed out'
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to sign out'
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.auth.currentUser;
  }

  // Get user token
  async getUserToken() {
    try {
      const user = this.auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
