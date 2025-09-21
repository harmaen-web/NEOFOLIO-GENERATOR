// Google OAuth utility functions
class GoogleAuth {
  constructor() {
    this.clientId = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your actual Google Client ID
    this.isInitialized = false;
    this.user = null;
    this.callbacks = {
      onSignIn: null,
      onSignOut: null,
      onError: null
    };
  }

  // Initialize Google Identity Services
  async initialize() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined') {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      this.isInitialized = true;
      resolve();
    });
  }

  // Handle successful authentication
  handleCredentialResponse(response) {
    try {
      // Decode the JWT token
      const payload = this.decodeJwtPayload(response.credential);
      
      this.user = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name
      };

      // Store user data in localStorage
      localStorage.setItem('googleUser', JSON.stringify(this.user));
      
      // Call the sign-in callback
      if (this.callbacks.onSignIn) {
        this.callbacks.onSignIn(this.user);
      }
    } catch (error) {
      console.error('Error handling credential response:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    }
  }

  // Decode JWT payload (simple base64 decode)
  decodeJwtPayload(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token');
      }
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      throw error;
    }
  }

  // Render the sign-in button
  renderSignInButton(elementId, options = {}) {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    const defaultOptions = {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 250
    };

    google.accounts.id.renderButton(
      document.getElementById(elementId),
      { ...defaultOptions, ...options }
    );
  }

  // Render the sign-up button
  renderSignUpButton(elementId, options = {}) {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    const defaultOptions = {
      theme: 'filled_blue',
      size: 'large',
      text: 'signup_with',
      shape: 'rectangular',
      width: 250
    };

    google.accounts.id.renderButton(
      document.getElementById(elementId),
      { ...defaultOptions, ...options }
    );
  }

  // Sign out
  signOut() {
    if (typeof google !== 'undefined' && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    
    this.user = null;
    localStorage.removeItem('googleUser');
    
    if (this.callbacks.onSignOut) {
      this.callbacks.onSignOut();
    }
  }

  // Get current user
  getCurrentUser() {
    if (this.user) {
      return this.user;
    }

    // Try to get from localStorage
    const storedUser = localStorage.getItem('googleUser');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
        return this.user;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('googleUser');
      }
    }

    return null;
  }

  // Check if user is signed in
  isSignedIn() {
    return this.getCurrentUser() !== null;
  }

  // Set callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Prompt user to sign in
  prompt() {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    google.accounts.id.prompt();
  }
}

// Create singleton instance
const googleAuth = new GoogleAuth();

export default googleAuth;

