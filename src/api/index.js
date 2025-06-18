// src/api/index.js
import axios from 'axios';

// API URL
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://second-certainty-api.onrender.com/api';

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout for slow server responses
});

// Connection state tracking
let isServerWarm = false;
let warmupPromise = null;

// Request interceptor for adding auth token and handling warmup
api.interceptors.request.use(
  async (config) => {
    // Don't add auth header to token endpoint
    if (config.url.includes('/auth/token')) {
      return config;
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle server warmup for first request
    if (!isServerWarm && !warmupPromise) {
      console.log('First API request - server may need warmup time');
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration and server status
api.interceptors.response.use(
  (response) => {
    // Mark server as warm after first successful response
    if (!isServerWarm) {
      isServerWarm = true;
      console.log('Server is now warm - subsequent requests should be faster');
    }
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');

      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle server errors with more specific messaging
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be sleeping');
      error.isTimeout = true;
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('Network error - server may be unavailable');
      error.isNetworkError = true;
    }

    return Promise.reject(error);
  }
);

// Optimized server ping function
export const pingServer = async () => {
  // If server is already warm, return immediately
  if (isServerWarm) {
    return true;
  }

  // If warmup is in progress, wait for it
  if (warmupPromise) {
    return warmupPromise;
  }

  // Start warmup process
  warmupPromise = (async () => {
    try {
      console.log('Pinging server to warm up...');
      const startTime = Date.now();
      
      await api.get('/health', { 
        timeout: 10000, // Shorter timeout for ping
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      const duration = Date.now() - startTime;
      console.log(`Server responded in ${duration}ms`);
      
      isServerWarm = true;
      return true;
    } catch (error) {
      console.warn('Server ping failed:', error.message);
      // Don't mark as warm if ping fails, but don't throw error
      return false;
    } finally {
      warmupPromise = null;
    }
  })();

  return warmupPromise;
};

// Helper function to check if server needs warmup
export const needsWarmup = () => {
  return !isServerWarm;
};

// Helper function to reset server status (useful for testing)
export const resetServerStatus = () => {
  isServerWarm = false;
  warmupPromise = null;
};

// Optimized API call wrapper with retry logic
export const apiCall = async (requestFn, options = {}) => {
  const { retries = 1, retryDelay = 1000 } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      // Only retry on timeout or network errors
      const shouldRetry = (error.isTimeout || error.isNetworkError) && attempt < retries;
      
      if (shouldRetry) {
        console.log(`API call failed (attempt ${attempt + 1}), retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      throw error;
    }
  }
};

export default api;