// src/pages/ProvisionalTax.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTaxCalc } from '../hooks/useTaxCalc';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import { formatCurrency, formatDate } from '../utils/formatters';

const safeNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) ? value : 0;
};

const ProvisionalTax = () => {
  const { currentUser } = useAuth();
  const { provisionalTax, loading, error, fetchProvisionalTax } = useTaxCalc();
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    if (!provisionalTax) {
      fetchProvisionalTax();
    }
  }, [provisionalTax, fetchProvisionalTax]);
  
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
  
  if (loading) {
    return <Loading />;
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message={error} />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Provisional Tax</h1>
        <button
          className="text-sc-green-600 hover:text-sc-green-800 focus:outline-none"
          onClick={() => setShowInfo(!showInfo)}
        >
          {showInfo ? 'Hide Info' : 'What is Provisional Tax?'}
        </button>
      </div>
      
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
      
      {provisionalTax ? (
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
                    {formatDate(provisionalTax.first_payment.due_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold text-sc-green-600">
                    {formatCurrency(provisionalTax?.first_payment?.amount ? 
                      safeNumber(provisionalTax.first_payment.amount) : 0)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-800 mb-2">Payment Details</h3>
                <p className="text-sm text-gray-600">
                  This payment represents 50% of your estimated annual tax liability.
                </p>
                {new Date(provisionalTax.first_payment.due_date) < new Date() && (
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
                    {formatDate(provisionalTax.second_payment.due_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold text-sc-green-600">
                    {formatCurrency(provisionalTax.second_payment.amount)}
                      safeNumber(provisionalTax.second_payment.amount) : 0)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-800 mb-2">Payment Details</h3>
                <p className="text-sm text-gray-600">
                  This payment represents the remaining 50% of your estimated annual tax liability.
                </p>
                {new Date(provisionalTax.second_payment.due_date) < new Date() && (
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
                    {formatCurrency(provisionalTax.total_tax)}
                      safeNumber(provisionalTax.total_tax.amount) : 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taxable Income</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(provisionalTax.taxable_income)}
                      safeNumber(provisionalTax.taxable_income.amount) : 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Effective Tax Rate</p>
                  <p className="text-xl font-bold text-gray-800">
                    {provisionalTax?.effective_tax_rate ?
                      (safeNumber(provisionalTax.effective_tax_rate) * 100).toFixed(2) + '%' : '0.00%'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                <p className="font-bold">Important Note</p>
                <p>These calculations are estimates based on your current income and expense data. Actual tax liability may vary.</p>
              </div>
              
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
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            No provisional tax calculation available. Please ensure your income and expense data is up to date.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProvisionalTax;