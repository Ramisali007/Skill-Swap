import React, { useState, useEffect } from 'react';

const DateRangeFilter = ({ onFilterChange, initialRange = 'last30days' }) => {
  const [selectedRange, setSelectedRange] = useState(initialRange);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);

  // Calculate date ranges
  const getDateRange = (range) => {
    const today = new Date();
    const endDate = new Date(today);
    let startDate = new Date(today);

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(today.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last30days':
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisYear':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case 'lastYear':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  };

  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Handle range selection change
  const handleRangeChange = (e) => {
    const range = e.target.value;
    setSelectedRange(range);
    setShowCustomRange(range === 'custom');
    
    if (range !== 'custom') {
      const { startDate, endDate } = getDateRange(range);
      onFilterChange(startDate, endDate, range);
    }
  };

  // Handle custom date changes
  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      const { startDate, endDate } = getDateRange('custom');
      onFilterChange(startDate, endDate, 'custom');
    }
  };

  // Initialize with default range
  useEffect(() => {
    const { startDate, endDate } = getDateRange(initialRange);
    onFilterChange(startDate, endDate, initialRange);
    
    // Set today's date as default for custom end date
    setCustomEndDate(formatDateForInput(new Date()));
    
    // Set 30 days ago as default for custom start date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    setCustomStartDate(formatDateForInput(thirtyDaysAgo));
  }, [initialRange, onFilterChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            id="dateRange"
            value={selectedRange}
            onChange={handleRangeChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
            <option value="lastYear">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {showCustomRange && (
          <>
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                max={formatDateForInput(new Date())}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>
            <div className="flex-none self-end mb-1">
              <button
                type="button"
                onClick={handleCustomDateChange}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
