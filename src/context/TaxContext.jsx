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

  // Use useCallback for tax calculation functions
  const fetchTaxCalculation = useCallback(async () => {
    if (!currentUser) return;
    if (loading) return; // Still check loading, but don't depend on it
    
    setLoading(true);
    try {
      const data = await calculateTax(currentUser.id, currentTaxYear);
      setTaxCalculation(data);
    } catch (err) {
      console.error('Error calculating tax:', err);
      setError(err.message || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear]);

  const fetchProvisionalTax = useCallback(async () => {
    if (!currentUser || !currentUser.is_provisional_taxpayer) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await calculateProvisionalTax(currentUser.id, currentTaxYear);
      setProvisionalTax(data);
    } catch (err) {
      console.error('Error calculating provisional tax:', err);
      setError(err.message || 'Failed to calculate provisional tax');
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear]);

  const fetchTaxBrackets = useCallback(async (year = currentTaxYear) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getTaxBrackets(year);
      setTaxBrackets(data);
    } catch (err) {
      console.error('Error fetching tax brackets:', err);
      setError(err.message || 'Failed to fetch tax brackets');
    } finally {
      setLoading(false);
    }
  }, [currentTaxYear]); // Depending on currentTaxYear by default

  // Effect to fetch tax brackets on mount or when tax year changes
  useEffect(() => {
    fetchTaxBrackets();
  }, [currentTaxYear, fetchTaxBrackets]); // Now includes fetchTaxBrackets

  // Effect to fetch tax calculation and provisional tax when user or tax year changes
  useEffect(() => {
    if (currentUser) {
      fetchTaxCalculation();
      if (currentUser.is_provisional_taxpayer) {
        fetchProvisionalTax();
      }
    }
  }, [currentUser, currentTaxYear, fetchTaxCalculation, fetchProvisionalTax]); // Now includes all dependencies

  const changeTaxYear = useCallback((taxYear) => {
    setCurrentTaxYear(taxYear);
  }, []);

  const calculateCustomTaxCalculation = useCallback(async (calculationData) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await calculateCustomTax(currentUser.id, calculationData);
      return data;
    } catch (err) {
      console.error('Error calculating custom tax:', err);
      setError(typeof err === 'object' && err.message 
        ? err.message 
        : 'Failed to calculate custom tax');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Include in the context value
  return (
    <TaxContext.Provider
      value={{
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
      }}
    >
      {children}
    </TaxContext.Provider>
  );
};