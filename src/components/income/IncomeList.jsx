// src/components/income/IncomeList.jsx
import React, { useState } from 'react';  // Remove useEffect if not needed
import { useIncome } from '../../hooks/useIncome';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';
import Alert from '../common/Alert';

// Keep the income source types (this could be fetched from API later)
const INCOME_SOURCE_TYPES = [
  'Salary',
  'Rental',
  'Interest',
  'Dividends',
  'Business Income',
  'Capital Gains',
  'Other'
];

const IncomeManagement = () => {
  // Use currentUser if needed, or remove it
  const { /* currentUser, */ } = useAuth();  // Comment out or remove if not used
  const { 
    incomes, 
    loading, 
    error, 
    currentTaxYear, 
    changeTaxYear,
    addIncome: addIncomeItem,
    deleteIncome: deleteIncomeItem
  } = useIncome();
  
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [formError, setFormError] = useState('');
  
  // New income form state
  const [newIncome, setNewIncome] = useState({
    source_type: '',
    description: '',
    annual_amount: '',
    is_paye: false,
    tax_year: currentTaxYear
  });
  
  // Available tax years
  const TAX_YEARS = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewIncome({
      ...newIncome,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle form submission
  const handleAddIncome = async () => {
    // Validate form
    if (!newIncome.source_type || !newIncome.annual_amount || !newIncome.tax_year) {
      setFormError('Please fill in all required fields.');
      return;
    }
    
    try {
      // Convert annual_amount to number
      const incomeData = {
        ...newIncome,
        annual_amount: Number(newIncome.annual_amount)
      };
      
      const result = await addIncomeItem(incomeData);
      
      if (result.success) {
        // Reset form
        setNewIncome({
          source_type: '',
          description: '',
          annual_amount: '',
          is_paye: false,
          tax_year: currentTaxYear
        });
        
        // Close form
        setIsAddingIncome(false);
        setFormError('');
      } else {
        setFormError(result.error || 'Failed to add income. Please try again.');
      }
    } catch (err) {
      console.error('Error adding income:', err);
      setFormError(err.message || 'Failed to add income. Please try again.');
    }
  };
  
  // Handle income deletion
  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income source?')) {
      return;
    }
    
    try {
      await deleteIncomeItem(id);
    } catch (err) {
      console.error('Error deleting income:', err);
      setFormError(err.message || 'Failed to delete income. Please try again.');
    }
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };
  
  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + income.annual_amount, 0);
  
  // Handle tax year change
  const handleTaxYearChange = (e) => {
    changeTaxYear(e.target.value);
    
    // Update new income form tax year
    setNewIncome({
      ...newIncome,
      tax_year: e.target.value
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Income Management</h1>
        <div className="flex items-center space-x-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={currentTaxYear}
            onChange={handleTaxYearChange}
          >
            {TAX_YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setIsAddingIncome(!isAddingIncome)}
          >
            {isAddingIncome ? 'Cancel' : 'Add Income Source'}
          </button>
        </div>
      </div>
      
      {(error || formError) && (
        <Alert type="error" message={error || formError} onDismiss={() => setFormError('')} />
      )}
      
      {/* Add Income Panel */}
      {isAddingIncome && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Add New Income Source</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="source_type" className="block text-sm font-medium text-gray-700 mb-1">
                Income Type *
              </label>
              <select
                id="source_type"
                name="source_type"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newIncome.source_type}
                onChange={handleInputChange}
              >
                <option value="">Select Income Type</option>
                {INCOME_SOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="annual_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Annual Amount (ZAR) *
              </label>
              <input
                type="number"
                id="annual_amount"
                name="annual_amount"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Annual amount"
                value={newIncome.annual_amount}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g. Main employment, rental property"
                value={newIncome.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="tax_year" className="block text-sm font-medium text-gray-700 mb-1">
                Tax Year *
              </label>
              <select
                id="tax_year"
                name="tax_year"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newIncome.tax_year}
                onChange={handleInputChange}
              >
                {TAX_YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center h-full mt-6">
              <input
                id="is_paye"
                name="is_paye"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={newIncome.is_paye}
                onChange={handleInputChange}
              />
              <label htmlFor="is_paye" className="ml-2 block text-sm text-gray-900">
                PAYE is deducted from this income
              </label>
            </div>
            
            <div className="flex items-center justify-end h-full mt-6">
              <button
                onClick={handleAddIncome}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Income Source'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Income Summary Card */}
      <div className="bg-indigo-50 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-xl font-medium text-gray-800">Income Summary</h2>
            <p className="text-gray-600">Tax Year: {currentTaxYear}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-600">Total Annual Income</p>
            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
      </div>
      
      {/* Income List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-800">Income Sources</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loading />
          </div>
        ) : incomes.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No income sources found. Add your first income source to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (Annual)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PAYE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomes.map((income) => (
                  <tr key={income.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {income.source_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {income.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(income.annual_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {income.is_paye ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteIncome(income.id)}
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

export default IncomeManagement;