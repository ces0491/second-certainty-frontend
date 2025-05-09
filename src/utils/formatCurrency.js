// src/utils/formatCurrency.js
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
    maximumFractionDigits: fractionDigits 
  }).format(value);
};