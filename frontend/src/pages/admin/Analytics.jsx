import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  PresentationChartLineIcon,
  TagIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalProjects: 0,
    newProjects: 0,
    totalEarnings: 0,
    platformFees: 0
  });
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [projectGrowthData, setProjectGrowthData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [timeframe, setTimeframe] = useState('month');

  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);

      try {
        // Make real API call to fetch admin analytics
        const response = await axios.get('/api/analytics/admin');
        console.log('Admin analytics data:', response.data);

        // Set the real data from the API
        setStats(response.data.stats);

        // Set the chart data based on timeframe
        // For now, we'll just use the data from the API
        // In a more complete implementation, we would fetch different timeframes
        setUserGrowthData(response.data.userGrowthData);
        setProjectGrowthData(response.data.projectGrowthData);
        setRevenueData(response.data.revenueData);

        // Process category data to include percentage
        const categoryData = response.data.categoryData.map(category => {
          const totalCount = response.data.categoryData.reduce((sum, cat) => sum + cat.count, 0);
          const percentage = Math.round((category.count / totalCount) * 100);
          return {
            ...category,
            percentage
          };
        });

        setCategoryData(categoryData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err.response?.data || err.message);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeframe]);

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  // Format date based on timeframe
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    if (timeframe === 'week') {
      return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    } else if (timeframe === 'month') {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    } else if (timeframe === 'year') {
      return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    }

    return dateString;
  };

  // Calculate max values for chart scaling
  const maxUserValue = Math.max(
    ...userGrowthData.map(item => Math.max(item.freelancers, item.clients))
  ) * 1.2;

  const maxProjectValue = Math.max(
    ...projectGrowthData.map(item => Math.max(item.posted, item.completed))
  ) * 1.2;

  const maxRevenueValue = Math.max(
    ...revenueData.map(item => item.revenue)
  ) * 1.2;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 shadow-md"></div>
        <span className="mt-4 text-indigo-600 font-medium">Loading analytics data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-6 bg-gradient-to-r from-indigo-700 to-purple-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl leading-6 font-bold text-white flex items-center">
              <PresentationChartLineIcon className="h-6 w-6 mr-2" />
              Platform Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Comprehensive analytics and insights for the platform.
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleTimeframeChange('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                timeframe === 'week'
                  ? 'bg-white text-indigo-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handleTimeframeChange('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                timeframe === 'month'
                  ? 'bg-white text-indigo-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handleTimeframeChange('year')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                timeframe === 'year'
                  ? 'bg-white text-indigo-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>



      {/* Key Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Users */}
        <div className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 shadow-md">
                <UserGroupIcon className="h-7 w-7 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Total Users
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-indigo-800">
                      {stats.totalUsers}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      +{stats.newUsers} <span className="sr-only">new this {timeframe}</span>
                    </div>
                  </dd>
                  <dd className="mt-1">
                    <span className="text-sm text-gray-600">new this {timeframe}</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-5 py-3">
            <div className="text-sm font-medium text-indigo-700">
              User growth trending upward
            </div>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 shadow-md">
                <DocumentTextIcon className="h-7 w-7 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Total Projects
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-emerald-800">
                      {stats.totalProjects}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      +{stats.newProjects} <span className="sr-only">new this {timeframe}</span>
                    </div>
                  </dd>
                  <dd className="mt-1">
                    <span className="text-sm text-gray-600">new this {timeframe}</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3">
            <div className="text-sm font-medium text-green-700">
              Project creation rate increasing
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 shadow-md">
                <CurrencyDollarIcon className="h-7 w-7 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Total Revenue
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-purple-800">
                      ${stats.totalEarnings.toLocaleString()}
                    </div>
                  </dd>
                  <dd className="mt-1">
                    <span className="text-sm text-gray-600">${stats.platformFees.toLocaleString()} platform fees</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-3">
            <div className="text-sm font-medium text-purple-700">
              Revenue growth steady
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <div className="bg-white shadow-lg overflow-hidden rounded-xl">
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 to-indigo-600">
            <h2 className="text-lg leading-6 font-bold text-white flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              User Growth
            </h2>
          </div>
          <div className="px-6 py-6">
            <div className="h-64 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500 font-medium">
                <span>{Math.ceil(maxUserValue)}</span>
                <span>{Math.ceil(maxUserValue * 0.75)}</span>
                <span>{Math.ceil(maxUserValue * 0.5)}</span>
                <span>{Math.ceil(maxUserValue * 0.25)}</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="ml-10 h-full flex items-end">
                {userGrowthData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="w-full flex justify-center space-x-1.5">
                      <div className="relative">
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-indigo-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                          {item.freelancers} freelancers
                        </div>
                        <div
                          className="w-6 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg shadow-md transition-all duration-300 group-hover:from-indigo-500 group-hover:to-indigo-300"
                          style={{
                            height: `${(item.freelancers / maxUserValue) * 100}%`,
                            minHeight: item.freelancers > 0 ? '4px' : '0'
                          }}
                        ></div>
                      </div>
                      <div className="relative">
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                          {item.clients} clients
                        </div>
                        <div
                          className="w-6 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg shadow-md transition-all duration-300 group-hover:from-green-500 group-hover:to-green-300"
                          style={{
                            height: `${(item.clients / maxUserValue) * 100}%`,
                            minHeight: item.clients > 0 ? '4px' : '0'
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs font-medium text-gray-600">{formatDate(item.date)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-sm shadow-sm mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Freelancers</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-green-600 to-green-400 rounded-sm shadow-sm mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Clients</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Growth Chart */}
        <div className="bg-white shadow-lg overflow-hidden rounded-xl">
          <div className="px-6 py-5 bg-gradient-to-r from-green-700 to-emerald-600">
            <h2 className="text-lg leading-6 font-bold text-white flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Project Growth
            </h2>
          </div>
          <div className="px-6 py-6">
            <div className="h-64 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500 font-medium">
                <span>{Math.ceil(maxProjectValue)}</span>
                <span>{Math.ceil(maxProjectValue * 0.75)}</span>
                <span>{Math.ceil(maxProjectValue * 0.5)}</span>
                <span>{Math.ceil(maxProjectValue * 0.25)}</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="ml-10 h-full flex items-end">
                {projectGrowthData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="w-full flex justify-center space-x-1.5">
                      <div className="relative">
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-amber-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                          {item.posted} posted
                        </div>
                        <div
                          className="w-6 bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-lg shadow-md transition-all duration-300 group-hover:from-amber-400 group-hover:to-amber-200"
                          style={{
                            height: `${(item.posted / maxProjectValue) * 100}%`,
                            minHeight: item.posted > 0 ? '4px' : '0'
                          }}
                        ></div>
                      </div>
                      <div className="relative">
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                          {item.completed} completed
                        </div>
                        <div
                          className="w-6 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg shadow-md transition-all duration-300 group-hover:from-green-500 group-hover:to-green-300"
                          style={{
                            height: `${(item.completed / maxProjectValue) * 100}%`,
                            minHeight: item.completed > 0 ? '4px' : '0'
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs font-medium text-gray-600">{formatDate(item.date)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-amber-300 rounded-sm shadow-sm mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Posted</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-green-600 to-green-400 rounded-sm shadow-sm mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 bg-gradient-to-r from-purple-700 to-indigo-600">
          <h2 className="text-lg leading-6 font-bold text-white flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Revenue
          </h2>
        </div>
        <div className="px-6 py-6">
          <div className="h-64 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500 font-medium">
              <span>${Math.ceil(maxRevenueValue).toLocaleString()}</span>
              <span>${Math.ceil(maxRevenueValue * 0.75).toLocaleString()}</span>
              <span>${Math.ceil(maxRevenueValue * 0.5).toLocaleString()}</span>
              <span>${Math.ceil(maxRevenueValue * 0.25).toLocaleString()}</span>
              <span>$0</span>
            </div>

            {/* Chart area */}
            <div className="ml-16 h-full flex items-end">
              {revenueData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-purple-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                      ${item.revenue.toLocaleString()}
                    </div>
                    <div
                      className="w-12 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-lg shadow-md transition-all duration-300 group-hover:from-purple-500 group-hover:to-indigo-300 group-hover:scale-105"
                      style={{
                        height: `${(item.revenue / maxRevenueValue) * 100}%`,
                        minHeight: item.revenue > 0 ? '4px' : '0'
                      }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-600">{formatDate(item.date)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Categories */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 to-purple-700">
          <h2 className="text-lg leading-6 font-bold text-white flex items-center">
            <TagIcon className="h-5 w-5 mr-2" />
            Project Categories
          </h2>
        </div>
        <div className="px-6 py-6">
          <div className="space-y-5">
            {categoryData.map((category, index) => (
              <div key={index} className="hover:bg-indigo-50 p-3 rounded-lg transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-800">{category.name}</span>
                    <span className="ml-2 text-sm text-gray-600">({category.count} projects)</span>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">{category.percentage}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-3 shadow-inner">
                  <div
                    className={`h-3 rounded-full shadow-sm ${
                      index % 5 === 0 ? 'bg-gradient-to-r from-indigo-600 to-indigo-400' :
                      index % 5 === 1 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                      index % 5 === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-300' :
                      index % 5 === 3 ? 'bg-gradient-to-r from-purple-600 to-purple-400' :
                      'bg-gradient-to-r from-red-600 to-red-400'
                    }`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
