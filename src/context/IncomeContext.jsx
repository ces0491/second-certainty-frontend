// src/context/IncomeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getIncomes, addIncome, updateIncome, deleteIncome } from '../api/income';
import { AuthContext } from './AuthContext';

export const IncomeContext = createContext();

export const IncomeProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTaxYear, setCurrentTaxYear] = useState('2024-2025');
  const { currentUser } = useContext(AuthContext);

  const fetchIncomes = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getIncomes(currentUser.id, currentTaxYear);
      setIncomes(data);
    } catch (err) {
      console.error('Error fetching incomes:', err);
      setError(err.message || 'Failed to fetch income data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchIncomes();
    }
  }, [currentUser, currentTaxYear]);

  const addIncomeItem = async (incomeData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newIncome = await addIncome(currentUser.id, {
        ...incomeData,
        tax_year: currentTaxYear
      });
      setIncomes([...incomes, newIncome]);
      return { success: true, data: newIncome };
    } catch (err) {
      setError(err.message || 'Failed to add income');
      return { success: false, error: err.message || 'Failed to add income' };
    } finally {
      setLoading(false);
    }
  };

  const updateIncomeItem = async (incomeId, incomeData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedIncome = await updateIncome(currentUser.id, incomeId, incomeData);
      setIncomes(incomes.map(income => income.id === incomeId ? updatedIncome : income));
      return { success: true, data: updatedIncome };
    } catch (err) {
      setError(err.message || 'Failed to update income');
      return { success: false, error: err.message || 'Failed to update income' };
    } finally {
      setLoading(false);
    }
  };

  const deleteIncomeItem = async (incomeId) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteIncome(currentUser.id, incomeId);
      setIncomes(incomes.filter(income => income.id !== incomeId));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete income');
      return { success: false, error: err.message || 'Failed to delete income' };
    } finally {
      setLoading(false);
    }
  };

  const changeTaxYear = (taxYear) => {
    setCurrentTaxYear(taxYear);
  };

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