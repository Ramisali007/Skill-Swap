import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  CurrencyDollarIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TransactionAnalyticsChart = ({ data, timeframe, onTimeframeChange, interval, onIntervalChange }) => {
  const [chartData, setChartData] = useState(null);
  const [view, setView] = useState('revenue'); // 'revenue' or 'projects'

  useEffect(() => {
    if (data) {
      // Process data for chart based on view
      const chartConfig = {
        labels: data.transactions.labels,
        datasets: view === 'revenue' ? [
          {
            label: 'Total Budget',
            data: data.transactions.datasets.totalBudget,
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1
          },
          {
            label: 'Completed Budget',
            data: data.transactions.datasets.completedBudget,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }
        ] : [
          {
            label: 'Total Projects',
            data: data.transactions.datasets.projectCount,
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1
          },
          {
            label: 'Completed Projects',
            data: data.transactions.datasets.completedCount,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }
        ]
      };

      setChartData(chartConfig);
    }
  }, [data, view]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(tooltipItems) {
            return `Period: ${tooltipItems[0].label}`;
          },
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (view === 'revenue') {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            } else {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            if (view === 'revenue') {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumSignificantDigits: 3
              }).format(value);
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return value.toFixed(1) + '%';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Transaction Analytics
          </h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setView('revenue')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  view === 'revenue'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setView('projects')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  view === 'projects'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Projects
              </button>
            </div>
            <div className="flex space-x-2">
              <select
                value={interval}
                onChange={(e) => onIntervalChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
              <select
                value={timeframe}
                onChange={(e) => onTimeframeChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              >
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-indigo-800">Total Revenue</p>
              <p className="text-2xl font-bold text-indigo-900">{formatCurrency(data?.totals.totalBudget || 0)}</p>
            </div>
            <div className="flex items-center text-green-600">
              <ArrowUpIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                {formatPercentage(data?.revenueForecast?.[0] ? 
                  ((data.revenueForecast[0] - (data?.transactions.datasets.totalBudget?.slice(-1)[0] || 0)) / 
                  (data?.transactions.datasets.totalBudget?.slice(-1)[0] || 1)) * 100 : 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-green-800">Completed Revenue</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(data?.totals.completedBudget || 0)}</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600">
                {formatPercentage(data?.totals.totalBudget ? 
                  (data.totals.completedBudget / data.totals.totalBudget) * 100 : 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Projects</p>
              <p className="text-2xl font-bold text-blue-900">{data?.totals.projectCount || 0}</p>
            </div>
            <div className="flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-1 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-amber-800">Completion Rate</p>
              <p className="text-2xl font-bold text-amber-900">{formatPercentage(data?.completionRate || 0)}</p>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-1 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Avg. Duration: {Math.round(data?.avgProjectDuration || 0)} days
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="h-80">
          {chartData ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
      </div>

      {data && data.revenueForecast && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue Forecast (Next 3 Periods)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.revenueForecast.map((value, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Period {index + 1}</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(value)}</p>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionAnalyticsChart;
