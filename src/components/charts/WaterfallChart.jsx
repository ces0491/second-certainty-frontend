// src/components/charts/WaterfallChart.jsx
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { formatCurrency } from '../../utils/formatters';

const WaterfallChart = ({ data, currentTaxYear }) => {
  // Configure Highcharts waterfall chart options
  const getWaterfallChartOptions = () => {
    return {
      chart: {
        type: 'waterfall',
        height: 400,
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'Inter, system-ui, sans-serif'
        }
      },
      title: {
        text: `Financial Summary - ${currentTaxYear}`,
        style: {
          fontSize: '20px',
          fontWeight: '600',
          color: '#1F2937',
        },
      },
      subtitle: {
        text: 'Income flow from gross income to net income',
        style: {
          fontSize: '14px',
          color: '#6B7280',
        },
      },
      xAxis: {
        type: 'category',
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
            return formatCurrency(this.value);
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
        pointFormatter: function() {
          let value = this.y;
          if (this.isSum || this.isIntermediateSum) {
            value = this.total;
          }
          return `<b>${formatCurrency(Math.abs(value))}</b>`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#E5E7EB',
        borderRadius: 8,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          offsetX: 0,
          offsetY: 2,
          opacity: 0.1,
          width: 4
        },
        style: {
          fontSize: '12px'
        }
      },
      plotOptions: {
        waterfall: {
          dataLabels: {
            enabled: true,
            formatter: function() {
              let value = this.y;
              if (this.isSum || this.isIntermediateSum) {
                value = this.total;
              }
              return formatCurrency(Math.abs(value));
            },
            style: {
              fontWeight: '600',
              color: '#374151',
              textOutline: '1px contrast',
              fontSize: '11px',
            },
            verticalAlign: 'top',
            y: -10,
          },
          borderColor: '#FFFFFF',
          borderWidth: 2,
          borderRadius: 4,
        },
      },
      series: [{
        upColor: '#10B981', // Positive values - emerald green
        color: '#EF4444', // Negative values - red  
        data: data,
        pointPadding: 0.1,
        groupPadding: 0.2,
      }],
      credits: {
        enabled: false,
      },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            plotOptions: {
              waterfall: {
                dataLabels: {
                  enabled: false
                }
              }
            }
          }
        }]
      }
    };
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={getWaterfallChartOptions()}
      />
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Understanding Your Financial Flow</h3>
        <p className="text-xs text-gray-600">
          This waterfall chart shows how your gross income flows to your net income after deductions and taxes. 
          Green bars represent positive amounts, red bars represent deductions, and the final blue bar shows your net income.
        </p>
      </div>
    </div>
  );
};

export default WaterfallChart;