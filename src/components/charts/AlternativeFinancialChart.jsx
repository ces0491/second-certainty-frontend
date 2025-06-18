// src/components/charts/AlternativeFinancialChart.jsx
// Alternative to waterfall chart using column chart
import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { formatCurrency } from '../../utils/formatters';

const AlternativeFinancialChart = ({ data, currentTaxYear }) => {
  const chartRef = useRef(null);

  // Safety check for data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-gray-500">No financial data available for chart</p>
      </div>
    );
  }

  // Convert waterfall data to column chart data
  const convertToColumnData = (waterfallData) => {
    try {
      let runningTotal = 0;
      const columnData = [];

      waterfallData.forEach((item, index) => {
        if (item.isSum) {
          // Final sum - show the running total
          columnData.push({
            name: item.name,
            y: runningTotal,
            color: item.color || '#3B82F6',
          });
        } else if (item.y !== undefined) {
          if (item.y > 0) {
            // Positive value - income
            runningTotal += item.y;
            columnData.push({
              name: item.name,
              y: item.y,
              color: item.color || '#10B981',
            });
          } else {
            // Negative value - deduction
            columnData.push({
              name: item.name,
              y: Math.abs(item.y),
              color: item.color || '#EF4444',
            });
            runningTotal += item.y; // item.y is already negative
          }
        }
      });

      return columnData;
    } catch (error) {
      console.error('Error converting to column data:', error);
      return [];
    }
  };

  const columnData = convertToColumnData(data);

  const getChartOptions = () => {
    try {
      return {
        chart: {
          type: 'column',
          height: 400,
          backgroundColor: 'transparent',
          style: {
            fontFamily: 'Inter, system-ui, sans-serif'
          }
        },
        title: {
          text: `Financial Summary - ${currentTaxYear || 'Current Year'}`,
          style: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1F2937',
          },
        },
        subtitle: {
          text: 'Income and expense breakdown',
          style: {
            fontSize: '14px',
            color: '#6B7280',
          },
        },
        xAxis: {
          categories: columnData.map(item => item.name),
          labels: {
            style: {
              color: '#6B7280',
              fontSize: '12px',
            },
          },
          lineColor: '#E5E7EB',
        },
        yAxis: {
          title: {
            text: 'Amount (ZAR)',
            style: {
              color: '#6B7280',
              fontSize: '12px',
            },
          },
          labels: {
            formatter: function() {
              return formatCurrency(this.value || 0);
            },
            style: {
              color: '#6B7280',
              fontSize: '11px',
            },
          },
          gridLineColor: '#F3F4F6',
        },
        legend: {
          enabled: false,
        },
        tooltip: {
          formatter: function() {
            return `<b>${this.x}</b><br/>${formatCurrency(this.y || 0)}`;
          },
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderColor: '#E5E7EB',
          borderRadius: 8,
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              formatter: function() {
                return formatCurrency(this.y || 0);
              },
              style: {
                fontWeight: '600',
                color: '#374151',
                fontSize: '11px',
              },
            },
            borderRadius: 4,
            borderWidth: 0,
          },
        },
        series: [{
          name: 'Amount',
          data: columnData,
          colorByPoint: true,
        }],
        credits: {
          enabled: false,
        },
      };
    } catch (error) {
      console.error('Error creating chart options:', error);
      return null;
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (chartRef.current?.chart) {
        try {
          chartRef.current.chart.destroy();
        } catch (error) {
          console.warn('Error destroying chart:', error);
        }
      }
    };
  }, []);

  const chartOptions = getChartOptions();

  if (!chartOptions) {
    return (
      <div className="h-96 flex items-center justify-center">
        <p className="text-red-500">Error loading chart configuration</p>
      </div>
    );
  }

  try {
    return (
      <div className="alternative-chart-container">
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={chartOptions}
          constructorType={'chart'}
        />
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Financial Summary</h3>
          <p className="text-xs text-gray-600">
            This chart shows your income and expense breakdown. 
            Green bars represent income, red bars represent deductions, and blue represents your net position.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering chart:', error);
    return (
      <div className="h-96 flex items-center justify-center bg-red-50 border border-red-200 rounded">
        <div className="text-center">
          <p className="text-red-600 font-medium">Chart rendering failed</p>
          <p className="text-red-500 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }
};

export default AlternativeFinancialChart;