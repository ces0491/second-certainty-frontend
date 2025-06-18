// src/hooks/useTaxCalc.js
import { useContext } from 'react';
import { TaxContext } from '../context/TaxContext';

export const useTaxCalc = () => {
  return useContext(TaxContext);
};
