import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for demonstration purposes
// In a real app, this would come from API calls to your backend
const MOCK_USER = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  is_provisional_taxpayer: true
};

const MOCK_TAX_DATA = {
  gross_income: 750000,
  taxable_income: 685000,
  tax_before_rebates: 210000,
  rebates: 17235,
  medical_credits: 3500,
  final_tax: 189265,
  effective_tax_rate: 0.2762,
  monthly_tax_rate: 0.023
};

const MOCK_INCOMES = [
  { id: 1, source_type: 'Salary', description: 'Main employment', annual_amount: 600000, is_paye: true, tax_year: '2024-2025' },
  { id: 2, source_type: 'Rental', description: 'Property investment', annual_amount: 120000, is_paye: false, tax_year: '2024-2025' },
  { id: 3, source_type: 'Interest', description: 'Savings account', annual_amount: 30000, is_paye: false, tax_year: '2024-2025' }
];

const MOCK_EXPENSES = [
  { id: 1, expense_type: { id: 1, name: 'Retirement Annuity Contributions' }, description: 'Annual RA contribution', amount: 50000, tax_year: '2024-2025' },
  { id: 2, expense_type: { id: 2, name: 'Medical Expenses' }, description: 'Out of pocket medical', amount: 12000, tax_year: '2024-2025' },
  { id: 3, expense_type: { id: 3, name: 'Home Office Expenses' }, description: 'Work from home setup', amount: 8000, tax_year: '2024-2025' }
];

// Sample colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taxData, setTaxData] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  
  // Simulate API calls with mock data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock data
        setTaxData(MOCK_TAX_DATA);
        setIncomes(MOCK_INCOMES);
        setExpenses(MOCK_EXPENSES);
        
        // Create simulated monthly data based on annual figures
        const annualTax = MOCK_TAX_DATA.final_tax;
        const simulatedMonthly = Array.from({ length: 12 }, (_, i) => {
          const month = new Date(2025, i, 1).toLocaleString('default', { month: 'short' });
          return {
            name: month,
            tax: Math.round((annualTax / 12) * (0.9 + Math.random() * 0.2)), // Small random variation
            income: Math.round((MOCK_TAX_DATA.gross_income / 12) * (0.9 + Math.random() * 0.2))
          };
        });
        setMonthlyData(simulatedMonthly);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
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
    return `${(value * 100).toFixed(2)}%`;
  };
  
  // Prepare income data for pie chart
  const incomeData = incomes.map((income, index) => ({
    name: income.source_type,
    value: income.annual_amount,
    color: COLORS[index % COLORS.length]
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tax Dashboard</h1>
        <div className="bg-indigo-100 rounded-lg p-2">
          <span className="text-sm text-indigo-800 font-medium">Welcome, {MOCK_USER.name}</span>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Gross Income Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">Gross Income</h2>
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800">{taxData ? formatCurrency(taxData.gross_income) : 'N/A'}</p>
          <p className="text-sm text-gray-500">Annual</p>
        </div>
        
        {/* Tax Liability Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">Tax Liability</h2>
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800">{taxData ? formatCurrency(taxData.final_tax) : 'N/A'}</p>
          <p className="text-sm text-gray-500">Annual</p>
        </div>
        
        {/* Effective Tax Rate Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">Effective Tax Rate</h2>
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800">{taxData ? formatPercentage(taxData.effective_tax_rate) : 'N/A'}</p>
          <p className="text-sm text-gray-500">Annual</p>
        </div>
        
        {/* Monthly Tax Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">Monthly Tax</h2>
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {taxData ? formatCurrency(taxData.final_tax / 12) : 'N/A'}
          </p>
          <p className="text-sm text-gray-500">Average</p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income & Tax Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Income & Tax Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#82ca9d" name="Income" />
                <Line type="monotone" dataKey="tax" stroke="#8884d8" name="Tax" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Income Breakdown Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Income Sources</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Income and Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Income */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-medium text-gray-800">Income Sources</h2>
          </div>
          <div className="p-6">
            {incomes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PAYE</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incomes.map((income) => (
                      <tr key={income.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{income.source_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(income.annual_amount)}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No income sources found. Add your first income source to get started.</p>
            )}
          </div>
        </div>
        
        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-medium text-gray-800">Recent Expenses</h2>
          </div>
          <div className="p-6">
            {expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.expense_type ? expense.expense_type.name : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No expenses found. Add your deductible expenses to potentially reduce your tax liability.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;