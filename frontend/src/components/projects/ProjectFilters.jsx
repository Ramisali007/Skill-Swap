import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ProjectFilters = ({ filters, onFilterChange, availableTags }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Project categories
  const categories = [
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
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like budget.min
      const [parent, child] = name.split('.');
      setLocalFilters({
        ...localFilters,
        [parent]: {
          ...localFilters[parent],
          [child]: value
        }
      });
    } else {
      setLocalFilters({
        ...localFilters,
        [name]: value
      });
    }
  };

  // Handle date range changes
  const handleDateChange = (date, type) => {
    setLocalFilters({
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [type]: date
      }
    });
  };

  // Handle tag selection
  const handleTagSelect = (tag) => {
    const updatedTags = localFilters.tags.includes(tag)
      ? localFilters.tags.filter(t => t !== tag)
      : [...localFilters.tags, tag];
    
    setLocalFilters({
      ...localFilters,
      tags: updatedTags
    });
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const resetFilters = {
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
    };
    
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="px-6 py-5 sm:px-8">
      {/* Basic Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              name="search"
              value={localFilters.search}
              onChange={handleInputChange}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search projects..."
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            name="status"
            value={localFilters.status}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <select
            name="category"
            value={localFilters.category}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Toggle Advanced Filters */}
        <div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isExpanded ? 'Hide Filters' : 'More Filters'}
            <svg 
              className={`ml-2 h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Budget Range */}
            <div>
              <label htmlFor="budget-min" className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <div className="flex space-x-2">
                <div className="relative rounded-md shadow-sm flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="budget.min"
                    id="budget-min"
                    value={localFilters.budget.min}
                    onChange={handleInputChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Min"
                  />
                </div>
                <div className="relative rounded-md shadow-sm flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="budget.max"
                    id="budget-max"
                    value={localFilters.budget.max}
                    onChange={handleInputChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex space-x-2">
                <DatePicker
                  selected={localFilters.dateRange.start}
                  onChange={(date) => handleDateChange(date, 'start')}
                  selectsStart
                  startDate={localFilters.dateRange.start}
                  endDate={localFilters.dateRange.end}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholderText="Start Date"
                  isClearable
                />
                <DatePicker
                  selected={localFilters.dateRange.end}
                  onChange={(date) => handleDateChange(date, 'end')}
                  selectsEnd
                  startDate={localFilters.dateRange.start}
                  endDate={localFilters.dateRange.end}
                  minDate={localFilters.dateRange.start}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholderText="End Date"
                  isClearable
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagSelect(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      localFilters.tags.includes(tag)
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                    {localFilters.tags.includes(tag) && (
                      <svg className="ml-1.5 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </button>
                ))}
                {availableTags.length === 0 && (
                  <span className="text-sm text-gray-500">No tags available</span>
                )}
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;
