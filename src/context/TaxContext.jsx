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
        changeTaxYear
      }}
    >
      {children}
    </TaxContext.Provider>
  );
};

// src/context/TaxContext.jsx - Add this function
const calculateCustomTax = async (customTaxData) => {
  setLoading(true);
  setError(null);
  
  try {
    // For now, we'll call the regular tax calculation endpoint 
    // with the user's data, since there's no custom calculator endpoint
    
    // In a real API, you might have a specific endpoint for this
    // For now, we'll use the regular calculation with the user's income
    const data = await calculateTax(currentUser.id, customTaxData.tax_year);
    
    // Adjust the result based on custom data
    // (this is just a simulation - in reality, you'd want a proper API endpoint)
    const adjustedData = {
      ...data,
      gross_income: customTaxData.gross_income,
      taxable_income: Math.max(0, customTaxData.gross_income - customTaxData.expenses),
    };
    
    // Recalculate tax (simplified calculation)
    const taxRate = adjustedData.taxable_income > 500000 ? 0.36 : 
                   adjustedData.taxable_income > 350000 ? 0.31 : 
                   adjustedData.taxable_income > 226000 ? 0.26 : 0.18;
    
    adjustedData.tax_before_rebates = adjustedData.taxable_income * taxRate;
    
    // Adjust rebates based on age
    let rebates = 17235; // Primary rebate
    if (customTaxData.age >= 65) rebates += 9444; // Secondary rebate
    if (customTaxData.age >= 75) rebates += 3145; // Tertiary rebate
    
    adjustedData.rebates = rebates;
    adjustedData.final_tax = Math.max(0, adjustedData.tax_before_rebates - rebates - adjustedData.medical_credits);
    adjustedData.effective_tax_rate = adjustedData.taxable_income > 0 ? 
                                    adjustedData.final_tax / adjustedData.taxable_income : 0;
    
    return adjustedData;
  } catch (err) {
    console.error('Error calculating custom tax:', err);
    setError(err.message || 'Failed to calculate tax');
    throw err;
  } finally {
    setLoading(false);
  }
};

// Add to the context value
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
      calculateCustomTax, // Add this
      changeTaxYear
    }}
  >
    {children}
  </TaxContext.Provider>
);

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
);