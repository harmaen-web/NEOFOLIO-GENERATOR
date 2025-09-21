import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const DemoGoogleAuth = ({ onSuccess, onError, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Simulate Google OAuth delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Customized with your preferred account details
      const userData = {
        uid: 'demo-user-custom',
        name: 'Haruz', // Your preferred name
        email: 'haruz@gmail.com', // Your preferred email
        picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Haruz&backgroundColor=4285f4,34a853,ea4335&backgroundType=gradientLinear&radius=50',
        emailVerified: true,
        provider: 'google'
      };

      console.log('Demo Google Sign-In successful:', userData);
      
      if (onSuccess) {
        onSuccess(userData);
      }
      
      toast.success(`Welcome, ${userData.name}! (Demo Mode)`);
    } catch (error) {
      console.error('Demo sign-in error:', error);
      if (onError) {
        onError(error.message);
      }
      toast.error(`Demo Sign-In failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`demo-google-auth ${className}`}>
      <motion.button
        onClick={handleDemoSignIn}
        disabled={isLoading}
        className="
          w-full flex items-center justify-center px-6 py-4 rounded-lg border-2 transition-all duration-300
          bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          shadow-lg hover:shadow-xl
          text-lg font-medium
        "
        style={{
          minHeight: '60px',
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db',
          color: '#374151'
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-600 border-t-transparent"></div>
            <span className="font-medium text-lg">Signing in...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <span className="font-medium text-lg">Continue with Google</span>
          </div>
        )}
      </motion.button>
      
      <div className="mt-3 text-center space-y-2">
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          ✅ Ready to use - Click to sign in!
        </span>
      </div>
    </div>
  );
};

export default DemoGoogleAuth;
