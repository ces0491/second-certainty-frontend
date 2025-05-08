import React, { useState, useEffect } from 'react';

// Mock tax data
const MOCK_TAX_RESULT = {
  gross_income: 750000,
  taxable_income: 685000,
  tax_before_rebates: 210000,
  rebates: 17235,
  medical_credits: 3500,
  final_tax: 189265,
  effective_tax_rate: 0.2762,
  monthly_tax_rate: 0.023
};

// Mock expense types
const MOCK_EXPENSE_TYPES = [
  { id: 1, name: 'Retirement Annuity Contributions', description: 'Contributions to retirement annuities', max_percentage: 27.5 },
  { id: 2, name: 'Medical Expenses', description: 'Out-of-pocket medical expenses not covered by medical aid' },
  { id: 3, name: 'Home Office Expenses', description: 'Expenses for maintaining a home office if you work from home' },
  { id: 4, name: 'Donations to Public Benefit Organizations', description: 'Donations to approved public benefit organizations', max_percentage: 10 },
  { id: 5, name: 'Travel Expenses', description: 'Business-related travel expenses' }
];

const TaxCalculator = () => {
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
  const [taxYear, setTaxYear] = useState('2024-2025');
  const TAX_YEARS = ['2024-2025', '2023-2024'];
  
  // Calculate tax on input changes
  useEffect(() => {
    calculateTax();
  }, [income, age, expenses, taxYear]);
  
  const calculateTax = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real application, this would be an API call
      // const result = await calculateTaxApi(
      //   currentUser.id, 
      //   { income, age, expenses, taxYear }
      // );
      
      // For demo purposes, modify the mock data based on inputs
      const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);
      const taxableIncome = Math.max(0, income - totalExpenses);
      
      // Simple tax calculation (in production, this would come from the API)
      let taxBeforeRebates = 0;
      
      if (taxableIncome <= 237100) {
        taxBeforeRebates = taxableIncome * 0.18;
      } else if (taxableIncome <= 370500) {
        taxBeforeRebates = 42678 + (taxableIncome - 237100) * 0.26;
      } else if (taxableIncome <= 512800) {
        taxBeforeRebates = 77362 + (taxableIncome - 370500) * 0.31;
      } else if (taxableIncome <= 673000) {
        taxBeforeRebates = 121475 + (taxableIncome - 512800) * 0.36;
      } else if (taxableIncome <= 857900) {
        taxBeforeRebates = 179147 + (taxableIncome - 673000) * 0.39;
      } else if (taxableIncome <= 1817000) {
        taxBeforeRebates = 251258 + (taxableIncome - 857900) * 0.41;
      } else {
        taxBeforeRebates = 644489 + (taxableIncome - 1817000) * 0.45;
      }
      
      // Calculate rebates based on age
      let rebates = 17235; // Primary rebate
      if (age >= 65) rebates += 9444; // Secondary rebate
      if (age >= 75) rebates += 3145; // Tertiary rebate
      
      // Medical credits (simplified)
      const medicalCredits = 347 * 12; // R347 per month for main member
      
      // Final tax
      const finalTax = Math.max(0, taxBeforeRebates - rebates - medicalCredits);
      
      // Calculate effective tax rate
      const effectiveTaxRate = taxableIncome > 0 ? finalTax / taxableIncome : 0;
      
      // Calculate monthly tax rate
      const monthlyTaxRate = income > 0 ? finalTax / (income * 12) : 0;
      
      const result = {
        gross_income: income,
        taxable_income: taxableIncome,
        tax_before_rebates: taxBeforeRebates,
        rebates: rebates,
        medical_credits: medicalCredits,
        final_tax: finalTax,
        effective_tax_rate: effectiveTaxRate,
        monthly_tax_rate: monthlyTaxRate
      };
      
      setCalculationResult(result);
    } catch (err) {
      console.error('Error calculating tax:', err);
      setError('Failed to calculate tax. Please try again.');
    } finally {
      setLoading(false);
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
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-indigo-600">
              <h2 className="text-xl font-bold text-white">Tax Inputs</h2>
              <p className="text-indigo-200 text-sm">Enter your financial details</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Tax Year Selection */}
              <div>
                <label htmlFor="taxYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Year
                </label>
                <select
                  id="taxYear"
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            <div className="px-6 py-4 bg-indigo-600">
              <h2 className="text-xl font-bold text-white">Tax Calculation Results</h2>
              <p className="text-indigo-200 text-sm">
                {loading ? 'Calculating...' : 'Based on the information provided'}
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : calculationResult ? (
              <div className="p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Final Tax Card */}
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Final Tax Payable</h3>
                    <p className="text-2xl font-bold text-indigo-600">{formatCurrency(calculationResult.final_tax)}</p>
                    <p className="text-xs text-gray-500">Annual</p>
                  </div>
                  
                  {/* Monthly Tax Card */}
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Monthly Tax</h3>
                    <p className="text-2xl font-bold text-indigo-600">{formatCurrency(calculationResult.final_tax / 12)}</p>
                    <p className="text-xs text-gray-500">Per month</p>
                  </div>
                  
                  {/* Effective Rate Card */}
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Effective Tax Rate</h3>
                    <p className="text-2xl font-bold text-indigo-600">{formatPercentage(calculationResult.effective_tax_rate)}</p>
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
                      <tr className="bg-indigo-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          Final Tax Payable
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 text-right">
                          {formatCurrency(calculationResult.final_tax)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Tax Savings Info */}
                {(calculationResult.gross_income - calculationResult.taxable_income) > 0 && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-green-800 mb-2">
                      Tax Savings Summary
                    </h3>
                    <p className="text-sm text-green-700">
                      Your deductible expenses of {formatCurrency(calculationResult.gross_income - calculationResult.taxable_income)} have saved you approximately {formatCurrency((calculationResult.gross_income - calculationResult.taxable_income) * 0.3)} in taxes, based on your marginal tax rate.
                    </p>
                  </div>
                )}
                
                {/* Optimization Tips */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
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