// src/context/ExpenseContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense, getExpenseTypes } from '../api/expenses';
import { AuthContext } from './AuthContext';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTaxYear, setCurrentTaxYear] = useState('2024-2025');
  const { currentUser } = useContext(AuthContext);

  const fetchExpenses = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getExpenses(currentUser.id, currentTaxYear);
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message || 'Failed to fetch expense data');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseTypes = async () => {
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
  };

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
    }
  }, [currentUser, currentTaxYear]);

  const addExpenseItem = async (expenseData) => {
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
  };

  const updateExpenseItem = async (expenseId, expenseData) => {
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
  };

  const deleteExpenseItem = async (expenseId) => {
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
  };

  const changeTaxYear = (taxYear) => {
    setCurrentTaxYear(taxYear);
  };

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