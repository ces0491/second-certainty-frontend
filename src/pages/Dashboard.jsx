// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIncome } from '../hooks/useIncome';
import { useExpenses } from '../hooks/useExpenses';
import { useTaxCalc } from '../hooks/useTaxCalc';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import Loading from '../components/common/Loading';

// Lazy load heavy chart components
const WaterfallChart = lazy(() => import('../components/charts/WaterfallChart'));
const PieChartComponent = lazy(() => import('../components/charts/PieChartComponent'));

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const {
    incomes,
    loading: incomesLoading,
    fetchIncomes,
    currentTaxYear,
    changeTaxYear,
  } = useIncome();
  const { 
    expenses, 
    loading: expensesLoading, 
    fetchExpenses 
  } = useExpenses();
  const {
    taxCalculation,
    loading: taxLoading,
    fetchTaxCalculation,
  } = useTaxCalc();

  // Local state to prevent multiple fetches
  const [dataFetched, setDataFetched] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  // Available tax years for selection
  const TAX_YEARS = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];

  // Track overall loading state
  const loading = incomesLoading || expensesLoading || taxLoading;

  // Handle tax year change
  const handleTaxYearChange = (e) => {
    setDataFetched(false); // Reset fetch state
    setShowCharts(false); // Hide charts while loading
    changeTaxYear(e.target.value);
  };

  // Optimized data fetching - fetch sequentially to reduce server load
  useEffect(() => {
    if (!dataFetched && currentUser) {
      const fetchData = async () => {
        try {
          // Fetch data sequentially to reduce server load
          await fetchIncomes();
          await fetchExpenses();
          await fetchTaxCalculation();
          setDataFetched(true);
          
          // Show charts after a short delay to improve perceived performance
          setTimeout(() => setShowCharts(true), 500);
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
          setDataFetched(true); // Set to true to stop infinite loading
        }
      };

      fetchData();
    }
  }, [currentTaxYear, currentUser, dataFetched, fetchIncomes, fetchExpenses, fetchTaxCalculation]);

  // Memoized calculations to prevent unnecessary recalculations
  const calculatedData = useMemo(() => {
    const totalIncome = incomes.reduce((sum, income) => sum + (income.annual_amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const monthlyTax = taxCalculation ? (taxCalculation.final_tax || 0) / 12 : 0;

    return {
      totalIncome,
      totalExpenses,
      monthlyTax,
    };
  }, [incomes, expenses, taxCalculation]);

  // Memoized chart data
  const chartData = useMemo(() => {
    // Generate waterfall chart data
    const generateWaterfallData = () => {
      if (!taxCalculation) return [];

      const grossIncome = taxCalculation.gross_income || 0;
      const taxLiability = taxCalculation.final_tax || 0;

      return [
        {
          name: 'Gross Income',
          y: grossIncome,
          color: '#10B981',
        },
        {
          name: 'Deductible Expenses',
          y: -calculatedData.totalExpenses,
          color: '#8B5CF6',
        },
        {
          name: 'Tax Liability',
          y: -taxLiability,
          color: '#EF4444',
        },
        {
          name: 'Net Income',
          isSum: true,
          color: '#3B82F6',
        },
      ];
    };

    // Generate income breakdown data
    const getIncomeBreakdown = () => {
      if (!incomes || incomes.length === 0) return [];

      return incomes.map((income, index) => ({
        name: income.source_type || 'Unknown',
        value: income.annual_amount || 0,
        color: COLORS[index % COLORS.length],
      }));
    };

    // Generate expense breakdown data
    const getExpenseBreakdown = () => {
      if (!expenses || expenses.length === 0) return [];

      const expensesByType = {};
      expenses.forEach((expense) => {
        const typeName = expense.expense_type?.name || 'Other';
        if (!expensesByType[typeName]) {
          expensesByType[typeName] = 0;
        }
        expensesByType[typeName] += expense.amount || 0;
      });

      return Object.entries(expensesByType).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }));
    };

    return {
      waterfallData: generateWaterfallData(),
      incomeBreakdown: getIncomeBreakdown(),
      expenseBreakdown: getExpenseBreakdown(),
    };
  }, [taxCalculation, calculatedData.totalExpenses, incomes, expenses]);

  // Show loading state only when actually loading
  if (loading && !dataFetched) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sc-green mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!taxCalculation && dataFetched) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome to Second Certainty!</h2>
          <p className="text-gray-500 mb-4">
            No tax data available for tax year {currentTaxYear}. Get started by adding your income sources.
          </p>
          <a 
            href="/income" 
            className="bg-sc-green text-white px-4 py-2 rounded-md hover:bg-sc-green-700 transition-colors"
          >
            Add Income Sources
          </a>
        </div>
      </div>
    );
  }

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
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="bg-sc-green-100 rounded-lg p-2">
            <span className="text-sm text-sc-green-800 font-medium">
              Welcome, {currentUser?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">Gross Income</h2>
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(taxCalculation?.gross_income || 0)}
          </p>
          <p className="text-sm text-gray-500">Tax Year: {currentTaxYear}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">Tax Liability</h2>
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(taxCalculation?.final_tax || 0)}
          </p>
          <p className="text-sm text-gray-500">Tax Year: {currentTaxYear}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">Effective Tax Rate</h2>
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatPercentage(taxCalculation?.effective_tax_rate || 0)}
          </p>
          <p className="text-sm text-gray-500">Tax Year: {currentTaxYear}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-500">Monthly Tax</h2>
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(calculatedData.monthlyTax)}
          </p>
          <p className="text-sm text-gray-500">Average for {currentTaxYear}</p>
        </div>
      </div>

      {/* Charts Section - Lazy loaded */}
      {showCharts && (
        <div className="space-y-8">
          {/* Financial Summary Waterfall Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loading /></div>}>
              <WaterfallChart 
                data={chartData.waterfallData} 
                currentTaxYear={currentTaxYear}
              />
            </Suspense>
          </div>

          {/* Income Sources and Expense Breakdown Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-4">
                Income Sources - {currentTaxYear}
              </h2>
              <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loading /></div>}>
                <PieChartComponent 
                  data={chartData.incomeBreakdown}
                  emptyMessage="No income sources for this tax year."
                />
              </Suspense>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-4">
                Expense Breakdown - {currentTaxYear}
              </h2>
              <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loading /></div>}>
                <PieChartComponent 
                  data={chartData.expenseBreakdown}
                  emptyMessage="No expenses recorded for this tax year."
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Data Tables - Always show but simplified */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Income */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-medium text-gray-800">Income Sources - {currentTaxYear}</h2>
          </div>
          <div className="p-6">
            {incomes.length > 0 ? (
              <div className="space-y-2">
                {incomes.slice(0, 5).map((income) => (
                  <div key={income.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{income.source_type || 'Unknown'}</p>
                      {income.description && <p className="text-sm text-gray-500">{income.description}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(income.annual_amount || 0)}</p>
                      <p className="text-xs text-gray-500">
                        {income.is_paye ? 'PAYE' : 'Non-PAYE'}
                      </p>
                    </div>
                  </div>
                ))}
                {incomes.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    ... and {incomes.length - 5} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                No income sources found for this tax year.
              </p>
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
              <div className="space-y-2">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">
                        {expense.expense_type ? expense.expense_type.name : 'Unknown'}
                      </p>
                      {expense.description && <p className="text-sm text-gray-500">{expense.description}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(expense.amount || 0)}</p>
                    </div>
                  </div>
                ))}
                {expenses.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    ... and {expenses.length - 5} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                No expenses found for this tax year.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;