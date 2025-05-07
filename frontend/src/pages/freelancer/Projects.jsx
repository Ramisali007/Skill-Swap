import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const FreelancerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      // Make real API call to fetch freelancer projects
      const response = await axios.get(`/api/projects/freelancer/my-projects?_=${timestamp}`);
      console.log('Freelancer projects data:', response.data);

      // Transform the data to match our component's expected format
      const projectsData = response.data.projects.map(project => ({
        id: project._id,
        title: project.title,
        description: project.description,
        category: project.category,
        budget: project.budget,
        deadline: project.deadline,
        status: project.status,
        client: {
          id: project.client._id,
          name: project.client.user ? project.client.user.name : 'Unknown Client'
        },
        createdAt: project.createdAt
      }));

      setProjects(projectsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Set up Socket.io for real-time updates
  useEffect(() => {
    // Create socket connection
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
    socketRef.current = socket;

    // Listen for work submission updates
    socket.on('work_submission', (data) => {
      console.log('Work submission update received:', data);

      // If the update includes a status change to completed
      if (data.projectStatus === 'completed') {
        console.log('Project status changed to completed, refreshing projects list');

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

        // Refresh projects list
        fetchProjects();

        // Set active tab to completed
        setActiveTab('completed');
      }
    });

    // Listen for project status updates
    socket.on('project_update', (data) => {
      console.log('Project update received:', data);
      // Refresh projects list
      fetchProjects();
    });

    // Clean up on unmount
    return () => {
      console.log('Disconnecting socket');
      socket.disconnect();
    };
  }, []);

  // Filter projects based on active tab
  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress') return project.status === 'in_progress';
    if (activeTab === 'completed') return project.status === 'completed';
    if (activeTab === 'bidding') return project.status === 'bidding';
    return true;
  });

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'bidding':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-sm text-indigo-600 font-medium">Loading your projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg overflow-hidden rounded-xl p-8">
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 shadow-md">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-3 mb-4 sm:mb-0">
              <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-0 sm:ml-5 flex-1">
              <h3 className="text-lg font-semibold text-red-800">{error}</h3>
              <p className="mt-2 text-sm text-red-600">
                We encountered an issue while loading your projects. Please try again.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-6 py-6 sm:px-8 bg-gradient-to-r from-indigo-700 to-purple-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl leading-6 font-bold text-white">My Projects</h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Manage your projects and track their progress.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchProjects}
              className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-lg shadow-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
            <Link
              to="/freelancer/browse-projects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Find New Projects
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-indigo-100 bg-white">
          <nav className="flex px-6 sm:px-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                  : 'border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm mr-2 transition-all duration-200 rounded-t-lg`}
            >
              <div className="flex items-center">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                All Projects
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bidding')}
              className={`${
                activeTab === 'bidding'
                  ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                  : 'border-transparent text-gray-600 hover:text-yellow-600 hover:border-yellow-300 hover:bg-yellow-50/30'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm mr-2 transition-all duration-200 rounded-t-lg`}
            >
              <div className="flex items-center">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Bidding
              </div>
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`${
                activeTab === 'in_progress'
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm mr-2 transition-all duration-200 rounded-t-lg`}
            >
              <div className="flex items-center">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                In Progress
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`${
                activeTab === 'completed'
                  ? 'border-green-500 text-green-700 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-300 hover:bg-green-50/30'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg`}
            >
              <div className="flex items-center">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Completed
              </div>
            </button>
          </nav>
        </div>

        {/* Project List */}
        {filteredProjects.length === 0 ? (
          <div className="px-6 py-12 sm:p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
            <p className="mt-2 text-base text-gray-500">
              {activeTab === 'all'
                ? "You haven't been assigned to any projects yet."
                : activeTab === 'bidding'
                  ? "You don't have any projects in the bidding stage."
                  : activeTab === 'in_progress'
                    ? "You don't have any projects in progress."
                    : "You don't have any completed projects."}
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
        ) : (
          <ul className="divide-y divide-indigo-100">
            {filteredProjects.map((project) => (
              <li key={project.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                <div className="px-6 py-5 sm:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <div className="mr-4">
                        {project.status === 'bidding' ? (
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                        ) : project.status === 'in_progress' ? (
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                        ) : project.status === 'completed' ? (
                          <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        ) : (
                          <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-indigo-700 truncate">
                          <Link to={`/freelancer/projects/${project.id}`} className="hover:text-indigo-900 transition-colors duration-150">
                            {project.title}
                          </Link>
                        </h3>
                        <div className="mt-1 flex items-center">
                          <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                            {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 flex items-center">
                            <svg className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {project.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center">
                      <div className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg text-sm font-medium text-green-800 mr-4">
                        ${project.budget}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>
                          Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>
                        Client: <span className="font-medium text-indigo-600">{project.client.name}</span>
                      </span>
                    </div>

                    <div className="mt-3 sm:mt-0 flex justify-end space-x-3">
                      <Link
                        to={`/messages/conversations/new?recipientId=${project.client.id}&projectId=${project.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150"
                      >
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                        </svg>
                        Message Client
                      </Link>
                      <Link
                        to={`/freelancer/projects/${project.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all duration-150"
                      >
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FreelancerProjects;
