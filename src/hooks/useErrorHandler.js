// src/hooks/useErrorHandler.js
import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  
  const handleError = useCallback((error) => {
    const errorMessage = 
      error.message || 
      error.data?.detail || 
      'An unexpected error occurred';
      
    setError(errorMessage);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);
  
  const clearError = useCallback(() => setError(null), []);
  
  return { error, handleError, clearError };
};