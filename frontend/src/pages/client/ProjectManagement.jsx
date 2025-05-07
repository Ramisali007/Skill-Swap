import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProjectKanbanBoard from '../../components/projects/ProjectKanbanBoard';
import ProjectListView from '../../components/projects/ProjectListView';
import ProjectGridView from '../../components/projects/ProjectGridView';
import ProjectFilters from '../../components/projects/ProjectFilters';
import ProjectStats from '../../components/projects/ProjectStats';
import ProjectTimeline from '../../components/projects/ProjectTimeline';

const ClientProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'kanban'
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: '',
    tags: [],
    dateRange: {
      start: null,
      end: null
    },
    budget: {
      min: '',
      max: ''
    }
  });
  const [sortBy, setSortBy] = useState('newest');
  const [projectTags, setProjectTags] = useState([]);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalBudget: 0,
    avgBudget: 0
  });

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }

      if (filters.search) {
        params.append('search', filters.search);
      }

      if (filters.category !== 'all') {
        params.append('category', filters.category);
      }

      if (filters.budget.min) {
        params.append('minBudget', filters.budget.min);
      }

      if (filters.budget.max) {
        params.append('maxBudget', filters.budget.max);
      }

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      params.append('_', timestamp);

      // Make API call to fetch client projects
      const response = await axios.get(`/api/projects/client/my-projects?${params.toString()}`);
      console.log('Client projects data:', response.data);

      // Transform the data to match our component's expected format
      const projectsData = response.data.projects.map(project => ({
        id: project._id,
        title: project.title,
        description: project.description,
        category: project.category,
        budget: project.budget,
        deadline: project.deadline,
        status: project.status,
        bids: project.bids ? project.bids.length : 0,
        assignedFreelancer: project.assignedFreelancer ? {
          id: project.assignedFreelancer._id,
          name: project.assignedFreelancer.user ? project.assignedFreelancer.user.name : 'Unknown'
        } : null,
        createdAt: project.createdAt,
        tags: project.tags || [],
        progress: project.progress || 0,
        milestones: project.milestones || []
      }));

      setProjects(projectsData);

      // Extract all unique tags from projects
      const allTags = [...new Set(projectsData.flatMap(project => project.tags || []))];
      setProjectTags(allTags);

      // Calculate project statistics
      calculateProjectStats(projectsData);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
      setLoading(false);
    }
  };

  // Calculate project statistics
  const calculateProjectStats = (projectsData) => {
    const stats = {
      total: projectsData.length,
      open: projectsData.filter(p => p.status === 'open').length,
      inProgress: projectsData.filter(p => p.status === 'in_progress').length,
      completed: projectsData.filter(p => p.status === 'completed').length,
      cancelled: projectsData.filter(p => p.status === 'cancelled').length,
      totalBudget: projectsData.reduce((sum, p) => sum + p.budget, 0),
      avgBudget: projectsData.length > 0
        ? projectsData.reduce((sum, p) => sum + p.budget, 0) / projectsData.length
        : 0
    };

    setProjectStats(stats);
  };

  // Handle project status update
  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      await axios.put(`/api/projects/${projectId}/status`, { status: newStatus });

      // Update local state
      setProjects(projects.map(project =>
        project.id === projectId
          ? { ...project, status: newStatus }
          : project
      ));

      // Recalculate stats
      calculateProjectStats(projects.map(project =>
        project.id === projectId
          ? { ...project, status: newStatus }
          : project
      ));
    } catch (err) {
      console.error('Error updating project status:', err);
      alert('Failed to update project status. Please try again.');
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Handle tag management
  const handleAddTag = async (projectId, tag) => {
    try {
      await axios.post(`/api/projects/${projectId}/tags`, { tag });

      // Update local state
      setProjects(projects.map(project =>
        project.id === projectId
          ? { ...project, tags: [...(project.tags || []), tag] }
          : project
      ));

      // Update tag list if it's a new tag
      if (!projectTags.includes(tag)) {
        setProjectTags([...projectTags, tag]);
      }
    } catch (err) {
      console.error('Error adding tag:', err);
      alert('Failed to add tag. Please try again.');
    }
  };

  const handleRemoveTag = async (projectId, tag) => {
    try {
      await axios.delete(`/api/projects/${projectId}/tags/${tag}`);

      // Update local state
      setProjects(projects.map(project =>
        project.id === projectId
          ? { ...project, tags: (project.tags || []).filter(t => t !== tag) }
          : project
      ));
    } catch (err) {
      console.error('Error removing tag:', err);
      alert('Failed to remove tag. Please try again.');
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProjects();
  }, [filters, sortBy]);

  // Sort projects
  const sortedProjects = [...projects].sort((a, b) => {
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
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-sm text-indigo-600 font-medium">Loading your projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-6 py-6 sm:px-8 bg-gradient-to-r from-indigo-700 to-purple-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl leading-6 font-bold text-white">Project Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Organize, track, and manage all your projects in one place.
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
              to="/client/post-project"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Post New Project
            </Link>
          </div>
        </div>
      </div>

      {/* Project Statistics */}
      <ProjectStats stats={projectStats} />

      {/* Filters and View Controls */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-6 py-5 sm:px-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-medium text-gray-900 mb-4 md:mb-0">Project Filters</h2>
            <div className="flex flex-wrap gap-3">
              {/* View Mode Toggles */}
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => handleViewModeChange('list')}
                  className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
                    viewMode === 'list'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 z-10'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                >
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                  </svg>
                  List
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange('grid')}
                  className={`relative inline-flex items-center px-3 py-2 border ${
                    viewMode === 'grid'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 z-10'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                >
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange('kanban')}
                  className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${
                    viewMode === 'kanban'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 z-10'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                >
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                  </svg>
                  Kanban
                </button>
              </div>

              {/* Sort Dropdown */}
              <div>
                <select
                  id="sort-by"
                  name="sort-by"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="budget_high">Highest Budget</option>
                  <option value="budget_low">Lowest Budget</option>
                  <option value="deadline">Closest Deadline</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Project Filters */}
        <ProjectFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          availableTags={projectTags}
        />
      </div>

      {/* Error Message */}
      {error && (
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
                    onClick={fetchProjects}
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
      )}

      {/* Project Views */}
      {!error && (
        <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
          {sortedProjects.length === 0 ? (
            <div className="px-6 py-12 sm:p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
              <p className="mt-2 text-base text-gray-500">
                No projects match your current filters. Try adjusting your search criteria.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => handleFilterChange({
                    status: 'all',
                    category: 'all',
                    search: '',
                    tags: [],
                    dateRange: { start: null, end: null },
                    budget: { min: '', max: '' }
                  })}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'list' && (
                <ProjectListView
                  projects={sortedProjects}
                  onStatusUpdate={handleStatusUpdate}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                  availableTags={projectTags}
                />
              )}

              {viewMode === 'grid' && (
                <ProjectGridView
                  projects={sortedProjects}
                  onStatusUpdate={handleStatusUpdate}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                  availableTags={projectTags}
                />
              )}

              {viewMode === 'kanban' && (
                <DndProvider backend={HTML5Backend}>
                  <ProjectKanbanBoard
                    projects={sortedProjects}
                    onStatusUpdate={handleStatusUpdate}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    availableTags={projectTags}
                  />
                </DndProvider>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientProjectManagement;
