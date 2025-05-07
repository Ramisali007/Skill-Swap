import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

const ClientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    pendingBids: 0,
    totalSpent: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentBids, setRecentBids] = useState([]);
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
      const response = await axios.get(`/api/dashboard/client?_=${timestamp}`);
      console.log('Dashboard data:', response.data);

      setStats(response.data.stats);
      setRecentProjects(response.data.recentProjects || []);
      setRecentBids(response.data.recentBids || []);
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

      if (data.userId === user.id && data.type === 'client_dashboard') {
        if (data.data) {
          // Full data update
          setStats(data.data.stats);
          setRecentProjects(data.data.recentProjects || []);
          setRecentBids(data.data.recentBids || []);
          setLastUpdated(new Date());
        } else if (data.action) {
          // Action-based update - fetch fresh data
          console.log('Received action update:', data.action);

          // If work submission with completed status
          if (data.action === 'work_submission' && data.projectStatus === 'completed') {
            console.log('Project completed via work submission, updating dashboard');

            // Update stats immediately to show the change
            setStats(prevStats => ({
              ...prevStats,
              activeProjects: Math.max(0, prevStats.activeProjects - 1),
              completedProjects: prevStats.completedProjects + 1
            }));

            // Update project status in the recent projects list
            if (data.projectId) {
              setRecentProjects(prevProjects =>
                prevProjects.map(project =>
                  project._id === data.projectId
                    ? {...project, status: 'completed'}
                    : project
                )
              );
            }
          }

          // Fetch fresh data
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
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-sm text-indigo-600 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 sm:px-8 relative z-10">
          <div className="absolute inset-0 bg-white opacity-5 z-0"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl leading-8 font-bold text-white">
                  Welcome back, {user?.name}!
                </h2>
                <p className="mt-2 max-w-2xl text-indigo-100">
                  Here's an overview of your activity on SkillSwap.
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
        {/* Active Projects */}
        <div className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Active Projects
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-indigo-800">
                      {stats.activeProjects}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span className="sr-only">Projects in progress</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/client/projects" className="font-medium text-blue-700 hover:text-blue-800 transition-colors duration-200 flex items-center">
                View all projects
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Completed Projects
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-indigo-800">
                      {stats.completedProjects}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span className="sr-only">Completed successfully</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/client/projects?status=completed" className="font-medium text-green-700 hover:text-green-800 transition-colors duration-200 flex items-center">
                View completed projects
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Bids */}
        <div className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Pending Bids
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-indigo-800">
                      {stats.pendingBids}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-amber-600">
                      <span className="sr-only">Awaiting response</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/client/projects?filter=pending_bids" className="font-medium text-amber-700 hover:text-amber-800 transition-colors duration-200 flex items-center">
                Review bids
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 truncate">
                    Total Spent
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-indigo-800">
                      ${stats.totalSpent}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-purple-600">
                      <span className="sr-only">Budget allocated</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/client/analytics" className="font-medium text-purple-700 hover:text-purple-800 transition-colors duration-200 flex items-center">
                View analytics
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-lg leading-6 font-semibold text-indigo-900">
            Quick Actions
          </h3>
        </div>
        <div className="border-t border-indigo-100 px-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Link
              to="/client/post-project"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Post a New Project
            </Link>
            <Link
              to="/client/browse-freelancers"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Find Tutors
            </Link>
            <Link
              to="/client/project-management"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
              </svg>
              Project Management
            </Link>
            <Link
              to="/client/projects"
              className="inline-flex items-center justify-center px-4 py-3 border border-indigo-200 text-sm font-medium rounded-lg shadow-md text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              My Projects
            </Link>
            <Link
              to="/messages"
              className="inline-flex items-center justify-center px-4 py-3 border border-indigo-200 text-sm font-medium rounded-lg shadow-md text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
              Messages
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-50 p-5 border-l-4 border-red-500 shadow-md animate-fadeIn">
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

      {/* Recent Projects */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg leading-6 font-semibold text-indigo-900">
            Recent Projects
          </h3>
        </div>
        <div className="border-t border-indigo-100">
          {recentProjects.length > 0 ? (
            <ul className="divide-y divide-indigo-100">
              {recentProjects.map((project) => (
                <li key={project._id} className="px-6 py-5 hover:bg-indigo-50/30 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${
                          project.status === 'open' ? 'bg-green-100' :
                          project.status === 'in_progress' ? 'bg-blue-100' :
                          project.status === 'completed' ? 'bg-purple-100' :
                          'bg-red-100'
                        }`}>
                          <svg className={`h-5 w-5 ${
                            project.status === 'open' ? 'text-green-600' :
                            project.status === 'in_progress' ? 'text-blue-600' :
                            project.status === 'completed' ? 'text-purple-600' :
                            'text-red-600'
                          }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-indigo-900">
                          <Link to={`/client/projects/${project._id}`} className="hover:text-indigo-600 transition-colors duration-150">
                            {project.title}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="inline-flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            ${project.budget}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'open' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
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
              <svg className="mx-auto h-12 w-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
              <div className="mt-6">
                <Link to="/client/post-project" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Post Your First Project
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Bids */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-yellow-50">
          <h3 className="text-lg leading-6 font-semibold text-amber-900">
            Recent Bids
          </h3>
        </div>
        <div className="border-t border-amber-100">
          {recentBids.length > 0 ? (
            <ul className="divide-y divide-amber-100">
              {recentBids.map((bid) => (
                <li key={bid._id} className="px-6 py-5 hover:bg-amber-50/30 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${
                          bid.status === 'pending' ? 'bg-amber-100' :
                          bid.status === 'accepted' ? 'bg-green-100' :
                          'bg-red-100'
                        }`}>
                          <svg className={`h-5 w-5 ${
                            bid.status === 'pending' ? 'text-amber-600' :
                            bid.status === 'accepted' ? 'text-green-600' :
                            'text-red-600'
                          }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-amber-900">
                          <Link to={`/client/projects/${bid.project._id}/bids`} className="hover:text-amber-600 transition-colors duration-150">
                            Bid on {bid.project.title}
                          </Link>
                        </p>
                        <div className="flex items-center mt-1 space-x-3 text-sm text-gray-600">
                          <span className="inline-flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            ${bid.amount}
                          </span>
                          <span className="inline-flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {bid.deliveryTime} days
                          </span>
                          <span className="inline-flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            {bid.freelancer?.user?.name || 'Unknown Freelancer'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bid.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bids yet</h3>
              <p className="mt-1 text-sm text-gray-500">No bids have been placed on your projects yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
