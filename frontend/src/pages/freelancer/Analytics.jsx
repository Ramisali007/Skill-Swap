import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FreelancerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      try {
        // Make real API call to fetch freelancer analytics
        const response = await axios.get('/api/analytics/freelancer');
        console.log('Freelancer analytics data:', response.data);

        // Set the real data from the API
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err.response?.data || err.message);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-sm text-indigo-600 font-medium">Loading your analytics data...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No data available</h3>
          <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
            We couldn't load your analytics data. This might be because you haven't completed any projects yet.
          </p>
          <div className="mt-6">
            <Link
              to="/freelancer/browse-projects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Browse Available Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-6 py-6 sm:px-8 bg-gradient-to-r from-indigo-700 to-purple-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M47.1,-61.5C59.8,-52.8,68.5,-37.5,72.5,-21.3C76.5,-5.1,75.8,12,69.3,26.5C62.8,41,50.5,52.8,36.3,60.5C22.1,68.2,6,71.8,-10.9,71.1C-27.9,70.4,-45.6,65.3,-57.5,53.7C-69.3,42.1,-75.2,24,-75.8,5.8C-76.4,-12.4,-71.7,-30.7,-60.8,-43.9C-49.9,-57.1,-32.9,-65.2,-15.8,-67.8C1.3,-70.4,18.5,-67.5,34.4,-70.2C50.3,-72.9,64.9,-81.2,47.1,-61.5Z" transform="translate(100 100)" />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl leading-8 font-bold text-white">Freelancer Analytics</h1>
            <p className="mt-2 max-w-2xl text-base text-indigo-100">
              Overview of your performance and earnings.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Earnings */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-green-50 transition-all duration-300 hover:shadow-xl hover:border-green-100 transform hover:-translate-y-1">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Total Earnings
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-green-900">
                      ${stats.totalEarnings}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4">
            <div className="text-sm">
              <span className="font-medium text-green-600 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Lifetime earnings
              </span>
            </div>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-indigo-50 transition-all duration-300 hover:shadow-xl hover:border-indigo-100 transform hover:-translate-y-1">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Completed Projects
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-indigo-900">
                      {stats.completedProjects}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-5 py-4">
            <div className="text-sm">
              <span className="font-medium text-indigo-600 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Successfully delivered
              </span>
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-amber-50 transition-all duration-300 hover:shadow-xl hover:border-amber-100 transform hover:-translate-y-1">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Average Rating
                  </dt>
                  <dd className="flex items-center">
                    <div className="text-2xl font-bold text-amber-900 mr-2">
                      {stats.averageRating}
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(stats.averageRating) ? 'text-amber-400' : 'text-gray-300'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4">
            <div className="text-sm">
              <span className="font-medium text-amber-600 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                {stats.reviewCount} reviews
              </span>
            </div>
          </div>
        </div>

        {/* Bid Success Rate */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-purple-50 transition-all duration-300 hover:shadow-xl hover:border-purple-100 transform hover:-translate-y-1">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Bid Success Rate
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-purple-900">
                      {stats.bidSuccessRate}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 px-5 py-4">
            <div className="text-sm">
              <span className="font-medium text-purple-600 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bids accepted rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Status */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-indigo-50">
        <div className="px-6 py-5 sm:px-8 border-b border-indigo-100">
          <h2 className="text-xl leading-6 font-bold text-indigo-900 flex items-center">
            <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Project Status
          </h2>
        </div>
        <div className="px-6 py-8 sm:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-indigo-50 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-md">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="text-3xl font-bold text-indigo-700">{stats.activeProjects}</div>
              <div className="mt-2 text-sm font-medium text-indigo-600">Active Projects</div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-md">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="text-3xl font-bold text-green-700">{stats.completedProjects}</div>
              <div className="mt-2 text-sm font-medium text-green-600">Completed Projects</div>
            </div>

            <div className="bg-amber-50 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-md">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="text-3xl font-bold text-amber-700">${stats.pendingEarnings}</div>
              <div className="mt-2 text-sm font-medium text-amber-600">Pending Earnings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-indigo-50">
        <div className="px-6 py-5 sm:px-8 border-b border-indigo-100">
          <h2 className="text-xl leading-6 font-bold text-indigo-900 flex items-center">
            <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
            Top Categories
          </h2>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-indigo-100 rounded-lg overflow-hidden">
              <thead className="bg-indigo-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    Projects
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-indigo-50">
                {stats.topCategories.map((category, index) => {
                  // Calculate a performance score (just for UI purposes)
                  const totalEarnings = stats.topCategories.reduce((sum, cat) => sum + cat.earnings, 0);
                  const earningsPercentage = totalEarnings > 0 ? (category.earnings / totalEarnings) * 100 : 0;
                  const performanceColor =
                    earningsPercentage > 50 ? 'bg-green-500' :
                    earningsPercentage > 25 ? 'bg-blue-500' :
                    earningsPercentage > 10 ? 'bg-amber-500' : 'bg-purple-500';

                  return (
                    <tr key={index} className="hover:bg-indigo-50/30 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-medium">{category.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{category.count}</div>
                        <div className="text-xs text-gray-500">projects</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">${category.earnings}</div>
                        <div className="text-xs text-gray-500">total earned</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`${performanceColor} h-2.5 rounded-full`} style={{ width: `${Math.min(earningsPercentage, 100)}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{Math.round(earningsPercentage)}% of earnings</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Earnings */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-indigo-50">
        <div className="px-6 py-5 sm:px-8 border-b border-indigo-100">
          <h2 className="text-xl leading-6 font-bold text-indigo-900 flex items-center">
            <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Monthly Earnings
          </h2>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <div className="h-80">
            <div className="h-full flex items-end">
              {stats.monthlyEarnings.map((month, index) => {
                const maxAmount = Math.max(...stats.monthlyEarnings.map(m => m.amount));
                const percentage = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;

                // Generate a gradient color based on the amount
                const colorClass =
                  percentage > 75 ? 'from-green-500 to-green-600' :
                  percentage > 50 ? 'from-indigo-500 to-indigo-600' :
                  percentage > 25 ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600';

                return (
                  <div key={index} className="w-1/12 mx-auto flex flex-col items-center group">
                    <div className="relative w-full">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                        ${month.amount}
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full bg-gradient-to-b ${colorClass} rounded-t-lg shadow-md transition-all duration-300 group-hover:scale-105`}
                        style={{
                          height: `${Math.max(percentage, 5)}%`,
                          minHeight: '10px'
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs font-medium text-gray-600">{month.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-8">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">High</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Medium</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Low</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Very Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-amber-50">
        <div className="px-6 py-5 sm:px-8 border-b border-amber-100">
          <h2 className="text-xl leading-6 font-bold text-amber-900 flex items-center">
            <svg className="h-5 w-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Recent Reviews
          </h2>
        </div>
        <div>
          <ul className="divide-y divide-amber-50">
            {stats.recentReviews.map((review) => (
              <li key={review.id} className="px-6 py-5 sm:px-8 hover:bg-amber-50/30 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-sm border border-amber-50">
                        <span className="text-amber-700 font-semibold text-lg">{review.client.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">{review.client}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${i < Math.floor(review.rating) ? 'text-amber-400' : 'text-gray-200'}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-amber-700">{review.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-3 ml-16 bg-amber-50 p-4 rounded-lg border border-amber-100 italic text-gray-700">
                  "{review.comment}"
                </div>
              </li>
            ))}
          </ul>

          {stats.recentReviews.length === 0 && (
            <div className="px-6 py-8 sm:px-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">You haven't received any reviews yet.</p>
              <p className="text-sm text-gray-500">Complete projects to get reviews from clients.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerAnalytics;
