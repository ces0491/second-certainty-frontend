// src/components/tax/TaxCalculation.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTaxCalc } from '../../hooks/useTaxCalc';
import Loading from '../common/Loading';
import Alert from '../common/Alert';

const TaxCalculator = () => {
  const { calculateCustomTax } = useTaxCalc();
  
  // Tax calculation inputs
  const [income, setIncome] = useState(750000);
  const [age, setAge] = useState(35);
  const [expenses, setExpenses] = useState({
    retirement: 50000,
    medical: 12000,
    donations: 7500,
    homeOffice: 8000,
    travel: 0
  });
  
  // Tax calculation results
  const [calculationResult, setCalculationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Tax years
  const [taxYear, setTaxYear] = useState('2025-2026');
  const TAX_YEARS = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];
  
  // Calculate tax - wrapped in useCallback
  const calculateTax = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the custom tax calculation data
      const customTaxData = {
        income: income,
        age: age,
        expenses: {
          retirement: expenses.retirement,
          medical: expenses.medical,
          donations: expenses.donations,
          home_office: expenses.homeOffice,
          travel: expenses.travel
        },
        tax_year: taxYear
      };
    
      // Call the custom tax calculator function from context
      const result = await calculateCustomTax(customTaxData);
      setCalculationResult(result);
    } catch (err) {
      console.error('Error calculating tax:', err);
      setError(err.message || 'Failed to calculate tax. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [income, age, expenses, taxYear, calculateCustomTax]); // Include all dependencies
  
  // Calculate tax on input changes - now with proper dependencies
  useEffect(() => {
    calculateTax();
  }, [calculateTax]); // calculateTax includes all necessary dependencies
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };
  
  // Handle input changes
  const handleIncomeChange = (e) => {
    const value = e.target.value;
    setIncome(value === '' ? 0 : Number(value));
  };
  
  const handleAgeChange = (e) => {
    const value = e.target.value;
    setAge(value === '' ? 0 : Number(value));
  };
  
  const handleExpenseChange = (type, e) => {
    const value = e.target.value;
    setExpenses({
      ...expenses,
      [type]: value === '' ? 0 : Number(value)
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tax Calculator</h1>
      
      {error && (
        <Alert type="error" message={error} />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-sc-green-600">
              <h2 className="text-xl font-bold text-white">Tax Inputs</h2>
              <p className="text-sc-green-200 text-sm">Enter your financial details</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Tax Year Selection */}
              <div>
                <label htmlFor="taxYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Year
                </label>
                <select
                  id="taxYear"
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                  value={taxYear}
                  onChange={(e) => setTaxYear(e.target.value)}
                >
                  {TAX_YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              {/* Income Input */}
              <div>
                <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Gross Income (ZAR)
                </label>
                <input
                  type="number"
                  id="income"
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                  value={income}
                  onChange={handleIncomeChange}
                  min="0"
                />
              </div>
              
              {/* Age Input */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age (as of February 2025)
                </label>
                <input
                  type="number"
                  id="age"
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                  value={age}
                  onChange={handleAgeChange}
                  min="0"
                  max="120"
                />
              </div>
              
              {/* Deductible Expenses */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Deductible Expenses</h3>
                
                {/* Retirement Contributions */}
                <div className="mb-3">
                  <label htmlFor="retirement" className="block text-sm font-medium text-gray-700 mb-1">
                    Retirement Annuity Contributions
                  </label>
                  <input
                    type="number"
                    id="retirement"
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                    value={expenses.retirement}
                    onChange={(e) => handleExpenseChange('retirement', e)}
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Max: 27.5% of taxable income (max R350,000)
                  </p>
                </div>
                
                {/* Medical Expenses */}
                <div className="mb-3">
                  <label htmlFor="medical" className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Expenses (not covered by medical aid)
                  </label>
                  <input
                    type="number"
                    id="medical"
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                    value={expenses.medical}
                    onChange={(e) => handleExpenseChange('medical', e)}
                    min="0"
                  />
                </div>
                
                {/* Donations */}
                <div className="mb-3">
                  <label htmlFor="donations" className="block text-sm font-medium text-gray-700 mb-1">
                    Donations to Public Benefit Organizations
                  </label>
                  <input
                    type="number"
                    id="donations"
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                    value={expenses.donations}
                    onChange={(e) => handleExpenseChange('donations', e)}
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Max: 10% of taxable income
                  </p>
                </div>
                
                {/* Home Office */}
                <div className="mb-3">
                  <label htmlFor="homeOffice" className="block text-sm font-medium text-gray-700 mb-1">
                    Home Office Expenses
                  </label>
                  <input
                    type="number"
                    id="homeOffice"
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                    value={expenses.homeOffice}
                    onChange={(e) => handleExpenseChange('homeOffice', e)}
                    min="0"
                  />
                </div>
                
                {/* Travel Expenses */}
                <div>
                  <label htmlFor="travel" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Travel Expenses
                  </label>
                  <input
                    type="number"
                    id="travel"
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm"
                    value={expenses.travel}
                    onChange={(e) => handleExpenseChange('travel', e)}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-sc-green-600">
              <h2 className="text-xl font-bold text-white">Tax Calculation Results</h2>
              <p className="text-sc-green-200 text-sm">
                {loading ? 'Calculating...' : 'Based on the information provided'}
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <Loading />
              </div>
            ) : calculationResult ? (
              <div className="p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Final Tax Card */}
                  <div className="bg-sc-green-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Final Tax Payable</h3>
                    <p className="text-2xl font-bold text-sc-green-600">{formatCurrency(calculationResult.final_tax)}</p>
                    <p className="text-xs text-gray-500">Annual</p>
                  </div>
                  
                  {/* Monthly Tax Card */}
                  <div className="bg-sc-green-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Monthly Tax</h3>
                    <p className="text-2xl font-bold text-sc-green-600">{formatCurrency(calculationResult.final_tax / 12)}</p>
                    <p className="text-xs text-gray-500">Per month</p>
                  </div>
                  
                  {/* Effective Rate Card */}
                  <div className="bg-sc-green-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Effective Tax Rate</h3>
                    <p className="text-2xl font-bold text-sc-green-600">{formatPercentage(calculationResult.effective_tax_rate)}</p>
                    <p className="text-xs text-gray-500">Of taxable income</p>
                  </div>
                </div>
                
                {/* Detailed Breakdown */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Gross Income
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(calculationResult.gross_income)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Less: Deductible Expenses
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(calculationResult.gross_income - calculationResult.taxable_income)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Taxable Income
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(calculationResult.taxable_income)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Tax on Taxable Income
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(calculationResult.tax_before_rebates)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Less: Tax Rebates
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(calculationResult.rebates)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Less: Medical Tax Credits
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(calculationResult.medical_credits)}
                        </td>
                      </tr>
                      <tr className="bg-sc-green-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          Final Tax Payable
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-sc-green-600 text-right">
                          {formatCurrency(calculationResult.final_tax)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Tax Savings Info */}
                {(calculationResult.gross_income - calculationResult.taxable_income) > 0 && (
                  <div className="mt-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4">
                    <h3 className="text-lg font-medium text-green-800 mb-2">
                      Tax Savings Summary
                    </h3>
                    <p className="text-sm text-green-700">
                      Your deductible expenses of {formatCurrency(calculationResult.gross_income - calculationResult.taxable_income)} have saved you approximately {formatCurrency((calculationResult.gross_income - calculationResult.taxable_income) * 0.3)} in taxes, based on your marginal tax rate.
                    </p>
                  </div>
                )}
                
                {/* Optimization Tips */}
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    Tax Optimization Tips
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                    <li>Consider maximizing your retirement contributions to reduce your taxable income.</li>
                    <li>Keep records of all medical expenses not covered by your medical aid.</li>
                    <li>If you work from home, ensure you're claiming eligible home office expenses.</li>
                    <li>Donations to approved public benefit organizations can be tax deductible up to 10% of your taxable income.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-500">Enter your details to calculate your tax liability.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;