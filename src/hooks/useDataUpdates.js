// src/hooks/useDataUpdates.js
import { useContext, useState, useEffect } from 'react';
import { TaxContext } from '../context/TaxContext';

export const useDataUpdates = () => {
  const { fetchTaxCalculation, fetchProvisionalTax } = useContext(TaxContext);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState(null);
  
  // Add backoff delay for retries
  const getBackoffDelay = (retry) => {
    return Math.min(1000 * Math.pow(2, retry), 30000); // exponential backoff, max 30 seconds
  };
  
  const refreshDashboard = async (error = null) => {
    // Don't allow concurrent refreshes
    if (isRefreshing) return;
    
    // Track the error if provided
    if (error) {
      setLastError(error);
      // If it's a connection error, increment retry count
      if (error.isConnectionError) {
        setRetryCount(prev => prev + 1);
      }
    }
    
    setIsRefreshing(true);
    
    try {
      // If there was a database connection error, wait with exponential backoff
      if (lastError?.isConnectionError) {
        const delay = getBackoffDelay(retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Refresh tax data after changes to income or expenses
      await fetchTaxCalculation();
      await fetchProvisionalTax();
      
      // Reset error state after successful refresh
      setLastError(null);
      if (retryCount > 0) {
        setRetryCount(0); // Reset retry count on success
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
      // If we get another connection error, we'll increment the retry count next time
      setLastError(err);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Auto-retry based on the retry count
  useEffect(() => {
    if (retryCount > 0 && retryCount < 5 && lastError?.isConnectionError) {
      const timer = setTimeout(() => {
        refreshDashboard();
      }, getBackoffDelay(retryCount));
      
      return () => clearTimeout(timer);
    }
  }, [retryCount, lastError]);
  
  return { 
    refreshDashboard,
    isRefreshing,
    retryCount,
    lastError
  };
};