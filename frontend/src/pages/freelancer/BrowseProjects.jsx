import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BrowseProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minBudget: '',
    maxBudget: '',
    keyword: ''
  });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('status', 'open');

        if (filters.keyword) {
          params.append('keyword', filters.keyword);
        }

        if (filters.category) {
          params.append('category', filters.category);
        }

        if (filters.minBudget) {
          params.append('minBudget', filters.minBudget);
        }

        if (filters.maxBudget) {
          params.append('maxBudget', filters.maxBudget);
        }

        // Determine sort parameters
        let sort = 'createdAt';
        let order = 'desc';

        switch (sortBy) {
          case 'newest':
            sort = 'createdAt';
            order = 'desc';
            break;
          case 'oldest':
            sort = 'createdAt';
            order = 'asc';
            break;
          case 'budget_high':
            sort = 'budget';
            order = 'desc';
            break;
          case 'budget_low':
            sort = 'budget';
            order = 'asc';
            break;
          case 'deadline':
            sort = 'deadline';
            order = 'asc';
            break;
          default:
            break;
        }

        params.append('sort', sort);
        params.append('order', order);

        // Make API call to get projects
        const response = await axios.get(`/api/projects/search/filter?${params.toString()}`);
        console.log('Projects data from API:', response.data);

        // Get freelancer's bids to check for counter offers
        const myBidsResponse = await axios.get('/api/projects/freelancer/my-bids');
        const myBids = myBidsResponse.data.bids || [];
        console.log('My bids:', myBids);

        // Transform the data to match our component's expected format
        const projectsData = response.data.projects.map(project => {
          // Check if the freelancer has a bid with a counter offer on this project
          // The bid.project might be an object or just the ID string
          const myBid = myBids.find(bid => {
            const bidProjectId = typeof bid.project === 'object' ? bid.project._id : bid.project;
            return bidProjectId === project._id;
          });

          console.log(`Project ${project.title} (${project._id}):`, myBid ?
            `Has bid with counter offer: ${JSON.stringify(myBid.counterOffer)}` :
            'No bid found');

          const hasCounterOffer = myBid && myBid.counterOffer && myBid.counterOffer.status === 'pending';

          return {
            id: project._id,
            title: project.title,
            description: project.description,
            category: project.category,
            budget: project.budget,
            deadline: project.deadline,
            status: project.status,
            client: {
              id: project.client._id,
              name: project.client.user ? project.client.user.name : 'Unknown Client',
              projectsPosted: project.client.projectsPosted || 0
            },
            skills: project.skills || [],
            bids: project.bids ? project.bids.length : 0,
            createdAt: project.createdAt,
            myBid: myBid ? {
              id: myBid._id,
              amount: myBid.amount,
              deliveryTime: myBid.deliveryTime,
              status: myBid.status,
              counterOffer: myBid.counterOffer
            } : null,
            hasCounterOffer
          };
        });

        setProjects(projectsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters, sortBy]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // We're now handling filtering and sorting on the server side
  // This is just a reference to the projects array
  const filteredAndSortedProjects = projects;

  // Get unique categories for filter dropdown
  const categories = [...new Set(projects.map(project => project.category))];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-sm text-indigo-600 font-medium">Finding projects for you...</p>
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
                We encountered an issue while loading available projects. Please try again.
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
        <div className="px-6 py-6 sm:px-8 bg-gradient-to-r from-indigo-700 to-purple-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M47.1,-61.5C59.8,-52.8,68.5,-37.5,72.5,-21.3C76.5,-5.1,75.8,12,69.3,26.5C62.8,41,50.5,52.8,36.3,60.5C22.1,68.2,6,71.8,-10.9,71.1C-27.9,70.4,-45.6,65.3,-57.5,53.7C-69.3,42.1,-75.2,24,-75.8,5.8C-76.4,-12.4,-71.7,-30.7,-60.8,-43.9C-49.9,-57.1,-32.9,-65.2,-15.8,-67.8C1.3,-70.4,18.5,-67.5,34.4,-70.2C50.3,-72.9,64.9,-81.2,47.1,-61.5Z" transform="translate(100 100)" />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl leading-8 font-bold text-white">Browse Projects</h1>
            <p className="mt-2 max-w-2xl text-base text-indigo-100">
              Find projects that match your skills and interests.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-indigo-50">
        <div className="px-6 py-6 sm:px-8 border-b border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
            <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            Filter Projects
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-indigo-700 mb-1">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                </div>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="block w-full pl-10 pr-10 py-2 text-base border-indigo-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Min Budget Filter */}
            <div>
              <label htmlFor="minBudget" className="block text-sm font-medium text-indigo-700 mb-1">
                Min Budget
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-indigo-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="minBudget"
                  id="minBudget"
                  value={filters.minBudget}
                  onChange={handleFilterChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-indigo-200 rounded-lg"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Max Budget Filter */}
            <div>
              <label htmlFor="maxBudget" className="block text-sm font-medium text-indigo-700 mb-1">
                Max Budget
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-indigo-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="maxBudget"
                  id="maxBudget"
                  value={filters.maxBudget}
                  onChange={handleFilterChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-indigo-200 rounded-lg"
                  placeholder="Any"
                  min="0"
                />
              </div>
            </div>

            {/* Keyword Search */}
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium text-indigo-700 mb-1">
                Keyword
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  name="keyword"
                  id="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-indigo-200 rounded-lg"
                  placeholder="Search in title, description, skills..."
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div className="mt-6 flex justify-between items-center border-t border-indigo-100 pt-5">
            <div className="flex-1">
              <p className="text-sm text-indigo-600">
                <span className="font-medium">{filteredAndSortedProjects.length}</span> projects found
              </p>
            </div>
            <div className="flex items-center">
              <label htmlFor="sortBy" className="mr-2 block text-sm font-medium text-indigo-700">
                Sort by:
              </label>
              <div className="relative">
                <select
                  id="sortBy"
                  name="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-indigo-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="budget_high">Budget: High to Low</option>
                  <option value="budget_low">Budget: Low to High</option>
                  <option value="deadline">Deadline: Soonest First</option>
                  <option value="bids_low">Fewest Bids</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project List */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-indigo-50">
        {filteredAndSortedProjects.length === 0 ? (
          <div className="px-6 py-12 sm:p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
            <p className="mt-2 text-base text-gray-500">
              We couldn't find any projects matching your current filters.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setFilters({
                    category: '',
                    minBudget: '',
                    maxBudget: '',
                    keyword: ''
                  });
                  setSortBy('newest');
                }}
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
          <ul className="divide-y divide-indigo-100">
            {filteredAndSortedProjects.map((project) => (
              <li key={project.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                <div className="px-6 py-5 sm:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-indigo-700 truncate">
                          <Link to={`/freelancer/projects/${project.id}`} className="hover:text-indigo-900 transition-colors duration-150">
                            {project.title}
                          </Link>
                        </h3>
                        <div className="mt-1 flex items-center">
                          <span className="text-sm text-gray-500 flex items-center">
                            <svg className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {project.category}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <svg className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            {project.bids} bids
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

                  <div className="mt-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>
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

                    <div className="mt-3 sm:mt-0 flex justify-end">
                      {project.hasCounterOffer && (
                        <div className="mr-3 flex items-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                            </svg>
                            Counter Offer: ${project.myBid?.counterOffer?.amount}
                          </span>
                        </div>
                      )}
                      <Link
                        to={`/freelancer/projects/${project.id}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all duration-150 transform hover:-translate-y-0.5"
                      >
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                        </svg>
                        {project.hasCounterOffer ? 'View Counter Offer' : 'View Details & Bid'}
                      </Link>
                    </div>
                  </div>

                  {project.skills && project.skills.length > 0 && (
                    <div className="mt-4 border-t border-indigo-50 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BrowseProjects;
