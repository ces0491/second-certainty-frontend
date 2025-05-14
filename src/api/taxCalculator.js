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
    throw error.response ? error.response.data : new Error('Failed to fetch deductible expense types');
  }
};

/**
 * Add income source for user
 * @param {number} userId - User ID
 * @param {Object} incomeData - Income data
 * @param {string} incomeData.source_type - Income source type (e.g. "Salary", "Rental", "Investment")
 * @param {string} [incomeData.description] - Income description
 * @param {number} incomeData.annual_amount - Annual income amount
 * @param {boolean} [incomeData.is_paye=true] - Whether PAYE is deducted from this income
 * @param {string} [incomeData.tax_year] - Tax year in format "YYYY-YYYY"
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
 * Delete an income source
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

/**
 * Add expense for user
 * @param {number} userId - User ID
 * @param {Object} expenseData - Expense data
 * @param {number} expenseData.expense_type_id - Expense type ID
 * @param {string} [expenseData.description] - Expense description
 * @param {number} expenseData.amount - Expense amount
 * @param {string} [expenseData.tax_year] - Tax year in format "YYYY-YYYY"
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
 * Delete an expense
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
 * Update tax data from SARS website (admin only)
 * @returns {Promise} - API response promise
 */
export const updateTaxData = async () => {
  try {
    const response = await api.post('/tax/update-tax-data/');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update tax data');
  }
};

/**
 * Calculate tax based on custom parameters
 * @param {number} userId - User ID
 * @param {Object} calculationData - Custom calculation parameters
 * @param {number} calculationData.income - Gross annual income
 * @param {number} calculationData.age - Age as of end of tax year
 * @param {Object} calculationData.expenses - Deductible expenses
 * @param {string} [calculationData.tax_year] - Tax year in format "YYYY-YYYY"
 * @returns {Promise} - API response promise with tax calculation
 */
export const calculateCustomTax = async (userId, calculationData) => {
  try {
    const params = calculationData.tax_year ? { tax_year: calculationData.tax_year } : {};
    const response = await api.post(`/tax/users/${userId}/custom-tax-calculation/`, calculationData, { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to calculate tax');
  }
};