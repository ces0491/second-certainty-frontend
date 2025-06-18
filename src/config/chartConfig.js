// src/config/chartConfig.js
// Central configuration for chart behavior

export const CHART_CONFIG = {
  // Main toggles
  ENABLE_CHARTS: true,                    // Set to false to disable all charts
  USE_ALTERNATIVE_CHART: true,            // Set to true to use column chart instead of waterfall
  ENABLE_API_MONITOR: true,               // Set to false in production
  
  // Debug options
  ENABLE_CHART_LOGGING: true,             // Log chart data and events
  ENABLE_ERROR_BOUNDARIES: true,          // Wrap charts in error boundaries
  CHART_LOAD_DELAY: 2000,                // Delay before loading charts (ms)
  
  // Chart preferences
  CHART_TYPES: {
    WATERFALL: 'waterfall',
    ALTERNATIVE: 'alternative',
    SIMPLE_TABLE: 'table'
  },
  
  // Current chart type selection
  CURRENT_CHART_TYPE: 'alternative',      // Options: 'waterfall', 'alternative', 'table'
  
  // Performance settings
  LAZY_LOAD_CHARTS: true,                 // Use React.lazy for charts
  CHART_UPDATE_THROTTLE: 500,             // Throttle chart updates (ms)
  
  // Colors
  CHART_COLORS: {
    POSITIVE: '#10B981',                  // Green for income/positive
    NEGATIVE: '#EF4444',                  // Red for expenses/negative
    NEUTRAL: '#3B82F6',                   // Blue for totals/neutral
    ACCENT: '#8B5CF6',                    // Purple for highlights
  }
};

// Helper functions
export const isChartsEnabled = () => CHART_CONFIG.ENABLE_CHARTS;
export const shouldUseAlternativeChart = () => CHART_CONFIG.USE_ALTERNATIVE_CHART;
export const isDebugMode = () => process.env.NODE_ENV === 'development';
export const shouldLogChartData = () => CHART_CONFIG.ENABLE_CHART_LOGGING && isDebugMode();

// Chart type selector
export const getChartComponent = () => {
  if (!CHART_CONFIG.ENABLE_CHARTS) return 'none';
  
  switch (CHART_CONFIG.CURRENT_CHART_TYPE) {
    case 'waterfall':
      return 'WaterfallChart';
    case 'alternative':
      return 'AlternativeFinancialChart';
    case 'table':
      return 'SimpleDataDisplay';
    default:
      return 'AlternativeFinancialChart';
  }
};

// Export default configuration
export default CHART_CONFIG;