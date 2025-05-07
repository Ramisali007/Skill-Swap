import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
    newUsersLastMonth: 0,
    newProjectsLastMonth: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [pendingFreelancers, setPendingFreelancers] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { user } = useAuth();
  const socketRef = useRef(null);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await axios.get(`/api/dashboard/admin?_=${timestamp}`);
      console.log('Dashboard data:', response.data);

      setStats(response.data.stats);
      setRecentUsers(response.data.recentUsers || []);
      setRecentProjects(response.data.recentProjects || []);
      setPendingFreelancers(response.data.pendingFreelancers || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Set up Socket.io for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    // Create socket connection
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
    socketRef.current = socket;

    // Join dashboard room
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join_dashboard', user.id);
    });

    // Listen for dashboard updates
    socket.on('dashboard_data_update', (data) => {
      console.log('Dashboard update received:', data);

      if (data.userId === user.id && data.type === 'admin_dashboard') {
        if (data.data) {
          // Full data update
          if (data.data.stats) {
            setStats(data.data.stats);
          }

          if (data.data.recentUsers) {
            setRecentUsers(data.data.recentUsers);
          }

          if (data.data.recentProjects) {
            setRecentProjects(data.data.recentProjects);
          }

          if (data.data.pendingFreelancers) {
            setPendingFreelancers(data.data.pendingFreelancers);
          }

          setLastUpdated(new Date());
        } else if (data.action) {
          // Action-based update - fetch fresh data
          console.log('Received action update:', data.action);
          fetchDashboardData();
        }
      }
    });

    // Clean up on unmount
    return () => {
      console.log('Disconnecting socket');
      socket.disconnect();
    };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 shadow-md"></div>
        <span className="ml-3 text-indigo-600 font-medium">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 sm:px-8 relative z-10">
          <div className="absolute inset-0 bg-white opacity-5 z-0"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl leading-8 font-bold text-white flex items-center">
                  <ShieldCheckIcon className="h-8 w-8 mr-3 text-indigo-200" />
                  Admin Dashboard
                </h2>
                <p className="mt-2 max-w-2xl text-indigo-100">
                  Welcome back, {user?.name}! Here's your platform overview and management tools.
                </p>
              </div>
              <div className="text-right">
                <button
                  onClick={fetchDashboardData}
                  className="text-indigo-100 hover:text-white focus:outline-none transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh
                </button>
                <p className="text-xs text-indigo-200 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                    {stats.newUsersLastMonth > 0 && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        +{stats.newUsersLastMonth} <span className="sr-only">new this month</span>
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/users" className="font-medium text-indigo-700 hover:text-indigo-800 transition-colors duration-200 flex items-center">
                Manage users
                <ArrowRightIcon className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
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
                    {stats.newProjectsLastMonth > 0 && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        +{stats.newProjectsLastMonth} <span className="sr-only">new this month</span>
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/projects" className="font-medium text-green-700 hover:text-green-800 transition-colors duration-200 flex items-center">
                Manage projects
                <ArrowRightIcon className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-3 shadow-md">
                <ShieldCheckIcon className="h-7 w-7 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Pending Verifications
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-amber-800">
                      {stats.pendingVerifications}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/verify-freelancers" className="font-medium text-amber-700 hover:text-amber-800 transition-colors duration-200 flex items-center">
                Review verifications
                <ArrowRightIcon className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
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
                      ${stats.totalRevenue}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/analytics" className="font-medium text-purple-700 hover:text-purple-800 transition-colors duration-200 flex items-center">
                View analytics
                <ArrowRightIcon className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 to-purple-700">
          <h3 className="text-lg leading-6 font-bold text-white flex items-center">
            <BriefcaseIcon className="h-5 w-5 mr-2" />
            Quick Actions
          </h3>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/admin/verify-freelancers"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Verify Freelancers
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Manage Users
            </Link>
            <Link
              to="/admin/projects"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Manage Projects
            </Link>
            <Link
              to="/admin/platform-analytics"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Platform Analytics
            </Link>
            <Link
              to="/admin/notifications"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <BellIcon className="h-5 w-5 mr-2" />
              Notification Management
            </Link>
            <Link
              to="/admin/analytics"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-50 p-5 shadow-md border border-red-100 animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Users */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 to-indigo-600">
          <h3 className="text-lg leading-6 font-bold text-white flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Recent Users
          </h3>
        </div>
        <div>
          {recentUsers.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {recentUsers.map((user) => (
                <li key={user._id} className="px-6 py-5 hover:bg-indigo-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full">
                        <UserIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-indigo-900">
                          <Link to={`/users/${user._id}`} className="hover:text-indigo-700 hover:underline transition-colors duration-150">
                            {user.name}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {user.email} • <span className="font-medium text-indigo-700">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                        user.isVerified
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <UserIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="text-gray-600 mb-2">No recent users found.</p>
              <Link to="/admin/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150">
                View all users
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 bg-gradient-to-r from-green-700 to-emerald-600">
          <h3 className="text-lg leading-6 font-bold text-white flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Recent Projects
          </h3>
        </div>
        <div>
          {recentProjects.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {recentProjects.map((project) => (
                <li key={project._id} className="px-6 py-5 hover:bg-green-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                        <DocumentTextIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-green-900">
                          <Link to={`/admin/projects/${project._id}`} className="hover:text-green-700 hover:underline transition-colors duration-150">
                            {project.title}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium text-green-700">${project.budget}</span> • Client: {project.client?.user?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                        project.status === 'open' ? 'bg-green-100 text-green-800 border border-green-200' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        project.status === 'completed' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {project.status === 'in_progress' ? 'In Progress' :
                         project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-gray-600 mb-2">No recent projects found.</p>
              <Link to="/admin/projects" className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors duration-150">
                View all projects
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Pending Freelancer Verifications */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 to-amber-500">
          <h3 className="text-lg leading-6 font-bold text-white flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Pending Freelancer Verifications
          </h3>
        </div>
        <div>
          {pendingFreelancers.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {pendingFreelancers.map((freelancer) => (
                <li key={freelancer._id} className="px-6 py-5 hover:bg-amber-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-amber-100 p-2 rounded-full">
                        <ShieldCheckIcon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-amber-900">
                          <Link to={`/admin/verify-freelancers/${freelancer._id}`} className="hover:text-amber-700 hover:underline transition-colors duration-150">
                            {freelancer.user?.name || 'Unknown Freelancer'}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {freelancer.user?.email || 'No email'} • <span className="font-medium text-amber-700">{freelancer.title || 'No title'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <Link
                        to={`/admin/verify-freelancers/${freelancer._id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-amber-600" />
              </div>
              <p className="text-gray-600 mb-2">No pending freelancer verifications.</p>
              <Link to="/admin/verify-freelancers" className="text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors duration-150">
                View all verifications
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
