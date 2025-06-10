import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * User login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - API response promise
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    
    // Store token and user data
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

/**
 * User registration
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
 * Get current user profile
 * @returns {Promise} - API response promise
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    
    // Update stored user data
    localStorage.setItem('user_data', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    // If getting current user fails, remove stored auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    throw error.response ? error.response.data : new Error('Failed to get user data');
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} - API response promise
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    
    // Update stored user data
    localStorage.setItem('user_data', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Profile update failed');
  }
};

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @returns {Promise} - API response promise
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Password change failed');
  }
};

/**
 * User logout
 * @returns {Promise} - API response promise
 */
export const logout = async () => {
  try {
    // Call the logout endpoint (optional since JWT tokens can't be invalidated server-side)
    await api.post('/auth/logout');
  } catch (error) {
    // Even if the API call fails, we should still clear local storage
    console.warn('Logout API call failed:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Get stored user data
 * @returns {Object|null} - User data or null if not found
 */
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    localStorage.removeItem('user_data');
    return null;
  }
};

export default api;