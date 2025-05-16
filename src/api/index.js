// src/api/index.js
import axios from 'axios';

// Use the correct API URL - check this matches your backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:10000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long-hanging requests
  timeout: 15000,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Don't add auth header to token endpoint - can cause CORS issues
    if (config.url.includes('/auth/token')) {
      console.log('Skipping auth header for token endpoint');
      return config;
    }
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log('Adding token to request:', config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token available for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized response, clearing token');
      localStorage.removeItem('auth_token');
      
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;