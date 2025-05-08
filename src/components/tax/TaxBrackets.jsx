import React, { useState, useEffect } from 'react';

// Mock tax brackets data for 2024-2025
const MOCK_TAX_BRACKETS = [
  { lower_limit: 1, upper_limit: 237100, rate: 0.18, base_amount: 0, tax_year: "2024-2025" },
  { lower_limit: 237101, upper_limit: 370500, rate: 0.26, base_amount: 42678, tax_year: "2024-2025" },
  { lower_limit: 370501, upper_limit: 512800, rate: 0.31, base_amount: 77362, tax_year: "2024-2025" },
  { lower_limit: 512801, upper_limit: 673000, rate: 0.36, base_amount: 121475, tax_year: "2024-2025" },
  { lower_limit: 673001, upper_limit: 857900, rate: 0.39, base_amount: 179147, tax_year: "2024-2025" },
  { lower_limit: 857901, upper_limit: 1817000, rate: 0.41, base_amount: 251258, tax_year: "2024-2025" },
  { lower_limit: 1817001, upper_limit: null, rate: 0.45, base_amount: 644489, tax_year: "2024-2025" },
];

// Mock tax years available
const AVAILABLE_TAX_YEARS = ["2024-2025", "2023-2024", "2022-2023"];

const TaxBrackets = () => {
  const [taxBrackets, setTaxBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2024-2025");

  useEffect(() => {
    const fetchTaxBrackets = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would be an API call like:
        // const response = await api.get(`/tax/tax-brackets/?tax_year=${selectedYear}`);
        // setTaxBrackets(response.data);
        
        setTaxBrackets(MOCK_TAX_BRACKETS);
      } catch (err) {
        console.error('Error fetching tax brackets:', err);
        setError('Failed to load tax brackets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaxBrackets();
  }, [selectedYear]);

  // Format currency values
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
    return `${(value * 100).toFixed(0)}%`;
  };

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-indigo-600">
        <h2 className="text-xl font-bold text-white">South African Tax Brackets</h2>
        <p className="text-indigo-200 mt-1">Income tax rates for individuals</p>
      </div>
      
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <label htmlFor="taxYear" className="block text-sm font-medium text-gray-700 mr-4">
            Tax Year:
          </label>
          <select
            id="taxYear"
            name="taxYear"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                    {bracket.upper_limit 
                      ? `${formatCurrency(bracket.lower_limit)} - ${formatCurrency(bracket.upper_limit)}`
                      : `${formatCurrency(bracket.lower_limit)} and above`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercentage(bracket.rate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bracket.base_amount > 0 
                      ? `${formatCurrency(bracket.base_amount)} + ${formatPercentage(bracket.rate)} of amount above ${formatCurrency(bracket.lower_limit - 1)}`
                      : formatPercentage(bracket.rate)
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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