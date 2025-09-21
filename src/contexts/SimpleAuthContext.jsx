import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SimpleAuthContext = createContext();

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('User loaded from localStorage:', userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Sign in with Google
  const signInWithGoogle = async (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User signed in:', userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      console.log('User signed out');
      toast.success('Logged out successfully.');
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};


