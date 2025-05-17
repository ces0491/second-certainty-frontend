// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useIncome } from '../hooks/useIncome';
import { useExpenses } from '../hooks/useExpenses'; 
import { useTaxCalc } from '../hooks/useTaxCalc';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import { formatCurrency, formatPercentage } from '../utils/formatters';

// Sample colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { incomes, loading: incomesLoading, error: incomesError, fetchIncomes } = useIncome();
  const { expenses, loading: expensesLoading, error: expensesError, fetchExpenses } = useExpenses(); 
  const { taxCalculation, loading: taxLoading, error: taxError, fetchTaxCalculation } = useTaxCalc();
  
  // Add forcedLoading state
  const [forcedLoading, setForcedLoading] = useState(true);
  
  // Track overall loading and error states
  const loading = incomesLoading || expensesLoading || taxLoading;
  const error = incomesError || expensesError || taxError;
  
  // Handle data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!incomesLoading) {
          await fetchIncomes();
        }
        if (!expensesLoading) {
          await fetchExpenses();
        }
        if (!taxLoading) {
          await fetchTaxCalculation();
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    
    fetchData();
  }, []); // Simplified dependencies to avoid loops
  
  // Add a timeout for the loading state
  useEffect(() => {
    let timeout;
    if (loading) {
      timeout = setTimeout(() => {
        // Force exit loading state after 10 seconds
        setForcedLoading(false);
      }, 10000);
    } else {
      // When loading completes normally, also exit forced loading
      setForcedLoading(false);
    }
    
    return () => clearTimeout(timeout);
  }, [loading]);
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };
  
  // Generate monthly data from annual figures
  const generateMonthlyData = () => {
    if (!taxCalculation) return [];
    
    const annualTax = taxCalculation.final_tax || 0;
    const annualIncome = taxCalculation.gross_income || 0;
    
    return Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2025, i, 1).toLocaleString('default', { month: 'short' });
      return {
        name: month,
        tax: Math.round((annualTax / 12) * (0.9 + Math.random() * 0.2)), // Small random variation
        income: Math.round((annualIncome / 12) * (0.9 + Math.random() * 0.2))
      };
    });
  };
  
  // Prepare income data for pie chart
  const getIncomeData = () => {
    if (!incomes || !incomes.length) return [];
    
    return incomes.map((income, index) => ({
      name: income.source_type || 'Unknown',
      value: income.annual_amount || 0,
      color: COLORS[index % COLORS.length]
    }));
  };

  // Show loading only if still in loading state and forcedLoading is true
  if (loading && forcedLoading) {
    return <Loading />;
  }

  // Show error if any
  if (error) {
    return <Alert type="error" message={error} />;
  }

  // Show empty state if no data
  if (!taxCalculation || !incomes || incomes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">No tax data available. Please make sure you've added income sources.</p>
      </div>
    );
  }

  const monthlyData = generateMonthlyData();
  const incomeData = getIncomeData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tax Dashboard</h1>
        <div className="bg-sc-green-100 rounded-lg p-2">
          <span className="text-sm text-sc-green-800 font-medium">Welcome, {currentUser?.name}</span>
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
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(taxCalculation.gross_income)}</p>
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
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(taxCalculation.final_tax)}</p>
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
          <p className="text-2xl font-bold text-gray-800">{formatPercentage(taxCalculation.effective_tax_rate)}</p>
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
            {formatCurrency(taxCalculation.final_tax / 12)}
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