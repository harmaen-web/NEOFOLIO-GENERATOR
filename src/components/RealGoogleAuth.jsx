import React, { useEffect, useRef, useState, useCallback } from 'react';

const RealGoogleAuth = ({ onSuccess, onError, className = '' }) => {
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Real Google Client ID - you need to replace this with your actual client ID
  // Get it from: https://console.developers.google.com/
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

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

          // Initialize Google Identity Services with account selection
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false, // This allows users to choose their account
            cancel_on_tap_outside: true,
            context: 'signin', // This shows the account chooser
            ux_mode: 'popup' // This opens a popup for account selection
          });

          // Render the button with account selection enabled
          if (buttonRef.current) {
            const buttonOptions = {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: 250,
              logo_alignment: 'left'
            };

            google.accounts.id.renderButton(buttonRef.current, buttonOptions);
            
            // Also render the account chooser
            google.accounts.id.prompt((notification) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Account chooser was not displayed or was skipped
                console.log('Account chooser not displayed or skipped');
              }
            });
            
            setIsInitialized(true);
            setError(null);
          }
        } catch (error) {
          console.error('Error initializing Google Auth:', error);
          setError('Failed to initialize Google authentication. Please check your client ID configuration.');
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
  }, [handleCredentialResponse, onError]);

  return (
    <div className={`real-google-auth ${className}`}>
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm font-medium mb-2">Google Authentication Error</p>
          <p className="text-red-600 text-sm">{error}</p>
          <div className="mt-3 text-xs text-red-500">
            <p className="font-medium">To fix this:</p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Go to <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Create a project and enable Google+ API</li>
              <li>Create OAuth 2.0 credentials (Web application)</li>
              <li>Add <code className="bg-red-100 px-1 rounded">http://localhost:5175</code> as authorized origin</li>
              <li>Replace <code className="bg-red-100 px-1 rounded">YOUR_GOOGLE_CLIENT_ID</code> in the code</li>
            </ol>
          </div>
          <button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="mt-3 text-xs text-red-500 hover:text-red-700 underline"
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
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Signing in...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealGoogleAuth;

