// src/api/auth.js
import api from './index';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - API response promise with token
 */
export const login = async (email, password) => {
  try {
    // Create FormData for FastAPI's OAuth2PasswordRequestForm
    const formData = new FormData();
    formData.append('username', email); // FastAPI expects 'username' not 'email'
    formData.append('password', password);

    // Clear any existing tokens
    localStorage.removeItem('auth_token');
    
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Store token in localStorage
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    } else {
      throw new Error('No access token received');
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw new Error('No response from server - please wait up to 50s and try again');
    } else {
      throw error;
    }
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - API response promise
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

/**
 * Get current user data
 * @returns {Promise} - API response promise with user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to get user data');
  }
};

/**
 * Logout user by removing auth token
 */
export const logout = () => {
  localStorage.removeItem('auth_token');
};

/**
 * Check if user is authenticated
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};