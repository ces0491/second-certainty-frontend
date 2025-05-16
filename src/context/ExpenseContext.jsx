// src/context/ExpenseContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense, getExpenseTypes } from '../api/expenses';
import { AuthContext } from './AuthContext';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTaxYear, setCurrentTaxYear] = useState('2025-2026');
  const { currentUser } = useContext(AuthContext);

  // Use useCallback for fetchExpenses to prevent infinite loops
  const fetchExpenses = useCallback(async () => {
    if (!currentUser) return;
    if (loading) return; // Still check loading, but don't depend on it
    
    setLoading(true);
    try {
      const data = await getExpenses(currentUser.id, currentTaxYear);
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message || 'Failed to fetch expense data');
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear]);

  // Use useCallback for fetchExpenseTypes too
  const fetchExpenseTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const types = await getExpenseTypes();
      setExpenseTypes(types);
    } catch (err) {
      console.error('Error fetching expense types:', err);
      setError(err.message || 'Failed to fetch expense types');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies since it doesn't depend on any state or props

  // Effect to fetch expense types on mount
  useEffect(() => {
    fetchExpenseTypes();
  }, [fetchExpenseTypes]);

  // Effect to fetch expenses when user or tax year changes
  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
    }
  }, [currentUser, currentTaxYear, fetchExpenses]); // Now includes fetchExpenses as a dependency

  // Other methods can be converted to useCallback too for consistency
  const addExpenseItem = useCallback(async (expenseData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newExpense = await addExpense(currentUser.id, {
        ...expenseData,
        tax_year: currentTaxYear
      });
      setExpenses([...expenses, newExpense]);
      return { success: true, data: newExpense };
    } catch (err) {
      setError(err.message || 'Failed to add expense');
      return { success: false, error: err.message || 'Failed to add expense' };
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear, expenses]);

  const updateExpenseItem = useCallback(async (expenseId, expenseData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedExpense = await updateExpense(currentUser.id, expenseId, expenseData);
      setExpenses(expenses.map(expense => expense.id === expenseId ? updatedExpense : expense));
      return { success: true, data: updatedExpense };
    } catch (err) {
      setError(err.message || 'Failed to update expense');
      return { success: false, error: err.message || 'Failed to update expense' };
    } finally {
      setLoading(false);
    }
  }, [currentUser, expenses]);

  const deleteExpenseItem = useCallback(async (expenseId) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteExpense(currentUser.id, expenseId);
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
      return { success: false, error: err.message || 'Failed to delete expense' };
    } finally {
      setLoading(false);
    }
  }, [currentUser, expenses]);

  const changeTaxYear = useCallback((taxYear) => {
    setCurrentTaxYear(taxYear);
  }, []);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        expenseTypes,
        loading,
        error,
        currentTaxYear,
        fetchExpenses,
        fetchExpenseTypes,
        addExpense: addExpenseItem,
        updateExpense: updateExpenseItem,
        deleteExpense: deleteExpenseItem,
        changeTaxYear
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};