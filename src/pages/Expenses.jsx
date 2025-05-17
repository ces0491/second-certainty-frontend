// src/pages/Expenses.jsx
import React, { useState, useEffect } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import { formatCurrency } from '../utils/formatters';

const Expenses = () => {
  const { 
    expenses, 
    expenseTypes, 
    loading, 
    error, 
    currentTaxYear, 
    changeTaxYear, 
    addExpense: addExpenseItem, 
    deleteExpense: deleteExpenseItem,
    fetchExpenses,
    fetchExpenseTypes
  } = useExpenses();
  
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [formError, setFormError] = useState('');
  const [newExpense, setNewExpense] = useState({
    expense_type_id: '',
    description: '',
    amount: '',
  });
  
  // Available tax years
  const TAX_YEARS = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];
  
  // Force refresh data on component mount - Fixed ESLint warning by adding expenseTypes to deps
  useEffect(() => {
    console.log('Expenses component mounted');
    console.log('Current tax year:', currentTaxYear);
    console.log('Available expense types:', expenseTypes);
    
    // Refresh expense types if empty
    if (expenseTypes.length === 0) {
      fetchExpenseTypes();
    }
    
    // Refresh expenses data
    fetchExpenses();
  }, [currentTaxYear, fetchExpenses, fetchExpenseTypes, expenseTypes, expenseTypes.length]);
  
  // Debug expense type selection
  useEffect(() => {
    if (newExpense.expense_type_id) {
      console.log('Selected expense type ID:', newExpense.expense_type_id);
      const selectedType = expenseTypes.find(
        type => type.id === parseInt(newExpense.expense_type_id)
      );
      console.log('Selected expense type:', selectedType);
    }
  }, [newExpense.expense_type_id, expenseTypes]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const updatedValue = type === 'number' ? (value === '' ? '' : value) : value;
    
    setNewExpense(prev => {
      const updated = {
        ...prev,
        [name]: updatedValue
      };
      console.log('Updated expense form state:', updated);
      return updated;
    });
  };
  
  // Handle form submission
  const handleAddExpense = async () => {
    // Validate form
    if (!newExpense.expense_type_id || !newExpense.amount) {
      setFormError('Please fill in all required fields.');
      return;
    }
    
    try {
      // Create a new object with explicit properties
      const expenseData = {
        expense_type_id: parseInt(newExpense.expense_type_id),
        description: newExpense.description || '',
        amount: Number(newExpense.amount),
        tax_year: currentTaxYear
      };
      
      console.log('Submitting expense data:', expenseData);
      
      const result = await addExpenseItem(expenseData);
      
      if (result.success) {
        console.log('Expense added successfully:', result.data);
        
        // Reset form
        setNewExpense({
          expense_type_id: '',
          description: '',
          amount: '',
        });
        
        // Close form
        setIsAddingExpense(false);
        setFormError('');
        
        // Refresh expenses
        fetchExpenses();
      } else {
        console.error('Error adding expense:', result.error);
        setFormError(result.error || 'Failed to add expense.');
      }
    } catch (err) {
      console.error('Exception when adding expense:', err);
      setFormError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };
  
  // Handle expense deletion
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      console.log('Deleting expense with ID:', id);
      const result = await deleteExpenseItem(id);
      
      if (result.success) {
        console.log('Expense deleted successfully');
      } else {
        console.error('Error deleting expense:', result.error);
        setFormError(result.error || 'Failed to delete expense.');
      }
    } catch (err) {
      console.error('Exception when deleting expense:', err);
      setFormError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };
  
  // Calculate total expenses with error handling
  const totalExpenses = expenses && Array.isArray(expenses) 
    ? expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    : 0;
  
  // Handle tax year change
  const handleTaxYearChange = (e) => {
    const newYear = e.target.value;
    console.log('Changing tax year from:', currentTaxYear, 'to:', newYear);
    changeTaxYear(newYear);
  };
  
  const getExpenseTypeName = (expense) => {
    if (expense.expense_type && expense.expense_type.name) {
        return expense.expense_type.name;
    }
    
    // Try to find expense type from the context
    const matchingType = expenseTypes.find(
        type => type.id === expense.expense_type_id
    );
    
    if (matchingType) {
        return matchingType.name;
    }
    
    return expense.expense_type_id 
        ? `Type ID: ${expense.expense_type_id}` 
        : 'Unknown';
    }

  // Debug expenses
  useEffect(() => {
    console.log('Current expenses:', expenses);
  }, [expenses]);
  
  // Show loading screen only when first loading, not during operations
  if (loading && !expenses.length) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expense Management</h1>
        <div className="flex items-center space-x-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-sc-green-300 focus:ring focus:ring-sc-green-200 focus:ring-opacity-50"
            value={currentTaxYear}
            onChange={handleTaxYearChange}
          >
            {TAX_YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            className="bg-sc-green hover:bg-sc-green/90 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green transition-colors"
            onClick={() => setIsAddingExpense(!isAddingExpense)}
          >
            {isAddingExpense ? 'Cancel' : 'Add Expense'}
          </button>
        </div>
      </div>
      
      {(error || formError) && (
        <Alert type="error" message={error || formError} onDismiss={() => setFormError('')} />
      )}
      
      {/* Add Expense Panel */}
      {isAddingExpense && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Add New Expense</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="expense_type_id" className="block text-sm font-medium text-gray-700 mb-1">
                Expense Type *
              </label>
              <select
                id="expense_type_id"
                name="expense_type_id"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                value={newExpense.expense_type_id}
                onChange={handleInputChange}
              >
                <option value="">Select Expense Type</option>
                {expenseTypes && expenseTypes.length > 0 ? (
                  expenseTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No expense types available</option>
                )}
              </select>
              {expenseTypes.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Warning: No expense types available. Please try refreshing the page.
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (ZAR) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                placeholder="e.g. Annual retirement contribution, medical expenses"
                value={newExpense.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={handleAddExpense}
                className="bg-sc-green-600 hover:bg-sc-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green-500"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Expense Summary Card */}
      <div className="bg-sc-green-50 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-xl font-medium text-gray-800">Expense Summary</h2>
            <p className="text-gray-600">Tax Year: {currentTaxYear}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-3xl font-bold text-sc-green-600">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>
      
      {/* Expense List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-800">Expenses</h2>
        </div>
        
        {loading && expenses.length > 0 ? (
          <Loading />
        ) : !expenses || expenses.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No expenses found. Add your first expense to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {/* Improved expense type display with better error handling */}
                      {expense.expense_type && expense.expense_type.name 
                        ? expense.expense_type.name 
                        : expense.expense_type_id 
                          ? `Type ID: ${expense.expense_type_id}` 
                          : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(expense.amount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;