// src/api/auth.js
import api from './index';

export const login = async (email, password) => {
  try {
    console.log('Login attempt for:', email);
    
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

    console.log('Login response:', response.data);

    // Store token in localStorage
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      console.log('Token stored in localStorage');
    } else {
      console.error('No access token in response');
      throw new Error('No access token received');
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // Better error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
      throw error;
    }
  }
};