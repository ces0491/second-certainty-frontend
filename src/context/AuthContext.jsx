import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, register, getCurrentUser, logout, isAuthenticated, updateProfile, changePassword, getStoredUser } from '../api/auth';

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

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Check if user is authenticated
        if (isAuthenticated()) {
          // Try to get fresh user data from API
          try {
            const userData = await getCurrentUser();
            setCurrentUser(userData);
          } catch (apiError) {
            // If API call fails, try to use stored user data
            const storedUser = getStoredUser();
            if (storedUser) {
              setCurrentUser(storedUser);
            } else {
              // No valid user data, clear auth
              logout();
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle user login
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(email, password);
      setCurrentUser(response.user);
      return { success: true, data: response };
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
      const response = await register(userData);
      return { success: true, data: response };
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

  // Handle profile update
  const handleUpdateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateProfile(profileData);
      setCurrentUser(updatedUser);
      return { success: true, data: updatedUser };
    } catch (err) {
      setError(err.message || 'Profile update failed');
      return { success: false, error: err.message || 'Profile update failed' };
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await changePassword(passwordData);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message || 'Password change failed');
      return { success: false, error: err.message || 'Password change failed' };
    } finally {
      setLoading(false);
    }
  };

  // Refresh current user data
  const refreshUser = async () => {
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
        handleLogout();
      }
      throw err;
    }
  };

  // Clear errors
  const clearError = () => {
    setError(null);
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
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};