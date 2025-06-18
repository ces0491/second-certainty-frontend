// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login,
  register,
  getCurrentUser,
  logout,
  isAuthenticated,
  updateProfile,
  changePassword,
  getStoredUser,
} from '../api/auth';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state on component mount
  useEffect(() => {
    if (initialized) return; // Prevent multiple initializations

    const initializeAuth = async () => {
      setLoading(true);

      try {
        // Check if user is authenticated
        if (isAuthenticated()) {
          // Try to use stored user data first for faster loading
          const storedUser = getStoredUser();
          if (storedUser) {
            setCurrentUser(storedUser);
            setLoading(false); // Set loading to false immediately with stored data
            
            // Then try to refresh user data in background
            try {
              const freshUserData = await getCurrentUser();
              setCurrentUser(freshUserData);
            } catch (refreshError) {
              console.warn('Failed to refresh user data, using stored data:', refreshError);
              // Keep using stored user data if refresh fails
            }
          } else {
            // No stored data, fetch fresh data
            try {
              const userData = await getCurrentUser();
              setCurrentUser(userData);
            } catch (apiError) {
              // No valid user data, clear auth
              await logout();
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [initialized]);

  // Handle user login
  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(email, password);
      setCurrentUser(response.user);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle user registration
  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await register(userData);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle user logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      setCurrentUser(null);
      setError(null);
    }
  }, []);

  // Handle profile update
  const handleUpdateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateProfile(profileData);
      setCurrentUser(updatedUser);
      return { success: true, data: updatedUser };
    } catch (err) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle password change
  const handleChangePassword = useCallback(async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await changePassword(passwordData);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh current user data
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      // If refresh fails and we have stored user, keep using it
      const storedUser = getStoredUser();
      if (!storedUser) {
        await handleLogout();
      }
      throw err;
    }
  }, [handleLogout]);

  // Clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    currentUser,
    loading,
    error,
    isAuthenticated: !!currentUser,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    refreshUser,
    clearError,
  }), [
    currentUser,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateProfile,
    handleChangePassword,
    refreshUser,
    clearError,
  ]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export { AuthContext };