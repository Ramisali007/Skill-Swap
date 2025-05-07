import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { ArrowUpIcon, ArrowDownIcon, UsersIcon } from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const UserGrowthChart = ({ data, timeframe, onTimeframeChange }) => {
  const [chartData, setChartData] = useState(null);
  const [growthStats, setGrowthStats] = useState({
    client: { value: 0, trend: 0 },
    freelancer: { value: 0, trend: 0 },
    admin: { value: 0, trend: 0 },
    total: { value: 0, trend: 0 }
  });

  useEffect(() => {
    if (data) {
      // Process data for chart
      const chartConfig = {
        labels: data.userGrowth.labels,
        datasets: [
          {
            label: 'Clients',
            data: data.userGrowth.datasets.client,
            borderColor: 'rgba(99, 102, 241, 1)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Freelancers',
            data: data.userGrowth.datasets.freelancer,
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Admins',
            data: data.userGrowth.datasets.admin,
            borderColor: 'rgba(245, 158, 11, 1)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      };

      setChartData(chartConfig);

      // Calculate growth stats
      const clientGrowth = data.growthRates.client;
      const freelancerGrowth = data.growthRates.freelancer;
      const adminGrowth = data.growthRates.admin;
      
      // Calculate total users
      const totalUsers = 
        data.totalUsers.client + 
        data.totalUsers.freelancer + 
        data.totalUsers.admin;
      
      // Calculate total growth (weighted average)
      const totalGrowth = 
        (clientGrowth * data.totalUsers.client + 
         freelancerGrowth * data.totalUsers.freelancer + 
         adminGrowth * data.totalUsers.admin) / totalUsers;

      setGrowthStats({
        client: { 
          value: data.totalUsers.client, 
          trend: clientGrowth 
        },
        freelancer: { 
          value: data.totalUsers.freelancer, 
          trend: freelancerGrowth 
        },
        admin: { 
          value: data.totalUsers.admin, 
          trend: adminGrowth 
        },
        total: { 
          value: totalUsers, 
          trend: totalGrowth 
        }
      });
    }
  }, [data]);

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
          precision: 0
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const formatGrowth = (value) => {
    return value.toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UsersIcon className="h-5 w-5 mr-2 text-indigo-600" />
            User Growth Analysis
          </h3>
          <div className="flex space-x-2">
            <select
              value={timeframe}
              onChange={(e) => onTimeframeChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-indigo-800">Total Users</p>
              <p className="text-2xl font-bold text-indigo-900">{growthStats.total.value}</p>
            </div>
            <div className={`flex items-center ${growthStats.total.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthStats.total.trend >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{formatGrowth(Math.abs(growthStats.total.trend))}%</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-800">Clients</p>
              <p className="text-2xl font-bold text-blue-900">{growthStats.client.value}</p>
            </div>
            <div className={`flex items-center ${growthStats.client.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthStats.client.trend >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{formatGrowth(Math.abs(growthStats.client.trend))}%</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-green-800">Freelancers</p>
              <p className="text-2xl font-bold text-green-900">{growthStats.freelancer.value}</p>
            </div>
            <div className={`flex items-center ${growthStats.freelancer.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthStats.freelancer.trend >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{formatGrowth(Math.abs(growthStats.freelancer.trend))}%</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-amber-800">Admins</p>
              <p className="text-2xl font-bold text-amber-900">{growthStats.admin.value}</p>
            </div>
            <div className={`flex items-center ${growthStats.admin.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthStats.admin.trend >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{formatGrowth(Math.abs(growthStats.admin.trend))}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-80">
          {chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
      </div>

      {data && data.forecast && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Growth Forecast (Next 3 Periods)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-blue-800 mb-1">Clients</p>
              <div className="flex items-center space-x-2">
                {data.forecast.client.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <span className="text-sm font-semibold text-gray-700">{value}</span>
                    <span className="text-xs text-gray-500">Period {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-green-800 mb-1">Freelancers</p>
              <div className="flex items-center space-x-2">
                {data.forecast.freelancer.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <span className="text-sm font-semibold text-gray-700">{value}</span>
                    <span className="text-xs text-gray-500">Period {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-amber-800 mb-1">Admins</p>
              <div className="flex items-center space-x-2">
                {data.forecast.admin.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <span className="text-sm font-semibold text-gray-700">{value}</span>
                    <span className="text-xs text-gray-500">Period {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGrowthChart;
