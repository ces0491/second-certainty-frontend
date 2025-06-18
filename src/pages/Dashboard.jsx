// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useIncome } from '../hooks/useIncome';
import { useExpenses } from '../hooks/useExpenses'; 
import { useTaxCalc } from '../hooks/useTaxCalc';
import { formatCurrency, formatPercentage } from '../utils/formatters';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { incomes, loading: incomesLoading, error: incomesError, fetchIncomes, currentTaxYear, changeTaxYear } = useIncome();
  const { expenses, loading: expensesLoading, error: expensesError, fetchExpenses } = useExpenses(); 
  const { taxCalculation, loading: taxLoading, error: taxError, fetchTaxCalculation } = useTaxCalc();
  
  // Available tax years for selection
  const TAX_YEARS = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];
  
  // Track overall loading state
  const loading = incomesLoading || expensesLoading || taxLoading;
  
  // Handle tax year change
  const handleTaxYearChange = (e) => {
    changeTaxYear(e.target.value);
  };
  
  // Handle data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchIncomes();
        await fetchExpenses();
        await fetchTaxCalculation();
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTaxYear]); // Re-fetch when tax year changes
  
  // Generate financial summary data (income, expenses, tax, net income)
  const generateFinancialSummary = () => {
    if (!taxCalculation) return [];
    
    const totalExpenses = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
    const grossIncome = taxCalculation.gross_income || 0;
    const taxLiability = taxCalculation.final_tax || 0;
    const netIncome = grossIncome - taxLiability;
    
    return [
      {
        name: 'Gross Income',
        value: grossIncome,
        color: '#82ca9d'  // Green
      },
      {
        name: 'Expenses',
        value: totalExpenses,
        color: '#8884d8'  // Purple
      },
      {
        name: 'Tax Liability',
        value: taxLiability,
        color: '#ff8042'  // Orange
      },
      {
        name: 'Net Income',
        value: netIncome,
        color: '#0088FE'  // Blue
      }
    ];
  };
  
  // Generate income breakdown data for pie chart
  const getIncomeBreakdown = () => {
    if (!incomes || incomes.length === 0) return [];
    
    return incomes.map((income, index) => ({
      name: income.source_type || 'Unknown',
      value: income.annual_amount || 0,
      color: COLORS[index % COLORS.length]
    }));
  };
  
  // Generate expense breakdown data for pie chart
  const getExpenseBreakdown = () => {
    if (!expenses || expenses.length === 0) return [];
    
    // Group expenses by type
    const expensesByType = {};
    expenses.forEach(expense => {
      const typeName = expense.expense_type?.name || 'Other';
      if (!expensesByType[typeName]) {
        expensesByType[typeName] = 0;
      }
      expensesByType[typeName] += (expense.amount || 0);
    });
    
    // Convert to array for chart
    return Object.entries(expensesByType).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
  };

  // Show loading state only when data is actually being fetched
  if (loading && !taxCalculation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sc-green"></div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!taxCalculation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-500">Loading tax data for {currentTaxYear}...</p>
        </div>
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-500">No tax data available for tax year {currentTaxYear}. Please make sure you've added income sources.</p>
        </div>
      </div>
    );
  }

  const financialSummary = generateFinancialSummary();
  const incomeBreakdown = getIncomeBreakdown();
  const expenseBreakdown = getExpenseBreakdown();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tax Dashboard</h1>
        <div className="flex items-center space-x-4">
          <label htmlFor="taxYear" className="text-sm font-medium text-gray-700">
            Tax Year:
          </label>
          <select
            id="taxYear"
            className="rounded-md border-gray-300 shadow-sm focus:border-sc-green-300 focus:ring focus:ring-sc-green-200 focus:ring-opacity-50"
            value={currentTaxYear}
            onChange={handleTaxYearChange}
          >
            {TAX_YEARS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="bg-sc-green-100 rounded-lg p-2">
            <span className="text-sm text-sc-green-800 font-medium">Welcome, {currentUser?.name}</span>
          </div>
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
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(taxCalculation.gross_income || 0)}</p>
          <p className="text-sm text-gray-500">Tax Year: {currentTaxYear}</p>
        </div>
        
        {/* Tax Liability Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">Tax Liability</h2>
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(taxCalculation.final_tax || 0)}</p>
          <p className="text-sm text-gray-500">Tax Year: {currentTaxYear}</p>
        </div>
        
        {/* Effective Tax Rate Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">Effective Tax Rate</h2>
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatPercentage(taxCalculation.effective_tax_rate || 0)}
          </p>
          <p className="text-sm text-gray-500">Tax Year: {currentTaxYear}</p>
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
            {formatCurrency((taxCalculation.final_tax || 0) / 12)}
          </p>
          <p className="text-sm text-gray-500">Average for {currentTaxYear}</p>
        </div>
      </div>
      
      {/* Financial Summary Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-medium text-gray-800 mb-4">Financial Summary - {currentTaxYear}</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialSummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="value" name="Amount">
                {financialSummary.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Income Sources and Expense Breakdown Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income Sources Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Income Sources - {currentTaxYear}</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Expense Breakdown - {currentTaxYear}</h2>
          {expenseBreakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-center text-gray-500">No expenses recorded for this tax year.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Income and Expenses Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Income */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-medium text-gray-800">Income Sources - {currentTaxYear}</h2>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{income.source_type || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(income.annual_amount || 0)}</td>
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
              <p className="text-gray-500">No income sources found for this tax year. Add your first income source to get started.</p>
            )}
          </div>
        </div>
        
        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-medium text-gray-800">Recent Expenses - {currentTaxYear}</h2>
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
                          {formatCurrency(expense.amount || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No expenses found for this tax year. Add your deductible expenses to potentially reduce your tax liability.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;