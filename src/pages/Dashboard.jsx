// src/pages/Dashboard.jsx - Complete version with chart toggle and API monitoring
import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIncome } from '../hooks/useIncome';
import { useExpenses } from '../hooks/useExpenses';
import { useTaxCalc } from '../hooks/useTaxCalc';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import Loading from '../components/common/Loading';

// Configuration - Toggle this to enable/disable charts for debugging
const ENABLE_CHARTS = false; // Set to true once backend issues are resolved
const ENABLE_API_MONITOR = true; // Set to false in production

// Lazy load heavy chart components with error boundaries
const WaterfallChart = lazy(() => 
  import('../components/charts/WaterfallChart').catch(error => {
    console.error('Failed to load WaterfallChart:', error);
    return { default: () => <div className="p-4 text-red-600">Error loading waterfall chart</div> };
  })
);

const PieChartComponent = lazy(() => 
  import('../components/charts/PieChartComponent').catch(error => {
    console.error('Failed to load PieChartComponent:', error);
    return { default: () => <div className="p-4 text-red-600">Error loading pie chart</div> };
  })
);

// API Monitor Component (inline for simplicity)
const ApiMonitor = () => {
  const [apiCalls, setApiCalls] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ENABLE_API_MONITOR) return;

    // Intercept fetch to monitor API calls
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      const startTime = Date.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        
        // Only log API calls to our backend
        if (url.toString().includes('/api/')) {
          setApiCalls(prev => [...prev.slice(-9), {
            id: Date.now(),
            url: url.toString(),
            method: options?.method || 'GET',
            status: response.status,
            duration: endTime - startTime,
            timestamp: new Date().toLocaleTimeString(),
            success: response.ok
          }]);
        }
        
        return response;
      } catch (error) {
        const endTime = Date.now();
        
        if (url.toString().includes('/api/')) {
          setApiCalls(prev => [...prev.slice(-9), {
            id: Date.now(),
            url: url.toString(),
            method: options?.method || 'GET',
            status: 'ERROR',
            duration: endTime - startTime,
            timestamp: new Date().toLocaleTimeString(),
            success: false,
            error: error.message
          }]);
        }
        
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!ENABLE_API_MONITOR) return null;

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm shadow-lg hover:bg-blue-700 z-50"
      >
        📊 API Monitor ({apiCalls.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 max-h-80 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">API Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        {apiCalls.length === 0 ? (
          <p className="text-gray-500 text-sm">No API calls yet</p>
        ) : (
          apiCalls.map(call => (
            <div key={call.id} className={`p-2 rounded text-xs ${
              call.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex justify-between">
                <span className="font-medium">{call.method}</span>
                <span className={call.success ? 'text-green-600' : 'text-red-600'}>
                  {call.status}
                </span>
              </div>
              <div className="text-gray-600 truncate">{call.url.replace(/.*\/api/, '/api')}</div>
              <div className="flex justify-between text-gray-500">
                <span>{call.timestamp}</span>
                <span>{call.duration}ms</span>
              </div>
              {call.error && (
                <div className="text-red-600 mt-1">{call.error}</div>
              )}
            </div>
          ))
        )}
      </div>
      
      <button
        onClick={() => setApiCalls([])}
        className="mt-3 w-full bg-gray-100 text-gray-700 py-1 px-2 rounded text-sm hover:bg-gray-200"
      >
        Clear Log
      </button>
    </div>
  );
};

// Error boundary component for charts
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-64 flex items-center justify-center bg-red-50 border border-red-200 rounded">
          <div className="text-center">
            <p className="text-red-600 font-medium">Chart failed to load</p>
            <p className="text-red-500 text-sm mt-1">
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple data display component as fallback
const SimpleDataDisplay = ({ data, title }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
    {data && data.length > 0 ? (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-gray-700">{item.name}</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(Math.abs(item.value || item.y || 0))}
              {(item.y && item.y < 0) && <span className="text-red-500 ml-1">(deduction)</span>}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">No data available</p>
    )}
  </div>
);

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

  // Local state for better control
  const [dataFetched, setDataFetched] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [chartErrors, setChartErrors] = useState({});
  const [fetchErrors, setFetchErrors] = useState([]);

  // Available tax years for selection
  const TAX_YEARS = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];
  const loading = incomesLoading || expensesLoading || taxLoading;

  // Handle tax year change with complete reset
  const handleTaxYearChange = (e) => {
    console.log('Changing tax year to:', e.target.value);
    setDataFetched(false);
    setShowCharts(false);
    setChartErrors({});
    setFetchErrors([]);
    changeTaxYear(e.target.value);
  };

  // Enhanced data fetching with individual error handling and delays
  useEffect(() => {
    if (!dataFetched && currentUser) {
      const fetchData = async () => {
        console.log('🚀 Starting data fetch sequence for dashboard');
        const errors = [];
        
        try {
          // Fetch incomes with delay
          try {
            console.log('📊 Fetching incomes...');
            await fetchIncomes();
            console.log('✅ Incomes fetched successfully');
            // Small delay to reduce server load
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            console.error('❌ Failed to fetch incomes:', err);
            errors.push(`Incomes: ${err.message}`);
          }

          // Fetch expenses with delay
          try {
            console.log('💰 Fetching expenses...');
            await fetchExpenses();
            console.log('✅ Expenses fetched successfully');
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            console.error('❌ Failed to fetch expenses:', err);
            errors.push(`Expenses: ${err.message}`);
          }

          // Fetch tax calculation with delay
          try {
            console.log('🧮 Fetching tax calculation...');
            await fetchTaxCalculation();
            console.log('✅ Tax calculation fetched successfully');
          } catch (err) {
            console.error('❌ Failed to fetch tax calculation:', err);
            errors.push(`Tax Calculation: ${err.message}`);
          }

          setFetchErrors(errors);
          setDataFetched(true);
          
          // Only enable charts if configured and no critical errors
          if (ENABLE_CHARTS && errors.length === 0) {
            console.log('🎨 Enabling chart rendering in 2 seconds...');
            setTimeout(() => {
              setShowCharts(true);
            }, 2000);
          } else if (ENABLE_CHARTS && errors.length > 0) {
            console.log('⚠️ Charts disabled due to data fetch errors');
          }
          
        } catch (err) {
          console.error('❌ Critical error in data fetch sequence:', err);
          setFetchErrors(['Critical error: ' + err.message]);
          setDataFetched(true);
        }
      };

      fetchData();
    }
  }, [currentTaxYear, currentUser, dataFetched, fetchIncomes, fetchExpenses, fetchTaxCalculation]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (window.Highcharts) {
        window.Highcharts.charts.forEach(chart => {
          if (chart) {
            try {
              chart.destroy();
            } catch (e) {
              console.warn('Error destroying chart:', e);
            }
          }
        });
      }
    };
  }, []);

  // Memoized calculations with error handling
  const calculatedData = useMemo(() => {
    try {
      const totalIncome = incomes.reduce((sum, income) => sum + (Number(income.annual_amount) || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
      const monthlyTax = taxCalculation ? (Number(taxCalculation.final_tax) || 0) / 12 : 0;

      console.log('📊 Calculated data:', { totalIncome, totalExpenses, monthlyTax });

      return {
        totalIncome,
        totalExpenses,
        monthlyTax,
      };
    } catch (error) {
      console.error('❌ Error calculating data:', error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        monthlyTax: 0,
      };
    }
  }, [incomes, expenses, taxCalculation]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Enhanced chart data generation with validation
  const chartData = useMemo(() => {
    if (!ENABLE_CHARTS) return { waterfallData: [], incomeBreakdown: [], expenseBreakdown: [] };

    try {
      console.log('🎨 Generating chart data...');
      
      // Generate waterfall chart data with validation
      const generateWaterfallData = () => {
        if (!taxCalculation) {
          console.log('⚠️ No tax calculation data available for waterfall chart');
          return [];
        }

        try {
          const grossIncome = Number(taxCalculation.gross_income) || 0;
          const taxLiability = Number(taxCalculation.final_tax) || 0;
          const totalExpenses = Number(calculatedData.totalExpenses) || 0;
          
          console.log('🎯 Waterfall chart inputs:', {
            grossIncome,
            totalExpenses,
            taxLiability
          });

          const waterfallData = [];

          // Starting point - Gross Income
          if (grossIncome > 0) {
            waterfallData.push({
              name: 'Gross Income',
              y: grossIncome,
              color: '#10B981',
            });
          }

          // Deductions - Expenses
          if (totalExpenses > 0) {
            waterfallData.push({
              name: 'Deductible Expenses',
              y: -totalExpenses,
              color: '#8B5CF6',
            });
          }

          // Deductions - Tax
          if (taxLiability > 0) {
            waterfallData.push({
              name: 'Tax Liability',
              y: -taxLiability,
              color: '#EF4444',
            });
          }

          // Final sum - Net Income
          if (waterfallData.length > 0) {
            waterfallData.push({
              name: 'Net Income',
              isSum: true,
              color: '#3B82F6',
            });
          }

          console.log('✅ Generated waterfall data:', waterfallData);
          return waterfallData;
          
        } catch (error) {
          console.error('❌ Error generating waterfall data:', error);
          return [];
        }
      };

      // Generate income breakdown data with validation
      const getIncomeBreakdown = () => {
        try {
          if (!incomes || incomes.length === 0) return [];

          return incomes.map((income, index) => ({
            name: income.source_type || 'Unknown',
            value: Number(income.annual_amount) || 0,
            color: COLORS[index % COLORS.length],
          })).filter(item => item.value > 0);
        } catch (error) {
          console.error('❌ Error generating income breakdown:', error);
          return [];
        }
      };

      // Generate expense breakdown data with validation
      const getExpenseBreakdown = () => {
        try {
          if (!expenses || expenses.length === 0) return [];

          const expensesByType = {};
          expenses.forEach((expense) => {
            const typeName = expense.expense_type?.name || 'Other';
            const amount = Number(expense.amount) || 0;
            if (amount > 0) {
              if (!expensesByType[typeName]) {
                expensesByType[typeName] = 0;
              }
              expensesByType[typeName] += amount;
            }
          });

          return Object.entries(expensesByType).map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length],
          }));
        } catch (error) {
          console.error('❌ Error generating expense breakdown:', error);
          return [];
        }
      };

      const result = {
        waterfallData: generateWaterfallData(),
        incomeBreakdown: getIncomeBreakdown(),
        expenseBreakdown: getExpenseBreakdown(),
      };

      console.log('✅ Chart data generated successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error in chartData memoization:', error);
      return {
        waterfallData: [],
        incomeBreakdown: [],
        expenseBreakdown: [],
      };
    }
  }, [taxCalculation, calculatedData.totalExpenses, incomes, expenses]);

  // Show loading state only when actually loading
  if (loading && !dataFetched) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sc-green mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
          <p className="text-gray-500 text-sm mt-2">Tax Year: {currentTaxYear}</p>
        </div>
        <ApiMonitor />
      </div>
    );
  }

  // Show empty state if no data
  if (!taxCalculation && dataFetched && fetchErrors.length === 0) {
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
        <ApiMonitor />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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

      {/* Chart Status Banner */}
      {!ENABLE_CHARTS && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <div>
              <p className="text-yellow-800 font-medium">Charts Temporarily Disabled</p>
              <p className="text-yellow-700 text-sm">
                Charts are disabled for debugging. Set ENABLE_CHARTS = true in Dashboard.jsx to re-enable.
                The app should work normally without charts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fetch Errors Display */}
      {fetchErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-medium mb-2">Data Fetch Issues:</h3>
          {fetchErrors.map((error, index) => (
            <p key={index} className="text-red-700 text-sm">• {error}</p>
          ))}
          <button 
            onClick={() => {
              setDataFetched(false);
              setFetchErrors([]);
            }}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry Data Fetch
          </button>
        </div>
      )}

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

      {/* Charts or Simple Data Display Section */}
      {ENABLE_CHARTS && showCharts ? (
        <div className="space-y-8">
          {/* Financial Summary Waterfall Chart with Error Boundary */}
          <div className="bg-white rounded-lg shadow p-6">
            <ChartErrorBoundary>
              <Suspense fallback={
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sc-green mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading waterfall chart...</p>
                  </div>
                </div>
              }>
                <WaterfallChart 
                  data={chartData.waterfallData} 
                  currentTaxYear={currentTaxYear}
                />
              </Suspense>
            </ChartErrorBoundary>
          </div>

          {/* Pie Charts with Error Boundaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-4">
                Income Sources - {currentTaxYear}
              </h2>
              <ChartErrorBoundary>
                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loading /></div>}>
                  <PieChartComponent 
                    data={chartData.incomeBreakdown}
                    emptyMessage="No income sources for this tax year."
                  />
                </Suspense>
              </ChartErrorBoundary>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-4">
                Expense Breakdown - {currentTaxYear}
              </h2>
              <ChartErrorBoundary>
                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loading /></div>}>
                  <PieChartComponent 
                    data={chartData.expenseBreakdown}
                    emptyMessage="No expenses recorded for this tax year."
                  />
                </Suspense>
              </ChartErrorBoundary>
            </div>
          </div>
        </div>
      ) : (
        /* Simple Data Display as fallback/alternative to charts */
        <div className="space-y-6">
          <SimpleDataDisplay 
            data={chartData.waterfallData} 
            title={`Financial Summary - ${currentTaxYear}`}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleDataDisplay 
              data={chartData.incomeBreakdown} 
              title={`Income Sources - ${currentTaxYear}`}
            />
            <SimpleDataDisplay 
              data={chartData.expenseBreakdown} 
              title={`Expense Breakdown - ${currentTaxYear}`}
            />
          </div>
        </div>
      )}

      {/* Chart Errors Display */}
      {Object.keys(chartErrors).length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="text-yellow-800 font-medium">Chart Loading Issues:</h3>
          {Object.entries(chartErrors).map(([chartType, error]) => (
            <p key={chartType} className="text-yellow-700 text-sm">
              {chartType}: {error}
            </p>
          ))}
          <button 
            onClick={() => {
              setChartErrors({});
              setShowCharts(false);
              setTimeout(() => setShowCharts(true), 1000);
            }}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            Retry Charts
          </button>
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

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Debug Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Charts Enabled:</strong> {ENABLE_CHARTS ? 'Yes' : 'No'}</p>
              <p><strong>Data Fetched:</strong> {dataFetched ? 'Yes' : 'No'}</p>
              <p><strong>Charts Showing:</strong> {showCharts ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p><strong>Incomes:</strong> {incomes.length}</p>
              <p><strong>Expenses:</strong> {expenses.length}</p>
              <p><strong>Tax Data:</strong> {taxCalculation ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Monitor */}
      <ApiMonitor />
    </div>
  );
};

export default Dashboard;