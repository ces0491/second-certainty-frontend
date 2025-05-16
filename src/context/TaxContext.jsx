// src/context/TaxContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { calculateTax, calculateCustomTax, calculateProvisionalTax, getTaxBrackets } from '../api/taxCalculator';
import { AuthContext } from './AuthContext';

export const TaxContext = createContext();

export const TaxProvider = ({ children }) => {
  const [taxCalculation, setTaxCalculation] = useState(null);
  const [provisionalTax, setProvisionalTax] = useState(null);
  const [taxBrackets, setTaxBrackets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTaxYear, setCurrentTaxYear] = useState('2025-2026');
  const { currentUser } = useContext(AuthContext);

  // Fetch tax calculation
  const fetchTaxCalculation = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await calculateTax(currentUser.id, currentTaxYear);
      setTaxCalculation(data);
    } catch (err) {
      console.error('Error calculating tax:', err);
      setError(typeof err === 'string' ? err : err.message || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear]);

  // Fetch provisional tax
  const fetchProvisionalTax = useCallback(async () => {
    if (!currentUser || !currentUser.is_provisional_taxpayer) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await calculateProvisionalTax(currentUser.id, currentTaxYear);
      setProvisionalTax(data);
    } catch (err) {
      console.error('Error calculating provisional tax:', err);
      setError(typeof err === 'string' ? err : err.message || 'Failed to calculate provisional tax');
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear]);

  // Fetch tax brackets
  const fetchTaxBrackets = useCallback(async (year = currentTaxYear) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getTaxBrackets(year);
      setTaxBrackets(data);
    } catch (err) {
      console.error('Error fetching tax brackets:', err);
      setError(typeof err === 'string' ? err : err.message || 'Failed to fetch tax brackets');
    } finally {
      setLoading(false);
    }
  }, [currentTaxYear]);

  // Effect to fetch tax brackets on mount or when tax year changes
  useEffect(() => {
    fetchTaxBrackets();
  }, [currentTaxYear, fetchTaxBrackets]);

  // Effect to fetch tax calculation and provisional tax when user or tax year changes
  useEffect(() => {
    if (currentUser) {
      fetchTaxCalculation();
      if (currentUser.is_provisional_taxpayer) {
        fetchProvisionalTax();
      }
    }
  }, [currentUser, currentTaxYear, fetchTaxCalculation, fetchProvisionalTax]);

  // Change tax year
  const changeTaxYear = useCallback((taxYear) => {
    setCurrentTaxYear(taxYear);
  }, []);

  // Calculate custom tax
  const calculateCustomTaxCalculation = useCallback(async (calculationData) => {
    if (!currentUser) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await calculateCustomTax(currentUser.id, calculationData);
      return data;
    } catch (err) {
      console.error('Error calculating custom tax:', err);
      setError(typeof err === 'string' ? err : err.message || 'Failed to calculate custom tax');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Context value
  const contextValue = {
    taxCalculation,
    provisionalTax,
    taxBrackets,
    loading,
    error,
    currentTaxYear,
    fetchTaxCalculation,
    fetchProvisionalTax,
    fetchTaxBrackets,
    calculateCustomTax: calculateCustomTaxCalculation,
    changeTaxYear
  };

  return (
    <TaxContext.Provider value={contextValue}>
      {children}
    </TaxContext.Provider>
  );
};