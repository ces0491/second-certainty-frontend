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

  // Improved fetchExpenses function with better error handling
  const fetchExpenses = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching expenses for user:', currentUser.id, 'tax year:', currentTaxYear);
      const data = await getExpenses(currentUser.id, currentTaxYear);
      
      // Check if data is an array before setting it
      if (Array.isArray(data)) {
        console.log('Expenses fetched successfully:', data.length, 'items');
        setExpenses(data);
      } else {
        console.error('Unexpected data format for expenses:', data);
        setExpenses([]);
        setError('Received invalid expense data from the server');
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message || 'Failed to fetch expense data');
      setExpenses([]); // Set empty array on error to prevent rendering issues
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear]);

  // Improved fetchExpenseTypes function with better error handling
  const fetchExpenseTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching expense types');
      const types = await getExpenseTypes();
      
      // Check if types is an array before setting it
      if (Array.isArray(types)) {
        console.log('Expense types fetched successfully:', types.length, 'items');
        setExpenseTypes(types);
      } else {
        console.error('Unexpected data format for expense types:', types);
        setExpenseTypes([]);
        setError('Received invalid expense type data from the server');
      }
    } catch (err) {
      console.error('Error fetching expense types:', err);
      setError(err.message || 'Failed to fetch expense types');
      setExpenseTypes([]); // Set empty array on error to prevent rendering issues
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch expense types on mount
  useEffect(() => {
    fetchExpenseTypes();
  }, [fetchExpenseTypes]);

  // Effect to fetch expenses when user or tax year changes
  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
    }
  }, [currentUser, currentTaxYear, fetchExpenses]);

  useEffect(() => {
    if (expenseTypes.length === 0) {
        fetchExpenseTypes();
    }
  }, [expenseTypes.length, fetchExpenseTypes]);

  // Improved addExpenseItem function with better error handling
  const addExpenseItem = useCallback(async (expenseData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure expense_type_id is an integer
      const parsedExpenseData = {
        ...expenseData,
        expense_type_id: parseInt(expenseData.expense_type_id),
        amount: Number(expenseData.amount),
        tax_year: currentTaxYear
      };
      
      console.log('Adding expense with data:', parsedExpenseData);
      
      // Call the API function
      const newExpense = await addExpense(currentUser.id, parsedExpenseData);
      
      console.log('Expense added successfully:', newExpense);
      
      // Validate the response
      if (newExpense && typeof newExpense === 'object') {
        // Update state with new expense
        setExpenses(prevExpenses => [...prevExpenses, newExpense]);
        
        // Fetch updated expenses to ensure consistency
        fetchExpenses();
        
        return { success: true, data: newExpense };
      } else {
        throw new Error('Received invalid response from server');
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err.message || 'Failed to add expense');
      return { success: false, error: err.message || 'Failed to add expense' };
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear, fetchExpenses]);

  // Improved updateExpenseItem function
  const updateExpenseItem = useCallback(async (expenseId, expenseData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure expense_type_id is an integer if it exists
      const parsedExpenseData = {
        ...expenseData,
        expense_type_id: expenseData.expense_type_id ? parseInt(expenseData.expense_type_id) : undefined,
        amount: Number(expenseData.amount)
      };
      
      console.log('Updating expense with ID:', expenseId, 'and data:', parsedExpenseData);
      
      const updatedExpense = await updateExpense(currentUser.id, expenseId, parsedExpenseData);
      
      console.log('Expense updated successfully:', updatedExpense);
      
      // Update state with updated expense
      setExpenses(prevExpenses => 
        prevExpenses.map(expense => 
          expense.id === expenseId ? updatedExpense : expense
        )
      );
      
      return { success: true, data: updatedExpense };
    } catch (err) {
      console.error('Error updating expense:', err);
      setError(err.message || 'Failed to update expense');
      return { success: false, error: err.message || 'Failed to update expense' };
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Improved deleteExpenseItem function
  const deleteExpenseItem = useCallback(async (expenseId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Deleting expense with ID:', expenseId);
      
      await deleteExpense(currentUser.id, expenseId);
      
      console.log('Expense deleted successfully');
      
      // Update state by removing deleted expense
      setExpenses(prevExpenses => 
        prevExpenses.filter(expense => expense.id !== expenseId)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError(err.message || 'Failed to delete expense');
      return { success: false, error: err.message || 'Failed to delete expense' };
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Improved changeTaxYear function
  const changeTaxYear = useCallback((taxYear) => {
    console.log('Changing tax year to:', taxYear);
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