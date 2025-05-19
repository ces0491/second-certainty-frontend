// src/context/IncomeContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getIncomes, addIncome, updateIncome, deleteIncome } from '../api/income';
import { AuthContext } from './AuthContext';

export const IncomeContext = createContext();

export const IncomeProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTaxYear, setCurrentTaxYear] = useState('2025-2026');
  const { currentUser } = useContext(AuthContext);

  // Use useCallback for fetchIncomes to prevent infinite loops
  const fetchIncomes = useCallback(async () => {
    if (!currentUser) return;
    if (loading) return; // Still check loading, but don't depend on it
    
    setLoading(true);
    try {
      console.log('Fetching incomes for user:', currentUser.id, 'tax year:', currentTaxYear);
      const data = await getIncomes(currentUser.id, currentTaxYear);
      
      // Check if data is an array before setting it
      if (Array.isArray(data)) {
        console.log('Incomes fetched successfully:', data.length, 'items');
        setIncomes(data);
      } else {
        console.error('Unexpected data format for incomes:', data);
        setIncomes([]);
        setError('Received invalid income data from the server');
      }
    } catch (err) {
      console.error('Error fetching incomes:', err);
      setError(err.message || 'Failed to fetch income data');
      setIncomes([]); // Set empty array on error to prevent rendering issues
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear]);

  // Effect to fetch incomes when user or tax year changes
  // Fixed ESLint warning by adding fetchIncomes dependency
  useEffect(() => {
    if (currentUser) {
      fetchIncomes();
    }
  }, [currentUser, currentTaxYear, fetchIncomes]); 

  // Other methods can be converted to useCallback too for consistency
  const addIncomeItem = useCallback(async (incomeData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Adding income with data:', {
        ...incomeData,
        tax_year: currentTaxYear
      });
      
      const newIncome = await addIncome(currentUser.id, {
        ...incomeData,
        tax_year: currentTaxYear
      });
      
      console.log('Income added successfully:', newIncome);
      
      setIncomes([...incomes, newIncome]);
      return { success: true, data: newIncome };
    } catch (err) {
      console.error('Error adding income:', err);
      setError(err.message || 'Failed to add income');
      return { success: false, error: err.message || 'Failed to add income' };
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear, incomes]);

  const updateIncomeItem = useCallback(async (incomeId, incomeData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Updating income with ID:', incomeId, 'and data:', incomeData);
      
      const updatedIncome = await updateIncome(currentUser.id, incomeId, incomeData);
      
      console.log('Income updated successfully:', updatedIncome);
      
      setIncomes(incomes.map(income => income.id === incomeId ? updatedIncome : income));
      return { success: true, data: updatedIncome };
    } catch (err) {
      console.error('Error updating income:', err);
      setError(err.message || 'Failed to update income');
      return { success: false, error: err.message || 'Failed to update income' };
    } finally {
      setLoading(false);
    }
  }, [currentUser, incomes]);

  const deleteIncomeItem = useCallback(async (incomeId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Deleting income with ID:', incomeId);
      
      await deleteIncome(currentUser.id, incomeId);
      
      console.log('Income deleted successfully');
      
      setIncomes(incomes.filter(income => income.id !== incomeId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting income:', err);
      setError(err.message || 'Failed to delete income');
      return { success: false, error: err.message || 'Failed to delete income' };
    } finally {
      setLoading(false);
    }
  }, [currentUser, incomes]);

  const changeTaxYear = useCallback((taxYear) => {
    console.log('Changing tax year to:', taxYear);
    setCurrentTaxYear(taxYear);
  }, []);

  return (
    <IncomeContext.Provider
      value={{
        incomes,
        loading,
        error,
        currentTaxYear,
        fetchIncomes,
        addIncome: addIncomeItem,
        updateIncome: updateIncomeItem,
        deleteIncome: deleteIncomeItem,
        changeTaxYear
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
};