import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const GoogleOAuthDirect = ({ onSuccess, onError, className = '' }) => {
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Google OAuth configuration
  const GOOGLE_CLIENT_ID = "407408718192.apps.googleusercontent.com"; // This is a demo client ID

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

  const handleCredentialResponse = (response) => {
    console.log('Google OAuth response received:', response);
    setIsLoading(true);

    try {
      const payload = decodeJwtPayload(response.credential);
      console.log('Decoded JWT payload:', payload);

      const user = {
        uid: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        emailVerified: payload.email_verified,
        provider: 'google'
      };

      console.log('Extracted user data:', user);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      
      if (onSuccess) {
        onSuccess(user);
      }
      
      toast.success(`Login successful! Welcome back, ${user.name}.`);
    } catch (error) {
      console.error('Error handling credential response:', error);
      const errorMessage = 'Failed to process authentication';
      if (onError) {
        onError(errorMessage);
      }
      toast.error(`Google Sign-In failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        try {
          console.log('Initializing Google OAuth...');
          
          if (buttonRef.current) {
            buttonRef.current.innerHTML = '';
          }

          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (buttonRef.current) {
            google.accounts.id.renderButton(buttonRef.current, {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: 250
            });
            setIsInitialized(true);
            console.log('Google OAuth button rendered successfully');
          }
        } catch (err) {
          console.error('Error initializing Google Auth:', err);
          if (onError) {
            onError('Failed to initialize Google authentication');
          }
        }
      } else {
        console.log('Google Identity Services not loaded yet, retrying...');
        setTimeout(initializeGoogleAuth, 100);
      }
    };

    // Load Google Identity Services script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }

    return () => {
      // Cleanup
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
      }
    };
  }, [onError]);

  return (
    <div className={`google-oauth-direct ${className}`}>
      {!isInitialized ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading Google Sign-In...</span>
        </div>
      ) : (
        <div className="relative">
          <div ref={buttonRef} className="google-signin-button" />
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

export default GoogleOAuthDirect;


