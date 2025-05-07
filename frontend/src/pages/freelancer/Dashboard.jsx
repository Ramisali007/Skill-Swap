import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

// Animated 3D sphere component
const AnimatedSphere = () => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere visible args={[1, 100, 200]} scale={1.5}>
      <MeshDistortMaterial
        ref={meshRef}
        color="#6366f1"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
      />
    </Sphere>
  );
};

const FreelancerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    pendingBids: 0,
    totalEarned: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentBids, setRecentBids] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
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
      const response = await axios.get(`/api/dashboard/freelancer?_=${timestamp}`);
      console.log('Dashboard data:', response.data);

      if (response.data) {
        // Set stats with defaults for any missing values
        setStats({
          activeProjects: response.data.stats?.activeProjects || 0,
          completedProjects: response.data.stats?.completedProjects || 0,
          pendingBids: response.data.stats?.pendingBids || 0,
          totalEarned: response.data.stats?.totalEarned || 0
        });

        // Transform recent projects data
        const transformedProjects = (response.data.recentProjects || []).map(project => ({
          id: project._id,
          title: project.title,
          description: project.description,
          budget: project.budget,
          deadline: project.deadline,
          status: project.status,
          client: project.client && project.client.user ? {
            id: project.client._id,
            name: project.client.user.name || 'Unknown Client'
          } : { id: 'unknown', name: 'Unknown Client' },
          createdAt: project.createdAt
        }));

        // Transform recent bids data
        const transformedBids = (response.data.recentBids || []).map(bid => ({
          id: bid._id,
          amount: bid.amount,
          status: bid.status,
          createdAt: bid.createdAt,
          project: bid.project ? {
            id: bid.project._id || bid.project,
            title: bid.project.title || 'Unknown Project',
            budget: bid.project.budget || 0,
            status: bid.project.status || 'unknown'
          } : { id: 'unknown', title: 'Unknown Project', budget: 0, status: 'unknown' }
        }));

        // Transform recent reviews data
        const transformedReviews = (response.data.recentReviews || []).map(review => ({
          id: review._id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          reviewer: review.reviewer ? {
            id: typeof review.reviewer === 'string' ? review.reviewer : review.reviewer._id,
            name: typeof review.reviewer === 'string' ? 'Unknown User' : review.reviewer.name || 'Unknown User'
          } : { id: 'unknown', name: 'Unknown User' },
          project: review.project ? {
            id: typeof review.project === 'string' ? review.project : review.project._id,
            title: typeof review.project === 'string' ? 'Unknown Project' : review.project.title || 'Unknown Project'
          } : { id: 'unknown', title: 'Unknown Project' }
        }));

        setRecentProjects(transformedProjects);
        setRecentBids(transformedBids);
        setRecentReviews(transformedReviews);
        setLastUpdated(new Date());

        console.log('Processed dashboard data:', {
          stats: {
            activeProjects: response.data.stats?.activeProjects || 0,
            completedProjects: response.data.stats?.completedProjects || 0,
            pendingBids: response.data.stats?.pendingBids || 0,
            totalEarned: response.data.stats?.totalEarned || 0
          },
          recentProjectsCount: transformedProjects.length,
          recentBidsCount: transformedBids.length,
          recentReviewsCount: transformedReviews.length
        });

        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
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

      if (data.userId === user.id && data.type === 'freelancer_dashboard') {
        if (data.data) {
          // Full data update
          if (data.data.stats) {
            setStats({
              activeProjects: data.data.stats.activeProjects || 0,
              completedProjects: data.data.stats.completedProjects || 0,
              pendingBids: data.data.stats.pendingBids || 0,
              totalEarned: data.data.stats.totalEarned || 0
            });
          }

          if (data.data.recentProjects) {
            // Transform recent projects data
            const transformedProjects = (data.data.recentProjects || []).map(project => ({
              id: project._id,
              title: project.title,
              description: project.description,
              budget: project.budget,
              deadline: project.deadline,
              status: project.status,
              client: project.client && project.client.user ? {
                id: project.client._id,
                name: project.client.user.name || 'Unknown Client'
              } : { id: 'unknown', name: 'Unknown Client' },
              createdAt: project.createdAt
            }));
            setRecentProjects(transformedProjects);
          }

          if (data.data.recentBids) {
            // Transform recent bids data
            const transformedBids = (data.data.recentBids || []).map(bid => ({
              id: bid._id,
              amount: bid.amount,
              status: bid.status,
              createdAt: bid.createdAt,
              project: bid.project ? {
                id: bid.project._id || bid.project,
                title: bid.project.title || 'Unknown Project',
                budget: bid.project.budget || 0,
                status: bid.project.status || 'unknown'
              } : { id: 'unknown', title: 'Unknown Project', budget: 0, status: 'unknown' }
            }));
            setRecentBids(transformedBids);
          }

          if (data.data.recentReviews) {
            // Transform recent reviews data
            const transformedReviews = (data.data.recentReviews || []).map(review => ({
              id: review._id,
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAt,
              reviewer: review.reviewer ? {
                id: typeof review.reviewer === 'string' ? review.reviewer : review.reviewer._id,
                name: typeof review.reviewer === 'string' ? 'Unknown User' : review.reviewer.name || 'Unknown User'
              } : { id: 'unknown', name: 'Unknown User' },
              project: review.project ? {
                id: typeof review.project === 'string' ? review.project : review.project._id,
                title: typeof review.project === 'string' ? 'Unknown Project' : review.project.title || 'Unknown Project'
              } : { id: 'unknown', title: 'Unknown Project' }
            }));
            setRecentReviews(transformedReviews);
          }

          setLastUpdated(new Date());
        } else if (data.action) {
          // Action-based update - fetch fresh data
          console.log('Received action update:', data.action);

          // If project status changed to completed, refresh dashboard
          if ((data.action === 'project_status_update' && data.status === 'completed') ||
              (data.action === 'work_submission' && data.projectStatus === 'completed')) {
            console.log('Project completed, refreshing dashboard data');

            // Show a completion notification
            const completionMessage = document.createElement('div');
            completionMessage.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fadeIn';
            completionMessage.innerHTML = `
              <div class="flex items-center">
                <svg class="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 class="font-bold">Project Completed!</h3>
                  <p class="text-sm">Your project has been marked as completed and is now visible in your completed projects.</p>
                </div>
              </div>
            `;
            document.body.appendChild(completionMessage);

            // Remove notification after 5 seconds
            setTimeout(() => {
              completionMessage.classList.add('animate-fadeOut');
              setTimeout(() => {
                document.body.removeChild(completionMessage);
              }, 500);
            }, 5000);

            // Update stats immediately to show the change
            setStats(prevStats => ({
              ...prevStats,
              activeProjects: Math.max(0, prevStats.activeProjects - 1),
              completedProjects: prevStats.completedProjects + 1
            }));

            // Then fetch fresh data
            fetchDashboardData();
          } else {
            // For other actions, also refresh to get the latest data
            fetchDashboardData();
          }
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header with 3D Animation */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg overflow-hidden sm:rounded-xl">
        <div className="relative">
          <div className="absolute top-0 right-0 w-40 h-40 opacity-80 z-0">
            <Canvas>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={0.5} />
              <AnimatedSphere />
              <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            </Canvas>
          </div>
          <div className="px-6 py-8 sm:px-8 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl leading-8 font-bold text-white">
                  Welcome back, {user?.name}!
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-indigo-100">
                  Here's an overview of your freelancing activity on SkillSwap.
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
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-indigo-50 transition-all duration-300 hover:shadow-xl hover:border-indigo-100 transform hover:-translate-y-1">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Projects
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-indigo-900">
                      {stats.activeProjects}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4">
            <div className="text-sm">
              <Link to="/freelancer/projects" className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                View all projects <span aria-hidden="true" className="ml-1 transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-green-50 transition-all duration-300 hover:shadow-xl hover:border-green-100 transform hover:-translate-y-1">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Projects
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-green-900">
                      {stats.completedProjects}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4">
            <div className="text-sm">
              <Link to="/freelancer/projects?status=completed" className="font-medium text-green-600 hover:text-green-500 flex items-center">
                View completed projects <span aria-hidden="true" className="ml-1 transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Bids */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-amber-50 transition-all duration-300 hover:shadow-xl hover:border-amber-100 transform hover:-translate-y-1">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Bids
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-amber-900">
                      {stats.pendingBids}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4">
            <div className="text-sm">
              <Link to="/freelancer/my-bids?status=pending" className="font-medium text-amber-600 hover:text-amber-500 flex items-center">
                View my bids <span aria-hidden="true" className="ml-1 transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-purple-50 transition-all duration-300 hover:shadow-xl hover:border-purple-100 transform hover:-translate-y-1">
          <div className="px-5 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 shadow-md">
                <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Earned
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-purple-900">
                      ${stats.totalEarned}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-4">
            <div className="text-sm">
              <Link to="/freelancer/analytics" className="font-medium text-purple-600 hover:text-purple-500 flex items-center">
                View analytics <span aria-hidden="true" className="ml-1 transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-indigo-50">
        <div className="px-6 py-5 sm:px-8">
          <h3 className="text-xl leading-6 font-bold text-indigo-900">
            Quick Actions
          </h3>
        </div>
        <div className="border-t border-indigo-100 px-6 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/freelancer/browse-projects"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Projects
            </Link>
            <Link
              to="/freelancer/my-bids"
              className="inline-flex items-center justify-center px-5 py-3 border border-amber-200 text-base font-medium rounded-lg shadow-sm text-amber-700 bg-white hover:bg-amber-50 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Manage Bids
            </Link>
            <Link
              to="/freelancer/profile"
              className="inline-flex items-center justify-center px-5 py-3 border border-indigo-200 text-base font-medium rounded-lg shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Update Profile
            </Link>
            <Link
              to="/messages"
              className="inline-flex items-center justify-center px-5 py-3 border border-purple-200 text-base font-medium rounded-lg shadow-sm text-purple-700 bg-white hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Messages
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-50 p-5 border border-red-100 shadow-md animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-base font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Projects */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-indigo-50">
        <div className="px-6 py-5 sm:px-8">
          <h3 className="text-xl leading-6 font-bold text-indigo-900">
            Recent Projects
          </h3>
        </div>
        <div className="border-t border-indigo-100">
          {recentProjects.length > 0 ? (
            <ul className="divide-y divide-indigo-50">
              {recentProjects.map((project) => (
                <li key={project._id} className="px-6 py-5 sm:px-8 hover:bg-indigo-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-indigo-100 rounded-lg p-2">
                          <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-base font-semibold text-indigo-900">
                          <Link to={`/freelancer/projects/${project.id}`} className="hover:text-indigo-600 transition-colors duration-150">
                            {project.title}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="inline-flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ${project.budget}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'open' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800' :
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
            <div className="px-6 py-8 sm:px-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">You haven't been assigned to any projects yet.</p>
              <Link to="/freelancer/browse-projects" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Browse Available Projects
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Bids */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-amber-50">
        <div className="px-6 py-5 sm:px-8">
          <h3 className="text-xl leading-6 font-bold text-amber-900">
            Recent Bids
          </h3>
        </div>
        <div className="border-t border-amber-100">
          {recentBids.length > 0 ? (
            <ul className="divide-y divide-amber-50">
              {recentBids.map((bid) => (
                <li key={bid._id} className="px-6 py-5 sm:px-8 hover:bg-amber-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-amber-100 rounded-lg p-2">
                          <svg className="h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-base font-semibold text-amber-900">
                          <Link to={`/freelancer/projects/${bid.project.id}`} className="hover:text-amber-600 transition-colors duration-150">
                            Bid on {bid.project.title}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="inline-flex items-center">
                            <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ${bid.amount}
                          </span>
                          {bid.deliveryTime && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="inline-flex items-center">
                                <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {bid.deliveryTime} days
                              </span>
                            </>
                          )}
                        </p>
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
            <div className="px-6 py-8 sm:px-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">You haven't placed any bids yet.</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Link to="/freelancer/browse-projects" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                  Browse Projects to Bid
                </Link>
                <Link to="/freelancer/my-bids" className="inline-flex items-center justify-center px-5 py-3 border border-amber-200 text-base font-medium rounded-lg shadow-sm text-amber-700 bg-white hover:bg-amber-50 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                  View All My Bids
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-purple-50">
        <div className="px-6 py-5 sm:px-8">
          <h3 className="text-xl leading-6 font-bold text-purple-900">
            Recent Reviews
          </h3>
        </div>
        <div className="border-t border-purple-100">
          {recentReviews.length > 0 ? (
            <ul className="divide-y divide-purple-50">
              {recentReviews.map((review) => (
                <li key={review._id} className="px-6 py-5 sm:px-8 hover:bg-purple-50 transition-colors duration-150">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-purple-100 rounded-lg p-2">
                        <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-semibold text-purple-900">
                        {review.project ? (
                          <Link to={`/freelancer/projects/${review.project.id}`} className="hover:text-purple-600 transition-colors duration-150">
                            Review for {review.project.title}
                          </Link>
                        ) : (
                          "Review"
                        )}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          by {review.reviewer?.name || 'Anonymous'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 italic bg-purple-50 p-3 rounded-lg border border-purple-100">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 sm:px-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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

export default FreelancerDashboard;
