// src/api/index.js
import axios from 'axios';

// Update with the real API URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://second-certainty-api.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Create standardized error object 
    const errorResponse = {
      message: error.response?.data?.detail || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    };
    
    // Log errors in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', errorResponse);
    }
    
    return Promise.reject(errorResponse);
  }
);

export default api;