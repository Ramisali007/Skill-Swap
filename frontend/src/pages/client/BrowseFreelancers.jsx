import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const BrowseFreelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    keyword: '',
    minHourlyRate: '',
    maxHourlyRate: '',
    minRating: '',
    category: ''
  });
  const [sortBy, setSortBy] = useState('rating');
  const [categories] = useState([
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Digital Marketing',
    'Data Science',
    'Tutoring',
    'Translation',
    'Video Editing'
  ]);
  const [skillOptions] = useState([
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C#', 'PHP',
    'HTML/CSS', 'UI Design', 'UX Research', 'Graphic Design', 'Content Writing',
    'SEO', 'Data Analysis', 'Machine Learning', 'Mobile Development',
    'WordPress', 'Shopify', 'Video Editing', 'Animation', 'Teaching'
  ]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // Fetch freelancers with filters
  const fetchFreelancers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.keyword) {
        params.append('keyword', filters.keyword);
      }

      selectedSkills.forEach(skill => {
        params.append('skills', skill);
      });

      if (filters.minHourlyRate) {
        params.append('minHourlyRate', filters.minHourlyRate);
      }

      if (filters.maxHourlyRate) {
        params.append('maxHourlyRate', filters.maxHourlyRate);
      }

      if (filters.minRating) {
        params.append('minRating', filters.minRating);
      }

      if (filters.category) {
        params.append('category', filters.category);
      }

      // Add sorting
      params.append('sort', sortBy);
      params.append('order', 'desc');

      // Add pagination
      params.append('page', pagination.currentPage);
      params.append('limit', 10);

      // Make API call with full URL
      const url = `http://localhost:5001/api/users/freelancers/search?${params.toString()}`;
      console.log('Fetching freelancers with URL:', url);

      // Use direct axios call instead of api instance
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Freelancers data from API:', data);

      if (data && Array.isArray(data.freelancers)) {
        setFreelancers(data.freelancers);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0
        });
      } else {
        console.warn('API response format is unexpected:', data);
        throw new Error('Invalid response format');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching freelancers:', err);

      // Show specific error message based on the error
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Network error: Cannot connect to the server. Please check if the backend is running.');
      } else if (err.message.includes('HTTP error')) {
        setError(`Server error: ${err.message}. Please try again later.`);
      } else {
        setError('Failed to load freelancers. Please try again later.');
      }

      setLoading(false);
      setFreelancers([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        total: 0
      });
    }
  };

  // Initial fetch on component mount or when filters change
  useEffect(() => {
    fetchFreelancers();
  }, [filters, sortBy, selectedSkills, pagination.currentPage]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset to first page when filters change
    if (pagination.currentPage !== 1) {
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle skill selection
  const handleSkillSelect = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));

      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  };

  // Render star ratings
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        <span className="text-yellow-500">{'★'.repeat(Math.round(rating))}</span>
        <span className="text-gray-300">{'★'.repeat(5 - Math.round(rating))}</span>
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Find the Perfect Tutor</h1>
        <p className="mt-2 text-indigo-100">Browse and filter tutors based on skills, hourly rate, and more.</p>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-indigo-50">
        <div className="px-6 py-6 sm:px-8 border-b border-indigo-100">
          <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
            <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            Filter Tutors
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
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
                  placeholder="Search by name or skill"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-indigo-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-indigo-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Hourly Rate Range */}
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-indigo-700 mb-1">
                Hourly Rate ($)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="minHourlyRate"
                  id="minHourlyRate"
                  value={filters.minHourlyRate}
                  onChange={handleFilterChange}
                  min="0"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-indigo-200 rounded-lg"
                  placeholder="Min"
                />
                <input
                  type="number"
                  name="maxHourlyRate"
                  id="maxHourlyRate"
                  value={filters.maxHourlyRate}
                  onChange={handleFilterChange}
                  min="0"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-indigo-200 rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label htmlFor="minRating" className="block text-sm font-medium text-indigo-700 mb-1">
                Minimum Rating
              </label>
              <select
                id="minRating"
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-indigo-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5 & Up</option>
                <option value="4">4.0 & Up</option>
                <option value="3.5">3.5 & Up</option>
                <option value="3">3.0 & Up</option>
              </select>
            </div>
          </div>

          {/* Skills Filter */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-indigo-700 mb-2">
              Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillSelect(skill)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    selectedSkills.includes(skill)
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                  {selectedSkills.includes(skill) && (
                    <svg className="ml-1.5 h-3 w-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center">
              <label htmlFor="sortBy" className="block text-sm font-medium text-indigo-700 mr-2">
                Sort by:
              </label>
              <select
                id="sortBy"
                name="sortBy"
                value={sortBy}
                onChange={handleSortChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-indigo-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
              >
                <option value="rating">Highest Rating</option>
                <option value="hourlyRate">Lowest Hourly Rate</option>
                <option value="completedProjects">Most Completed Projects</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              Showing {freelancers.length} of {pagination.total} tutors
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-sm text-indigo-600 font-medium">Finding tutors for you...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-md shadow-md">
          <div className="flex flex-col">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error Loading Tutors</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <p className="mt-1 text-sm text-red-600">
                  Please make sure the backend server is running on port 5001 and MongoDB is properly connected.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => fetchFreelancers()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freelancer List */}
      {!loading && !error && (
        <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-indigo-50">
          {freelancers.length === 0 ? (
            <div className="px-6 py-12 sm:p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No tutors found</h3>
              <p className="mt-2 text-base text-gray-500">
                We couldn't find any tutors matching your current filters.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setFilters({
                      keyword: '',
                      minHourlyRate: '',
                      maxHourlyRate: '',
                      minRating: '',
                      category: ''
                    });
                    setSelectedSkills([]);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-indigo-100">
              {freelancers.map((freelancer) => (
                <div key={freelancer.id} className="p-6 hover:bg-indigo-50 transition-colors duration-150">
                  <div className="flex flex-col md:flex-row md:items-start">
                    {/* Profile Image */}
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      <div className="h-24 w-24 rounded-full overflow-hidden bg-indigo-100 border-2 border-indigo-200">
                        {freelancer.profileImage ? (
                          <img
                            src={freelancer.profileImage}
                            alt={freelancer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-500">
                            <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Freelancer Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-indigo-900">
                            <Link to={`/users/${freelancer.userId}`} className="hover:text-indigo-700">
                              {freelancer.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-indigo-600 font-medium mt-0.5">
                            {freelancer.title || 'Tutor'}
                          </p>

                          {/* Rating */}
                          <div className="mt-1">
                            {renderStars(freelancer.averageRating || 0)}
                          </div>
                        </div>

                        <div className="mt-2 md:mt-0 text-right">
                          <p className="text-lg font-bold text-indigo-700">${freelancer.hourlyRate}/hr</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {freelancer.completedProjects} projects completed
                          </p>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {freelancer.bio || 'No bio available.'}
                      </p>

                      {/* Skills */}
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {freelancer.skills && freelancer.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {freelancer.skills && freelancer.skills.length > 5 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{freelancer.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          to={`/users/${freelancer.userId}`}
                          className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Profile
                        </Link>
                        <Link
                          to={`/messages?to=${freelancer.userId}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Contact
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-indigo-100 flex items-center justify-between">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                  pagination.currentPage === 1
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>

              <div className="hidden md:flex">
                {[...Array(pagination.totalPages).keys()].map((page) => (
                  <button
                    key={page + 1}
                    onClick={() => handlePageChange(page + 1)}
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.currentPage === page + 1
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-300 z-10'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } ${page === 0 ? 'rounded-l-md' : ''} ${
                      page === pagination.totalPages - 1 ? 'rounded-r-md' : ''
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
              </div>

              <div className="md:hidden text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                  pagination.currentPage === pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseFreelancers;
