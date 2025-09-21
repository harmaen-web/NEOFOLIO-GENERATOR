import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const GoogleAccountChooser = ({ onSuccess, onError, className = '' }) => {
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock Google accounts - simulating different user accounts
  const mockGoogleAccounts = [
    {
      uid: 'user-1',
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      picture: 'https://api.dicebear.com/7.x/initials/svg?seed=John%20Doe&backgroundColor=00897b,00acc1,039be5&backgroundType=gradientLinear&radius=50',
      emailVerified: true,
      provider: 'google'
    },
    {
      uid: 'user-2',
      name: 'Jane Smith',
      email: 'jane.smith@gmail.com',
      picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Jane%20Smith&backgroundColor=8e24aa,d81b60,e91e63&backgroundType=gradientLinear&radius=50',
      emailVerified: true,
      provider: 'google'
    },
    {
      uid: 'user-3',
      name: 'Mike Johnson',
      email: 'mike.johnson@gmail.com',
      picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Mike%20Johnson&backgroundColor=f4511e,fb8c00,ffb300&backgroundType=gradientLinear&radius=50',
      emailVerified: true,
      provider: 'google'
    },
    {
      uid: 'user-4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@gmail.com',
      picture: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Wilson&backgroundColor=6a1b9a,8e24aa,ab47bc&backgroundType=gradientLinear&radius=50',
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
      
      toast.success(`Welcome back, ${account.name}!`);
      setShowAccountChooser(false);
    } catch (error) {
      console.error('Account selection error:', error);
      if (onError) {
        onError(error.message);
      }
      toast.error(`Sign-in failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = () => {
    // Simulate adding a new account
    const newAccount = {
      uid: `user-${Date.now()}`,
      name: 'New User',
      email: 'newuser@gmail.com',
      picture: 'https://api.dicebear.com/7.x/initials/svg?seed=New%20User&backgroundColor=4caf50,66bb6a,81c784&backgroundType=gradientLinear&radius=50',
      emailVerified: true,
      provider: 'google'
    };
    
    handleAccountSelect(newAccount);
  };

  return (
    <div className={`google-account-chooser ${className}`}>
      {/* Main Google Sign-In Button */}
      <motion.button
        onClick={() => setShowAccountChooser(true)}
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
      </motion.button>
      
      <div className="mt-3 text-center">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          🔐 Choose your Google account
        </span>
      </div>

      {/* Account Selection Modal */}
      <AnimatePresence>
        {showAccountChooser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative"
            >
              <button
                onClick={() => setShowAccountChooser(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Choose a Google account
              </h3>

              <div className="space-y-3">
                {mockGoogleAccounts.map(account => (
                  <motion.button
                    key={account.uid}
                    onClick={() => handleAccountSelect(account)}
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    <img 
                      src={account.picture} 
                      alt={account.name} 
                      className="w-10 h-10 rounded-full" 
                    />
                    <div className="text-left flex-1">
                      <div className="font-medium text-gray-800">{account.name}</div>
                      <div className="text-sm text-gray-500">{account.email}</div>
                    </div>
                    {isLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Add Account Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <motion.button
                  onClick={handleAddAccount}
                  whileHover={{ backgroundColor: '#f0f9ff' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors duration-200"
                  disabled={isLoading}
                >
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">Add another account</span>
                </motion.button>
              </div>

              {isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                    <span className="text-lg text-gray-700">Signing in...</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoogleAccountChooser;
