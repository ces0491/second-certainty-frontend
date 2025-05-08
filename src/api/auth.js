import api from './index';

/**
 * User registration 
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.name - User's first name
 * @param {string} userData.surname - User's last name
 * @param {string} userData.date_of_birth - User's date of birth (YYYY-MM-DD)
 * @param {boolean} [userData.is_provisional_taxpayer] - Whether user is a provisional taxpayer
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
 * User login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - API response promise with access token
 */
export const login = async (email, password) => {
  try {
    // Convert to form data format as required by FastAPI's OAuth2PasswordRequestForm
    const formData = new FormData();
    formData.append('username', email); // FastAPI expects 'username' not 'email'
    formData.append('password', password);

    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Store token in localStorage
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

/**
 * Get current user profile
 * @returns {Promise} - API response promise with user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch user profile');
  }
};

/**
 * Logout user by removing token
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