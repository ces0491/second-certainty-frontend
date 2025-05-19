// src/api/expenses.js
import api from './index';

/**
 * Get all expenses for user
 * @param {number} userId - User ID
 * @param {string} [taxYear] - Tax year in format "YYYY-YYYY"
 * @returns {Promise} - API response promise
 */
export const getExpenses = async (userId, taxYear) => {
  try {
    const params = taxYear ? { tax_year: taxYear } : {};
    const response = await api.get(`/tax/users/${userId}/expenses/`, { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch expenses');
  }
};

/**
 * Add expense for user
 * @param {number} userId - User ID
 * @param {Object} expenseData - Expense data
 * @returns {Promise} - API response promise
 */
export const addExpense = async (userId, expenseData) => {
  try {
    const response = await api.post(`/tax/users/${userId}/expenses/`, expenseData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to add expense');
  }
};

/**
 * Update expense
 * @param {number} userId - User ID
 * @param {number} expenseId - Expense ID
 * @param {Object} expenseData - Expense data
 * @returns {Promise} - API response promise
 */
export const updateExpense = async (userId, expenseId, expenseData) => {
  try {
    const response = await api.put(`/tax/users/${userId}/expenses/${expenseId}`, expenseData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update expense');
  }
};

/**
 * Delete expense
 * @param {number} userId - User ID
 * @param {number} expenseId - Expense ID
 * @returns {Promise} - API response promise
 */
export const deleteExpense = async (userId, expenseId) => {
  try {
    const response = await api.delete(`/tax/users/${userId}/expenses/${expenseId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete expense');
  }
};

/**
 * Get all deductible expense types
 * @returns {Promise} - API response promise
 */
export const getExpenseTypes = async () => {
  try {
    const response = await api.get('/tax/deductible-expenses/');
    return response.data;
  } catch (error) {
    // Return empty array as fallback instead of throwing
    console.error('Failed to fetch expense types:', error);
    return [];
  }
};