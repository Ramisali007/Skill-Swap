import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import DoughnutChart from '../../components/charts/DoughnutChart';
import DateRangeFilter from '../../components/analytics/DateRangeFilter';
import ExportOptions from '../../components/analytics/ExportOptions';
import { formatCurrency, formatNumber } from '../../utils/exportUtils';

const ClientAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    rangeType: 'last30days'
  });

  // Chart refs for PDF export
  const monthlySpendingChartRef = useRef(null);
  const projectStatusChartRef = useRef(null);
  const categoriesChartRef = useRef(null);

  // Prepare data for export
  const getExportData = () => {
    if (!stats) return [];

    // Monthly spending data
    const monthlySpendingData = stats.monthlySpending.map(item => ({
      Month: item.month,
      Amount: item.amount
    }));

    // Project status data
    const projectStatusData = [
      { Status: 'Active', Count: stats.activeProjects },
      { Status: 'Completed', Count: stats.completedProjects },
      { Status: 'Cancelled', Count: stats.cancelledProjects }
    ];

    // Category data
    const categoryData = stats.topCategories.map(category => ({
      Category: category.name,
      Projects: category.count,
      TotalSpent: category.spent
    }));

    // Combine all data for export
    return [
      ...monthlySpendingData,
      ...projectStatusData,
      ...categoryData
    ];
  };

  // Handle date range change
  const handleDateRangeChange = (startDate, endDate, rangeType) => {
    setDateRange({ startDate, endDate, rangeType });
  };

  // Prepare chart data
  const getMonthlySpendingChartData = () => {
    if (!stats || !stats.monthlySpending) return null;

    return {
      labels: stats.monthlySpending.map(item => item.month),
      datasets: [
        {
          label: 'Monthly Spending',
          data: stats.monthlySpending.map(item => item.amount),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          tension: 0.4
        }
      ]
    };
  };

  const getProjectStatusChartData = () => {
    if (!stats) return null;

    return {
      labels: ['Active', 'Completed', 'Cancelled'],
      datasets: [
        {
          data: [stats.activeProjects, stats.completedProjects, stats.cancelledProjects],
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(79, 70, 229)',
            'rgb(5, 150, 105)',
            'rgb(220, 38, 38)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const getCategoriesChartData = () => {
    if (!stats || !stats.topCategories) return null;

    return {
      labels: stats.topCategories.map(category => category.name),
      datasets: [
        {
          label: 'Projects',
          data: stats.topCategories.map(category => category.count),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgb(79, 70, 229)',
          borderWidth: 1
        },
        {
          label: 'Spending ($)',
          data: stats.topCategories.map(category => category.spent),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgb(5, 150, 105)',
          borderWidth: 1
        }
      ]
    };
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      try {
        // Prepare query parameters for date filtering
        const params = new URLSearchParams();
        if (dateRange.startDate) {
          params.append('startDate', dateRange.startDate.toISOString());
        }
        if (dateRange.endDate) {
          params.append('endDate', dateRange.endDate.toISOString());
        }

        // Make real API call to fetch client analytics with date range
        const response = await axios.get(`/api/analytics/client?${params.toString()}`);
        console.log('Client analytics data:', response.data);

        // Set the real data from the API
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err.response?.data || err.message);
        setLoading(false);
      }
    };

    // Only fetch if we have valid date range
    if (dateRange.startDate && dateRange.endDate) {
      fetchAnalytics();
    }
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white shadow-lg overflow-hidden rounded-xl p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
            <svg className="h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">No data available</h3>
          <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
            We couldn't load your analytics data. Please try again later or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-6 sm:px-8 relative">
          <div className="absolute inset-0 bg-white opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h1 className="text-2xl leading-6 font-bold text-white">Client Analytics</h1>
              </div>
              <ExportOptions
                data={getExportData()}
                title="Client_Analytics"
                headers={['Month', 'Amount', 'Status', 'Count', 'Category', 'Projects', 'TotalSpent']}
                chartRefs={[monthlySpendingChartRef, projectStatusChartRef, categoriesChartRef]}
              />
            </div>
            <p className="mt-2 max-w-2xl text-base text-indigo-100">
              Overview of your project statistics and spending. Track your investments and performance.
            </p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter onFilterChange={handleDateRangeChange} initialRange="last30days" />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
          <div className="px-6 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-indigo-600 truncate">
                    Total Projects
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalProjects}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-2">
            <div className="text-xs text-indigo-600 font-medium">
              All projects posted
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
          <div className="px-6 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-600 truncate">
                    Total Spent
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">
                      ${formatNumber(stats.totalSpent)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 px-6 py-2">
            <div className="text-xs text-green-600 font-medium">
              Total investment
            </div>
          </div>
        </div>

        {/* Average Project Cost */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
          <div className="px-6 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-purple-600 truncate">
                    Average Project Cost
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">
                      ${stats.averageProjectCost}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-2">
            <div className="text-xs text-purple-600 font-medium">
              Per project average
            </div>
          </div>
        </div>

        {/* Average Completion Time */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]">
          <div className="px-6 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-amber-600 truncate">
                    Avg. Completion Time
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.averageCompletionTime} days
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-2">
            <div className="text-xs text-amber-600 font-medium">
              Average delivery time
            </div>
          </div>
        </div>
      </div>

      {/* Project Status */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 sm:px-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-lg leading-6 font-bold text-gray-900">Project Status</h2>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex justify-around">
              <div className="text-center bg-indigo-50 rounded-lg px-6 py-4 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-indigo-100">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-3">
                  <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-indigo-600">{stats.activeProjects}</div>
                <div className="mt-2 text-sm font-medium text-indigo-800">Active</div>
              </div>
              <div className="text-center bg-green-50 rounded-lg px-6 py-4 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-green-100">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-green-600">{stats.completedProjects}</div>
                <div className="mt-2 text-sm font-medium text-green-800">Completed</div>
              </div>
              <div className="text-center bg-red-50 rounded-lg px-6 py-4 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-red-100">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-red-600">{stats.cancelledProjects}</div>
                <div className="mt-2 text-sm font-medium text-red-800">Cancelled</div>
              </div>
            </div>

            {/* Project Status Chart */}
            <div>
              <DoughnutChart
                data={getProjectStatusChartData()}
                height={250}
                ref={projectStatusChartRef}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 sm:px-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h2 className="text-lg leading-6 font-bold text-gray-900">Top Categories</h2>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      Projects
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      Total Spent
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.topCategories.map((category, index) => (
                    <tr key={index} className="hover:bg-indigo-50/30 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-600">{index + 1}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 inline-block">
                          {category.count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600 bg-green-50 rounded-full px-3 py-1 inline-block">
                          ${formatNumber(category.spent)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Categories Chart */}
            <div>
              <BarChart
                data={getCategoriesChartData()}
                height={300}
                title="Projects & Spending by Category"
                ref={categoriesChartRef}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Spending */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 sm:px-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg leading-6 font-bold text-gray-900">Monthly Spending</h2>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Line Chart */}
            <div className="h-80">
              <LineChart
                data={getMonthlySpendingChartData()}
                height={300}
                title="Monthly Spending Trend"
                xAxisLabel="Month"
                yAxisLabel="Amount ($)"
                fill={true}
                ref={monthlySpendingChartRef}
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <span className="inline-block w-3 h-3 bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full mr-2"></span>
                  Monthly spending in USD
                </div>
                <div className="text-sm text-indigo-600 font-medium">
                  Total: ${formatNumber(stats.monthlySpending.reduce((sum, month) => sum + month.amount, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAnalytics;
