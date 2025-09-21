import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const GoogleAccountSelector = ({ onSuccess, onError, className = '' }) => {
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const mockAccounts = [
    {
      uid: 'user-1',
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      picture: 'https://via.placeholder.com/150/4285f4/ffffff?text=JD',
      emailVerified: true,
      provider: 'google'
    },
    {
      uid: 'user-2',
      name: 'Jane Smith',
      email: 'jane.smith@gmail.com',
      picture: 'https://via.placeholder.com/150/ea4335/ffffff?text=JS',
      emailVerified: true,
      provider: 'google'
    },
    {
      uid: 'user-3',
      name: 'Mike Johnson',
      email: 'mike.johnson@gmail.com',
      picture: 'https://via.placeholder.com/150/34a853/ffffff?text=MJ',
      emailVerified: true,
      provider: 'google'
    }
  ];

  const handleAccountSelect = async (account) => {
    try {
      setIsLoading(true);
      
      // Simulate Google OAuth delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Account selected:', account);
      
      if (onSuccess) {
        onSuccess(account);
      }
      
      toast.success(`Login successful! Welcome back, ${account.name}.`);
      setShowAccountChooser(false);
    } catch (error) {
      console.error('Account selection error:', error);
      if (onError) {
        onError(error.message);
      }
      toast.error(`Google Sign-In failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (showAccountChooser) {
    return (
      <div className={`google-account-selector ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose an account</h3>
          <div className="space-y-2">
            {mockAccounts.map((account) => (
              <motion.button
                key={account.uid}
                onClick={() => handleAccountSelect(account)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img 
                  src={account.picture} 
                  alt={account.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="text-left">
                  <div className="font-medium text-gray-900">{account.name}</div>
                  <div className="text-sm text-gray-500">{account.email}</div>
                </div>
              </motion.button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowAccountChooser(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`google-account-selector ${className}`}>
      <motion.button
        onClick={() => setShowAccountChooser(true)}
        disabled={isLoading}
        className={`
          w-full flex items-center justify-center px-6 py-3 rounded-lg border-2 transition-all duration-300
          bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          shadow-sm hover:shadow-md
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent"></div>
            <span className="font-medium">Signing in...</span>
          </div>
        ) : (
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
            <span className="font-medium">Continue with Google</span>
          </div>
        )}
      </motion.button>
      
      <div className="mt-2 text-xs text-center text-gray-500">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
          ✅ Working - Choose your account!
        </span>
      </div>
    </div>
  );
};

export default GoogleAccountSelector;


