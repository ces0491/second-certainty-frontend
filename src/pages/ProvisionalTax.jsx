// src/pages/ProvisionalTax.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTaxCalc } from '../hooks/useTaxCalc';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import { formatCurrency, formatDate } from '../utils/formatters';

const safeNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 0;
  return typeof value === 'number' ? value : parseFloat(value) || 0;
};

const ProvisionalTax = () => {
  const { currentUser } = useAuth();
  const { provisionalTax, loading, error, fetchProvisionalTax, currentTaxYear, changeTaxYear } = useTaxCalc();
  const [showInfo, setShowInfo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastError, setLastError] = useState('');
  
  // Available tax years
  const TAX_YEARS = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];
  
  // Handle tax year change
  const handleTaxYearChange = (e) => {
    changeTaxYear(e.target.value);
  };
  
  // Manual refresh function with useCallback
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLastError('');
    try {
      console.log('Refreshing provisional tax...');
      await fetchProvisionalTax();
      console.log('Provisional tax refreshed successfully');
    } catch (err) {
      console.error('Error refreshing provisional tax:', err);
      setLastError(err.message || 'Failed to refresh provisional tax calculation');
    } finally {
      setRefreshing(false);
    }
  }, [fetchProvisionalTax]);
  
  useEffect(() => {
    if (currentUser?.is_provisional_taxpayer) {
      console.log('Fetching provisional tax for user:', currentUser.id, 'tax year:', currentTaxYear);
      fetchProvisionalTax();
    }
  }, [currentTaxYear, currentUser, fetchProvisionalTax]);
  
  if (!currentUser?.is_provisional_taxpayer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert 
          type="info" 
          message="This section is only for provisional taxpayers. Please update your profile if you are a provisional taxpayer."
        />
      </div>
    );
  }
  
  if (loading && !refreshing) {
    return <Loading />;
  }
  
  // Helper function to safely extract payment data
  const getPaymentData = (payment) => {
    if (!payment) return { amount: 0, due_date: null };
    
    // Handle new structure: { amount: number, due_date: string }
    if (typeof payment === 'object' && payment.amount !== undefined) {
      return {
        amount: safeNumber(payment.amount),
        due_date: payment.due_date
      };
    }
    
    // Handle old structure: just a number
    if (typeof payment === 'number') {
      return {
        amount: safeNumber(payment),
        due_date: null
      };
    }
    
    return { amount: 0, due_date: null };
  };
  
  // Calculate due dates
  const calculateDueDates = (taxYear) => {
    const yearParts = taxYear.split('-');
    const startYear = parseInt(yearParts[0]);
    const endYear = parseInt(yearParts[1]);
    
    return {
      first_due_date: `${startYear}-08-31`,
      second_due_date: `${endYear}-02-28`
    };
  };
  
  // Extract payment data safely with fallback due dates
  const dueDates = calculateDueDates(currentTaxYear);
  const firstPayment = getPaymentData(provisionalTax?.first_payment);
  const secondPayment = getPaymentData(provisionalTax?.second_payment);
  
  // Use calculated due dates if not provided
  if (!firstPayment.due_date) {
    firstPayment.due_date = dueDates.first_due_date;
  }
  if (!secondPayment.due_date) {
    secondPayment.due_date = dueDates.second_due_date;
  }
  
  // Get total tax - handle both 'total_tax' and 'annual_tax' properties
  const totalTax = safeNumber(provisionalTax?.total_tax || provisionalTax?.annual_tax || 0);
  const taxableIncome = safeNumber(provisionalTax?.taxable_income || 0);
  const effectiveRate = safeNumber(provisionalTax?.effective_tax_rate || 0);
  
  // Debug logging
  console.log('ProvisionalTax Debug:', {
    provisionalTax,
    totalTax,
    taxableIncome,
    effectiveRate,
    firstPayment,
    secondPayment,
    error,
    lastError
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Provisional Tax</h1>
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
            className="text-sc-green-600 hover:text-sc-green-800 focus:outline-none"
            onClick={() => setShowInfo(!showInfo)}
          >
            {showInfo ? 'Hide Info' : 'What is Provisional Tax?'}
          </button>
        </div>
      </div>
      
      {/* Show errors */}
      {(error || lastError) && (
        <Alert type="error" message={error || lastError} onDismiss={() => setLastError('')} />
      )}
      
      {showInfo && (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
          <h2 className="font-bold mb-2">About Provisional Tax</h2>
          <p className="mb-2">
            Provisional tax is a method of paying income tax in advance, based on estimated taxable income for the current tax year.
          </p>
          <p className="mb-2">
            As a provisional taxpayer, you are required to make two payments in a tax year:
          </p>
          <ul className="list-disc pl-5 mb-2">
            <li>First payment: Due by the end of August (6 months into the tax year)</li>
            <li>Second payment: Due by the end of February (at the end of the tax year)</li>
          </ul>
          <p>
            Each payment is typically 50% of your estimated annual tax liability. This tool helps you calculate those amounts based on your current income and expense data.
          </p>
        </div>
      )}
      
      {/* Refresh Button */}
      <div className="mb-6">
        <button 
          onClick={handleRefresh} 
          disabled={refreshing || loading}
          className="bg-sc-green hover:bg-sc-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green transition-colors disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Tax Calculation'}
        </button>
        <p className="text-sm text-gray-500 mt-1">
          Click to recalculate your provisional tax based on current income and expense data.
        </p>
      </div>
      
      {/* Always show the cards, even if data is zero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Payment Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-sc-green-600">
            <h2 className="text-xl font-bold text-white">First Provisional Payment</h2>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {firstPayment.due_date 
                    ? formatDate(firstPayment.due_date)
                    : 'August 31, 2025'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-sc-green-600">
                  {formatCurrency(firstPayment.amount)}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-800 mb-2">Payment Details</h3>
              <p className="text-sm text-gray-600">
                This payment represents 50% of your estimated annual tax liability.
              </p>
              {firstPayment.amount === 0 && (
                <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded">
                  <p className="text-sm">No payment required - your income may be below the tax threshold.</p>
                </div>
              )}
              {firstPayment.due_date && new Date(firstPayment.due_date) < new Date() && firstPayment.amount > 0 && (
                <div className="mt-2 bg-red-100 text-red-600 p-2 rounded">
                  <p className="text-sm font-medium">This payment is now overdue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Second Payment Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-sc-green-600">
            <h2 className="text-xl font-bold text-white">Second Provisional Payment</h2>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {secondPayment.due_date 
                    ? formatDate(secondPayment.due_date)
                    : 'February 28, 2026'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-sc-green-600">
                  {formatCurrency(secondPayment.amount)}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-800 mb-2">Payment Details</h3>
              <p className="text-sm text-gray-600">
                This payment represents the remaining 50% of your estimated annual tax liability.
              </p>
              {secondPayment.amount === 0 && (
                <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded">
                  <p className="text-sm">No payment required - your income may be below the tax threshold.</p>
                </div>
              )}
              {secondPayment.due_date && new Date(secondPayment.due_date) < new Date() && secondPayment.amount > 0 && (
                <div className="mt-2 bg-red-100 text-red-600 p-2 rounded">
                  <p className="text-sm font-medium">This payment is now overdue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tax Summary Card */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-sc-green-600">
            <h2 className="text-xl font-bold text-white">Provisional Tax Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Annual Tax</p>
                <p className="text-xl font-bold text-gray-800">
                  {formatCurrency(totalTax)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxable Income</p>
                <p className="text-xl font-bold text-gray-800">
                  {formatCurrency(taxableIncome)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Effective Tax Rate</p>
                <p className="text-xl font-bold text-gray-800">
                  {(effectiveRate * 100).toFixed(2)}%
                </p>
              </div>
            </div>
            
            {/* Show help information if calculations show zero */}
            {totalTax === 0 && taxableIncome === 0 && (
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p className="font-bold">No Tax Calculation Available</p>
                <p>Your provisional tax shows zero because:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>You may not have income sources for the {currentTaxYear} tax year</li>
                  <li>Your income may be below the tax threshold</li>
                  <li>There may be an issue with the tax calculation</li>
                </ul>
                <p className="mt-2">
                  <strong>Solution:</strong> Add income sources for {currentTaxYear} on the Income page, 
                  then refresh this calculation.
                </p>
              </div>
            )}
            
            {totalTax > 0 && (
              <div className="mt-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                <p className="font-bold">✅ Tax Calculation Complete</p>
                <p>Your provisional tax has been calculated based on your current income and expense data.</p>
                <div className="mt-2 text-sm">
                  <p><strong>Next Steps:</strong></p>
                  <ul className="list-disc pl-5">
                    <li>Make your first payment by {formatDate(firstPayment.due_date)}</li>
                    <li>Make your second payment by {formatDate(secondPayment.due_date)}</li>
                    <li>Keep your income and expense data updated for accurate calculations</li>
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-800 mb-2">Payment Methods</h3>
              <p className="text-sm text-gray-600">
                Provisional tax payments can be made through:
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-2">
                <li>eFiling on the SARS website</li>
                <li>Electronic Funds Transfer (EFT) to SARS</li>
                <li>At your bank (if they offer this service)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvisionalTax;