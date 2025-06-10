// src/api/auth.js
import axios from 'axios';

// Use the same API base URL as index.js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://second-certainty-api.onrender.com/api',
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * User login - FIXED to use correct endpoint and format
 */
export const login = async (email, password) => {
  try {
    // Create FormData for OAuth2PasswordRequestForm (backend expects this format)
    const formData = new FormData();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);

    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const { access_token } = response.data;
    
    // Store token
    localStorage.setItem('auth_token', access_token);
    
    // Get user data after successful login
    const userResponse = await api.get('/auth/me');
    localStorage.setItem('user_data', JSON.stringify(userResponse.data));
    
    return { user: userResponse.data, access_token };
  } catch (error) {
    console.error('Login error:', error);
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

/**
 * User registration - FIXED format
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

// Rest of the functions remain the same...
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    localStorage.setItem('user_data', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    throw error.response ? error.response.data : new Error('Failed to get user data');
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    localStorage.setItem('user_data', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Profile update failed');
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Password change failed');
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.warn('Logout API call failed:', error);
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

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