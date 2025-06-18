// src/utils/validators.js
/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {boolean} - Validation result
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Required field validation
 * @param {string} value - Field value
 * @returns {boolean} - Validation result
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

/**
 * Minimum length validation
 * @param {string} value - Field value
 * @param {number} minLength - Minimum length
 * @returns {boolean} - Validation result
 */
export const minLength = (value, minLength) => {
  return value && value.length >= minLength;
};

/**
 * Number validation
 * @param {string|number} value - Field value
 * @returns {boolean} - Validation result
 */
export const isNumber = (value) => {
  return !isNaN(Number(value));
};

/**
 * Positive number validation
 * @param {string|number} value - Field value
 * @returns {boolean} - Validation result
 */
export const isPositiveNumber = (value) => {
  return isNumber(value) && Number(value) >= 0;
};

/**
 * Date validation (must be in the past)
 * @param {string} dateString - Date string
 * @returns {boolean} - Validation result
 */
export const isPastDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date < today;
};

/**
 * Password match validation
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} - Validation result
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};
