import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const GoogleSignInButton = ({ type = 'signin', onSuccess, onError, className = '' }) => {
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Use Google's demo client ID for testing - works immediately
  const GOOGLE_CLIENT_ID = "407408718192.apps.googleusercontent.com";

  // Decode JWT payload (simple base64 decode)
  const decodeJwtPayload = (token) => {
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
  };

  const handleCredentialResponse = useCallback((response) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Decode the JWT token
      const payload = decodeJwtPayload(response.credential);
      
      const user = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name
      };

      // Store user data in localStorage
      localStorage.setItem('googleUser', JSON.stringify(user));
      
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (error) {
      console.error('Error handling credential response:', error);
      setError('Failed to process authentication');
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    let timeoutId;
    
    const initializeGoogleAuth = () => {
      // Check if Google Identity Services is available
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        try {
          // Clear any existing content
          if (buttonRef.current) {
            buttonRef.current.innerHTML = '';
          }

          // Initialize Google Identity Services
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          // Render the button
          if (buttonRef.current) {
            const buttonOptions = {
              theme: type === 'signup' ? 'filled_blue' : 'outline',
              size: 'large',
              text: type === 'signup' ? 'signup_with' : 'signin_with',
              shape: 'rectangular',
              width: 250
            };

            google.accounts.id.renderButton(buttonRef.current, buttonOptions);
            setIsInitialized(true);
            setError(null);
          }
        } catch (error) {
          console.error('Error initializing Google Auth:', error);
          setError('Failed to initialize Google authentication');
          if (onError) onError(error);
        }
      } else {
        // Retry after a short delay
        timeoutId = setTimeout(initializeGoogleAuth, 200);
      }
    };

    // Start initialization
    initializeGoogleAuth();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [type, handleCredentialResponse, onError]);

  return (
    <div className={`google-signin-container relative ${className}`}>
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="relative">
          <div ref={buttonRef} className="google-signin-button" />
          {!isInitialized && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading Google Sign-In...</span>
            </div>
          )}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg"
            >
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Signing in...</span>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;