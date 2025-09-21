import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const RealGoogleOAuth = ({ onSuccess, onError, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleSignIn();
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        toast.error('Failed to load Google Sign-In. Please refresh the page.');
      };
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (!window.google) {
        console.error('Google Identity Services not loaded');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: 'YOUR_GOOGLE_CLIENT_ID', // You need to replace this with your actual Google Client ID
          callback: handleCredentialResponse,
          auto_select: false, // This ensures users can choose their account
          cancel_on_tap_outside: true,
        });

        // Render the sign-in button
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
            }
          );
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        toast.error('Failed to initialize Google Sign-In');
      }
    };

    loadGoogleScript();

    return () => {
      // Cleanup
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      setIsLoading(true);
      
      // Decode the JWT token to get user information
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const userData = {
        uid: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        emailVerified: payload.email_verified,
        provider: 'google',
        credential: response.credential
      };

      console.log('Google Sign-In successful:', userData);
      
      if (onSuccess) {
        onSuccess(userData);
      }
      
      toast.success(`Welcome, ${userData.name}!`);
    } catch (error) {
      console.error('Error processing Google Sign-In:', error);
      if (onError) {
        onError(error.message);
      }
      toast.error('Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSignIn = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      toast.error('Google Sign-In not available. Please refresh the page.');
    }
  };

  return (
    <div className={`real-google-oauth ${className}`}>
      {!isInitialized ? (
        <motion.button
          disabled={true}
          className="
            w-full flex items-center justify-center px-6 py-4 rounded-lg border-2 transition-all duration-300
            bg-gray-100 border-gray-300 text-gray-500
            disabled:opacity-50 disabled:cursor-not-allowed
            text-lg font-medium
          "
        >
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent"></div>
            <span>Loading Google Sign-In...</span>
          </div>
        </motion.button>
      ) : (
        <div className="space-y-4">
          {/* Google Sign-In Button */}
          <div ref={googleButtonRef} className="w-full"></div>
          
          {/* Manual Sign-In Option */}
          <motion.button
            onClick={handleManualSignIn}
            disabled={isLoading}
            className="
              w-full flex items-center justify-center px-6 py-3 rounded-lg border-2 transition-all duration-300
              bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              text-base font-medium
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path 
                  fill="#4285f4" 
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path 
                  fill="#34a853" 
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path 
                  fill="#fbbc05" 
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path 
                  fill="#ea4335" 
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Choose Your Google Account</span>
            </div>
          </motion.button>
        </div>
      )}
      
      <div className="mt-3 text-center">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          🔐 Sign in with your real Google account
        </span>
      </div>
    </div>
  );
};

export default RealGoogleOAuth;
