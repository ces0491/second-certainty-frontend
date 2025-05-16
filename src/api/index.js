// src/api/index.js - Improve the error handling
import axios from 'axios';

// Use the correct API URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://second-certainty-api.onrender.com/api';

// Create axios instance with retry logic
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long-hanging requests
  timeout: 15000,
});

// Add retry logic for Render's free tier which often needs "wake up" time
api.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;
    
    // Only retry GET requests that failed with 5xx errors (server errors)
    if (config && response && response.status >= 500 && config.method === 'get' && !config._retry) {
      config._retry = true;
      console.log('Server error, retrying request after 2 seconds...');
      
      // Wait 2 seconds before retrying (Render free tier often needs warm-up time)
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(config);
    }
    
    // Add specific error handling for database errors
    if (response && response.data && response.data.detail && response.data.detail.includes('database')) {
      console.error('Database connection error. The server might be starting up.');
      
      // You could add UI notification here for database errors
      error.isConnectionError = true;
    }
    
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log(`Adding token to request: ${token.substring(0, 15)}...`);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;