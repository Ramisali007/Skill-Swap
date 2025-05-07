import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);

      try {
        // Make real API call to fetch projects
        const response = await axios.get('/api/admin/projects');
        console.log('Projects data:', response.data);

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
          freelancer: project.assignedFreelancer ? {
            id: project.assignedFreelancer._id,
            name: project.assignedFreelancer.user ? project.assignedFreelancer.user.name : 'Unknown Freelancer'
          } : null,
          bids: project.bids ? project.bids.length : 0,
          createdAt: project.createdAt
        }));

        setProjects(projectsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err.response?.data || err.message);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(project => {
      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const titleMatch = project.title.toLowerCase().includes(term);
        const descriptionMatch = project.description.toLowerCase().includes(term);
        const clientMatch = project.client.name.toLowerCase().includes(term);

        if (!titleMatch && !descriptionMatch && !clientMatch) {
          return false;
        }
      }

      // Category filter
      if (filterCategory !== 'all' && project.category !== filterCategory) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && project.status !== filterStatus) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'budget_high':
          return b.budget - a.budget;
        case 'budget_low':
          return a.budget - b.budget;
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'bids':
          return b.bids - a.bids;
        default:
          return 0;
      }
    });

  // Handle project selection for bulk actions
  const handleSelectProject = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  // Handle select all projects
  const handleSelectAll = () => {
    if (selectedProjects.length === filteredAndSortedProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredAndSortedProjects.map(project => project.id));
    }
  };

  // Handle bulk action
  const handleBulkAction = () => {
    if (!bulkAction || selectedProjects.length === 0) return;

    // In a real app, this would make an API call
    console.log(`Performing ${bulkAction} on projects:`, selectedProjects);

    // Reset selection and action
    setSelectedProjects([]);
    setBulkAction('');
  };

  // Handle deleting a project
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/projects/${projectId}`);

      // Remove project from state
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));

      alert('Project deleted successfully');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again later.');
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(projects.map(project => project.category))];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 shadow-md"></div>
        <span className="mt-4 text-indigo-600 font-medium">Loading projects data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-6 bg-gradient-to-r from-indigo-700 to-purple-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl leading-6 font-bold text-white flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2" />
              Manage Projects
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              View and manage all projects in the system.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Filter and Search
          </h3>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
            {/* Search */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 flex items-center">
                <MagnifyingGlassIcon className="h-4 w-4 mr-1 text-indigo-600" />
                Search Projects
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pr-10 sm:text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Search by title, description, or client"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1 text-indigo-600" />
                Filter by Category
              </label>
              <select
                id="category"
                name="category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="mt-1.5 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg transition-all duration-200"
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1 text-indigo-600" />
                Filter by Status
              </label>
              <select
                id="status"
                name="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1.5 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg transition-all duration-200"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="transition-all duration-200 hover:shadow-md rounded-lg p-3">
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 flex items-center">
                <ArrowsUpDownIcon className="h-4 w-4 mr-1 text-indigo-600" />
                Sort Results
              </label>
              <select
                id="sortBy"
                name="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1.5 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg transition-all duration-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budget_high">Budget: High to Low</option>
                <option value="budget_low">Budget: Low to High</option>
                <option value="deadline">Deadline: Soonest First</option>
                <option value="bids">Most Bids</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProjects.length > 0 && (
        <div className="bg-white shadow-lg overflow-hidden rounded-xl animate-fadeIn">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <h3 className="text-sm font-semibold text-indigo-800">Bulk Actions</h3>
          </div>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                <span className="text-sm font-semibold">{selectedProjects.length}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {selectedProjects.length} {selectedProjects.length === 1 ? 'project' : 'projects'} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                id="bulkAction"
                name="bulkAction"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm transition-all duration-200"
              >
                <option value="">Select Action</option>
                <option value="approve">Approve Projects</option>
                <option value="cancel">Cancel Projects</option>
                <option value="delete">Delete Projects</option>
              </select>
              <button
                type="button"
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Apply Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        {filteredAndSortedProjects.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-gray-600 mb-2">No projects found matching your filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterStatus('all');
              }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        id="select-all"
                        name="select-all"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={selectedProjects.length === filteredAndSortedProjects.length && filteredAndSortedProjects.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Freelancer
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Budget
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Deadline
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAndSortedProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-indigo-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          id={`select-project-${project.id}`}
                          name={`select-project-${project.id}`}
                          type="checkbox"
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => handleSelectProject(project.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                            <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-indigo-700">
                            <Link to={`/admin/projects/${project.id}`} className="hover:text-indigo-900 hover:underline transition-colors duration-150">
                              {project.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {project.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-indigo-500 mr-1.5" />
                        <span className="text-sm font-medium text-gray-700">{project.client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 text-indigo-500 mr-1.5" />
                        <span className="text-sm font-medium text-gray-700">
                          {project.freelancer ? project.freelancer.name : 'Not assigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1.5" />
                        <span className="text-sm font-semibold text-green-700">${project.budget}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusBadgeColor(project.status)}`}>
                        {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-indigo-500 mr-1.5" />
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={`/admin/projects/${project.id}`}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center transition-colors duration-150"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 hover:text-red-900 flex items-center transition-colors duration-150"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProjects;
