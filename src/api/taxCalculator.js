// src/api/taxCalculator.js
import api from './index';

/**
 * Get tax brackets for a specific tax year
 * @param {string} [taxYear] - Tax year in format "YYYY-YYYY". If not provided, current tax year is used.
 * @returns {Promise} - API response promise
 */
export const getTaxBrackets = async (taxYear) => {
  try {
    const params = taxYear ? { tax_year: taxYear } : {};
    const response = await api.get('/tax/tax-brackets/', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch tax brackets');
  }
};

/**
 * Get all deductible expense types
 * @returns {Promise} - API response promise
 */
export const getDeductibleExpenseTypes = async () => {
  try {
    const response = await api.get('/tax/deductible-expenses/');
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error('Failed to fetch deductible expense types');
  }
};

/**
 * Calculate tax liability for user
 * @param {number} userId - User ID
 * @param {string} [taxYear] - Tax year in format "YYYY-YYYY"
 * @returns {Promise} - API response promise with tax calculation
 */
export const calculateTax = async (userId, taxYear) => {
  try {
    const params = taxYear ? { tax_year: taxYear } : {};
    const response = await api.get(`/tax/users/${userId}/tax-calculation/`, { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to calculate tax');
  }
};

/**
 * Calculate provisional tax for user
 * @param {number} userId - User ID
 * @param {string} [taxYear] - Tax year in format "YYYY-YYYY"
 * @returns {Promise} - API response promise with provisional tax calculation
 */
export const calculateProvisionalTax = async (userId, taxYear) => {
  try {
    const params = taxYear ? { tax_year: taxYear } : {};
    const response = await api.get(`/tax/users/${userId}/provisional-tax/`, { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to calculate provisional tax');
  }
};

/**
 * Calculate tax based on custom parameters
 * @param {number} userId - User ID
 * @param {Object} calculationData - Custom calculation parameters
 * @returns {Promise} - API response promise with tax calculation
 */
export const calculateCustomTax = async (userId, calculationData) => {
  try {
    const params = calculationData.tax_year ? { tax_year: calculationData.tax_year } : {};
    const response = await api.post(
      `/tax/users/${userId}/custom-tax-calculation/`,
      calculationData,
      { params }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to calculate tax');
  }
};
