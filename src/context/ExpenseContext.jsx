// src/context/ExpenseContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getExpenses, addExpense, deleteExpense, getExpenseTypes } from '../api/expenses';
import { AuthContext } from './AuthContext';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTaxYear, setCurrentTaxYear] = useState('2025-2026');
  const { currentUser } = useContext(AuthContext);

  // Fetch expense types
  const fetchExpenseTypes = useCallback(async () => {
    try {
      const types = await getExpenseTypes();
      if (Array.isArray(types)) {
        setExpenseTypes(types);
      }
    } catch (err) {
      console.error('Error fetching expense types:', err);
    }
  }, []);

  // Fetch expenses for current user and tax year
  const fetchExpenses = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getExpenses(currentUser.id, currentTaxYear);
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message || 'Failed to fetch expense data');
      setExpenses([]); // Set empty array on error to prevent rendering issues
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear]);

  // Load expense types on mount
  useEffect(() => {
    fetchExpenseTypes();
  }, [fetchExpenseTypes]);

  // Fetch expenses when user or tax year changes
  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
    }
  }, [currentUser, currentTaxYear, fetchExpenses]);

  // Add new expense
  const addExpenseItem = useCallback(
    async (expenseData) => {
      if (!currentUser) return { success: false, error: 'Authentication required' };

      setLoading(true);
      setError(null);

      try {
        const newExpense = await addExpense(currentUser.id, {
          ...expenseData,
          tax_year: currentTaxYear,
        });

        setExpenses((prev) => [...prev, newExpense]);
        return { success: true, data: newExpense };
      } catch (err) {
        console.error('Error adding expense:', err);
        setError(err.message || 'Failed to add expense');
        return { success: false, error: err.message || 'Failed to add expense' };
      } finally {
        setLoading(false);
      }
    },
    [currentUser, currentTaxYear]
  );

  // Delete expense
  const deleteExpenseItem = useCallback(
    async (expenseId) => {
      if (!currentUser) return { success: false, error: 'Authentication required' };

      setLoading(true);
      setError(null);

      try {
        await deleteExpense(currentUser.id, expenseId);
        setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
        return { success: true };
      } catch (err) {
        console.error('Error deleting expense:', err);
        setError(err.message || 'Failed to delete expense');
        return { success: false, error: err.message || 'Failed to delete expense' };
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  // Change tax year
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
        deleteExpense: deleteExpenseItem,
        changeTaxYear,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
