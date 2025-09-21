import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import EmailLogin from './EmailLogin';

const AuthModal = ({ isOpen, onClose, onSuccess, onError }) => {
  const { signInWithGoogle } = useSimpleAuth();

  const handleSuccess = async (user) => {
    try {
      await signInWithGoogle(user);
      onClose();
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (error) {
      console.error('Error signing in user:', error);
      if (onError) {
        onError(error.message);
      }
    }
  };

  const handleError = (error) => {
    if (onError) {
      onError(error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative flex flex-col justify-center min-h-[500px]">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Vision Weavers
                </h2>
                <p className="text-gray-600">
                  Sign in with your email to create your professional portfolio
                </p>
              </div>

              {/* Email Login - Centered */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="w-full">
                  <EmailLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
