import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          picture: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          provider: 'google'
        };
        setUser(userData);
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }

    return () => unsubscribe();
  }, [user]);

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await authService.signInWithGoogle();
      
      if (result.success) {
        setUser(result.user);
        toast.success(`Login successful! Welcome back, ${result.user.name}.`);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        toast.error(`Google Sign-In failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      toast.error(`Google Sign-In failed: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await authService.signOut();
      
      if (result.success) {
        setUser(null);
        toast.success('Logged out successfully.');
        return { success: true };
      } else {
        setError(result.error);
        toast.error(`Logout failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      toast.error(`Logout failed: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
