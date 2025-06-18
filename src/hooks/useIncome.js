// src/hooks/useIncome.js
import { useContext } from 'react';
import { IncomeContext } from '../context/IncomeContext';

export const useIncome = () => {
  return useContext(IncomeContext);
};
