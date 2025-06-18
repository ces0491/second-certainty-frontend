// src/hooks/useExpenses.js
import { useContext } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';

export const useExpenses = () => {
  return useContext(ExpenseContext);
};
