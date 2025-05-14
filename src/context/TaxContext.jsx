// src/context/TaxContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { calculateTax, calculateCustomTax, calculateProvisionalTax, getTaxBrackets } from '../api/taxCalculator';
import { AuthContext } from './AuthContext';

export const TaxContext = createContext();

export const TaxProvider = ({ children }) => {
  const [taxCalculation, setTaxCalculation] = useState(null);
  const [provisionalTax, setProvisionalTax] = useState(null);
  const [taxBrackets, setTaxBrackets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTaxYear, setCurrentTaxYear] = useState('2024-2025');
  const { currentUser } = useContext(AuthContext);

  const fetchTaxCalculation = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await calculateTax(currentUser.id, currentTaxYear);
      setTaxCalculation(data);
    } catch (err) {
      console.error('Error calculating tax:', err);
      setError(err.message || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  const fetchProvisionalTax = async () => {
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
  };

  const fetchTaxBrackets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getTaxBrackets(currentTaxYear);
      setTaxBrackets(data);
    } catch (err) {
      console.error('Error fetching tax brackets:', err);
      setError(err.message || 'Failed to fetch tax brackets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxBrackets();
  }, [currentTaxYear]);

  useEffect(() => {
    if (currentUser) {
      fetchTaxCalculation();
      if (currentUser.is_provisional_taxpayer) {
        fetchProvisionalTax();
      }
    }
  }, [currentUser, currentTaxYear]);

  const changeTaxYear = (taxYear) => {
    setCurrentTaxYear(taxYear);
  };

const calculateCustomTaxCalculation = async (calculationData) => {
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
};

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
)};