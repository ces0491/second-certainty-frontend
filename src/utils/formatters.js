// src/utils/formatters.js
/**
 * Format a number as ZAR currency
 * @param {number} value - Value to format
 * @param {number} [fractionDigits=0] - Number of fraction digits
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (value, fractionDigits = 0) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

/**
 * Format a date string
 * @param {string} dateString - ISO date string
 * @param {string} [format='medium'] - Date format (short, medium, long)
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString, format = 'medium') => {
  if (!dateString) return '';

  const date = new Date(dateString);

  const options = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  };

  if (format === 'long') {
    options.weekday = 'long';
  }

  return date.toLocaleDateString('en-ZA', options);
};

/**
 * Format percentage value
 * @param {number} value - Value to format (decimal, e.g. 0.25 for 25%)
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`;
};
