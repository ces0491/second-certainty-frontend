// src/utils/formatDate.js
/**
 * Format a date string
 * @param {string} dateString - ISO date string
 * @param {string} [format='medium'] - Date format (short, medium, long)
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString, format = 'medium') => {
  const date = new Date(dateString);
  
  const options = { 
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric'
  };
  
  if (format === 'long') {
    options.weekday = 'long';
  }
  
  return date.toLocaleDateString('en-ZA', options);
};