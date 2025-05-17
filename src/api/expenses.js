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
    
    // Add a log to see what's being requested
    console.log(`Fetching expenses for user ${userId}, tax year ${taxYear}`);
    
    const response = await api.get(`/tax/users/${userId}/expenses/`, { params });
    
    // Add a log to see the response data
    console.log('Expense data received:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
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
    // Ensure expense_type_id is sent as a number
    const dataToSend = {
      ...expenseData,
      expense_type_id: parseInt(expenseData.expense_type_id)
    };
    
    console.log(`Adding expense for user ${userId}:`, dataToSend);
    
    const response = await api.post(`/tax/users/${userId}/expenses/`, dataToSend);
    
    console.log('Added expense response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error adding expense:', error);
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
    // Ensure expense_type_id is an integer if it exists
    const dataToSend = { ...expenseData };
    if (dataToSend.expense_type_id) {
      dataToSend.expense_type_id = parseInt(dataToSend.expense_type_id);
    }
    
    console.log(`Updating expense ${expenseId} for user ${userId}:`, dataToSend);
    
    const response = await api.put(`/tax/users/${userId}/expenses/${expenseId}`, dataToSend);
    
    console.log('Updated expense response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating expense:', error);
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
    console.log(`Deleting expense ${expenseId} for user ${userId}`);
    
    const response = await api.delete(`/tax/users/${userId}/expenses/${expenseId}`);
    
    console.log('Delete expense response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error.response ? error.response.data : new Error('Failed to delete expense');
  }
};

/**
 * Get all deductible expense types
 * @returns {Promise} - API response promise
 */
export const getExpenseTypes = async () => {
  try {
    console.log('Fetching expense types');
    
    const response = await api.get('/tax/deductible-expenses/');
    
    console.log('Expense types received:', response.data);
    
    // Add a check to ensure the response contains valid data
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid expense type data received:', response.data);
      throw new Error('Invalid expense type data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Expense types fetch error:', error);
    // Return empty array as fallback instead of throwing
    return [];
  }
};