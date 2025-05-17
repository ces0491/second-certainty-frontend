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
      console.log(`Calculating tax for user ${currentUser.id}, tax year ${currentTaxYear}`);
      
      const data = await calculateTax(currentUser.id, currentTaxYear);
      
      console.log('Tax calculation result:', data);
      
      setTaxCalculation(data);
    } catch (err) {
      console.error('Error calculating tax:', err);
      setError(typeof err === 'string' ? err : err.message || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentTaxYear]);

  // Enhanced fetchProvisionalTax function
  const fetchProvisionalTax = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Calculating provisional tax for user ${currentUser.id}, tax year ${currentTaxYear}`);
      
      const data = await calculateProvisionalTax(currentUser.id, currentTaxYear);
      
      console.log('Provisional tax calculation result:', data);
      
      // Validate the data structure
      if (data) {
        setProvisionalTax(data);
      } else {
        console.warn('Received empty data from provisional tax calculation');
        setError('Could not calculate provisional tax. Please ensure you have income data for the current tax year.');
      }
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
      console.log(`Fetching tax brackets for tax year ${year}`);
      
      const data = await getTaxBrackets(year);
      
      console.log('Tax brackets result:', data);
      
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
    console.log('Changing tax year to:', taxYear);
    setCurrentTaxYear(taxYear);
  }, []);

  // Calculate custom tax
  const calculateCustomTaxCalculation = useCallback(async (calculationData) => {
    if (!currentUser) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Calculating custom tax for user ${currentUser.id} with data:`, calculationData);
      
      const data = await calculateCustomTax(currentUser.id, calculationData);
      
      console.log('Custom tax calculation result:', data);
      
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