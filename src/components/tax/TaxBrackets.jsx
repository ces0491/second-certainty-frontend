// src/components/tax/TaxBrackets.jsx - Fix for tax bracket display
import React, { useState, useEffect } from 'react';
import { useTaxCalc } from '../../hooks/useTaxCalc';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const TaxBrackets = () => {
  const { taxBrackets, loading, error, fetchTaxBrackets } = useTaxCalc();
  const [selectedYear, setSelectedYear] = useState("2025-2026");
  
  // Available tax years
  const AVAILABLE_TAX_YEARS = ["2025-2026", "2024-2025", "2023-2024", "2022-2023"];

  useEffect(() => {
    fetchTaxBrackets(selectedYear);
  }, [selectedYear, fetchTaxBrackets]);

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message={error} />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-sc-green-600">
        <h2 className="text-xl font-bold text-white">South African Tax Brackets</h2>
        <p className="text-sc-green-200 mt-1">Income tax rates for individuals</p>
      </div>
      
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <label htmlFor="taxYear" className="block text-sm font-medium text-gray-700 mr-4">
            Tax Year:
          </label>
          <select
            id="taxYear"
            name="taxYear"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 sm:text-sm rounded-md"
            value={selectedYear}
            onChange={handleYearChange}
          >
            {AVAILABLE_TAX_YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="px-6 py-4">
        {Array.isArray(taxBrackets) && taxBrackets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxable Income
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxBrackets.map((bracket, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {/* Fixed: Display "and above" for top tax bracket */}
                      {bracket.upper_limit 
                        ? `${formatCurrency(bracket.lower_limit)} - ${formatCurrency(bracket.upper_limit)}`
                        : `${formatCurrency(bracket.lower_limit)} and above`
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercentage(bracket.rate, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bracket.base_amount > 0 
                        ? `${formatCurrency(bracket.base_amount)} + ${formatPercentage(bracket.rate, 0)} of amount above ${formatCurrency(bracket.lower_limit - 1)}`
                        : formatPercentage(bracket.rate, 0)
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No tax bracket information available for {selectedYear}.</p>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 bg-gray-50">
        <p className="text-xs text-gray-500">
          Note: These tax rates apply to South African residents. Non-residents may be subject to different rates.
          Tax rebates and thresholds are not reflected in this table.
        </p>
      </div>
    </div>
  );
};

export default TaxBrackets;