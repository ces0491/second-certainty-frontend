// src/api/income.js
import api from './index';

/**
 * Get all income sources for user
 * @param {number} userId - User ID
 * @param {string} [taxYear] - Tax year in format "YYYY-YYYY"
 * @returns {Promise} - API response promise
 */
export const getIncomes = async (userId, taxYear) => {
  try {
    const params = taxYear ? { tax_year: taxYear } : {};
    const response = await api.get(`/tax/users/${userId}/income/`, { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch income sources');
  }
};

/**
 * Add income source for user
 * @param {number} userId - User ID
 * @param {Object} incomeData - Income data
 * @returns {Promise} - API response promise
 */
export const addIncome = async (userId, incomeData) => {
  try {
    const response = await api.post(`/tax/users/${userId}/income/`, incomeData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to add income source');
  }
};

/**
 * Update income source
 * @param {number} userId - User ID
 * @param {number} incomeId - Income ID
 * @param {Object} incomeData - Income data
 * @returns {Promise} - API response promise
 */
export const updateIncome = async (userId, incomeId, incomeData) => {
  try {
    const response = await api.put(`/tax/users/${userId}/income/${incomeId}`, incomeData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update income source');
  }
};

/**
 * Delete income source
 * @param {number} userId - User ID
 * @param {number} incomeId - Income ID
 * @returns {Promise} - API response promise
 */
export const deleteIncome = async (userId, incomeId) => {
  try {
    const response = await api.delete(`/tax/users/${userId}/income/${incomeId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete income source');
  }
};
