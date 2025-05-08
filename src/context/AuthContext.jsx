import React, { createContext, useState, useEffect } from 'react';
import { login, register, getCurrentUser, logout, isAuthenticated } from '../api/auth';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setCurrentUser(userData);
        } catch (err) {
          console.error('Error fetching user data:', err);
          // Handle invalid token
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Handle user login
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      const userData = await getCurrentUser();
      setCurrentUser(userData);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Handle user registration
  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      await register(userData);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  // Define the context value
  const contextValue = {
    currentUser,
    loading,
    error,
    isAuthenticated: !!currentUser,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};