import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const FreelancerBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bidStats, setBidStats] = useState({
    totalBids: 0,
    acceptedBids: 0,
    pendingBids: 0,
    rejectedBids: 0,
    withdrawnBids: 0,
    averageBidAmount: 0,
    successRate: 0
  });
  const socketRef = useRef(null);

  const fetchBids = async (pageNum = 1, status = null) => {
    setLoading(true);
    setError(null);

    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', 10);
      if (status && status !== 'all') {
        params.append('status', status);
      }

      // Make API call to fetch freelancer bids
      const response = await axios.get(`/api/projects/freelancer/my-bids?${params.toString()}&_=${timestamp}`);
      console.log('Freelancer bids data:', response.data);

      // Transform the data to match our component's expected format
      const bidsData = response.data.bids.map(bid => ({
        id: bid._id,
        amount: bid.amount,
        deliveryTime: bid.deliveryTime,
        proposal: bid.proposal,
        status: bid.status,
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt,
        counterOffer: bid.counterOffer,
        project: {
          id: typeof bid.project === 'object' ? bid.project._id : bid.project,
          title: typeof bid.project === 'object' ? bid.project.title : 'Unknown Project',
          budget: typeof bid.project === 'object' ? bid.project.budget : 0,
          deadline: typeof bid.project === 'object' ? bid.project.deadline : null,
          status: typeof bid.project === 'object' ? bid.project.status : 'unknown',
          client: {
            id: typeof bid.project === 'object' && bid.project.client ?
              (typeof bid.project.client === 'object' ? bid.project.client._id : bid.project.client) :
              'unknown',
            name: typeof bid.project === 'object' && bid.project.client &&
              typeof bid.project.client === 'object' && bid.project.client.user ?
              bid.project.client.user.name : 'Unknown Client'
          }
        }
      }));

      setBids(bidsData);
      setPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError('Failed to load bids. Please try again later.');
      setLoading(false);
    }
  };

  const fetchBidStats = async () => {
    try {
      const response = await axios.get('/api/projects/stats/bid-analytics');
      console.log('Bid statistics:', response.data);

      setBidStats({
        totalBids: response.data.totalBids || 0,
        acceptedBids: response.data.acceptedBids || 0,
        pendingBids: response.data.pendingBids || 0,
        rejectedBids: response.data.rejectedBids || 0,
        withdrawnBids: response.data.withdrawnBids || 0,
        averageBidAmount: response.data.averageBidAmount || 0,
        successRate: response.data.successRate || 0
      });
    } catch (err) {
      console.error('Error fetching bid statistics:', err);
    }
  };

  useEffect(() => {
    fetchBids(page, activeTab);
    fetchBidStats();
  }, [page, activeTab]);

  // Set up Socket.io for real-time updates
  useEffect(() => {
    // Create socket connection
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
    socketRef.current = socket;

    // Listen for bid updates
    socket.on('bid_update', (data) => {
      console.log('Bid update received:', data);

      // Refresh bids list
      fetchBids(page, activeTab);
      fetchBidStats();
    });

    // Clean up on unmount
    return () => {
      console.log('Disconnecting socket');
      socket.disconnect();
    };
  }, [page, activeTab]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when changing tabs
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle withdraw bid
  const handleWithdrawBid = async (bidId, projectId) => {
    if (!window.confirm('Are you sure you want to withdraw this bid? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/projects/${projectId}/bids/${bidId}`);

      // Show success message
      alert('Bid withdrawn successfully');

      // Refresh bids list
      fetchBids(page, activeTab);
      fetchBidStats();
    } catch (err) {
      console.error('Error withdrawing bid:', err);
      alert('Failed to withdraw bid. Please try again later.');
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sort bids
  const sortedBids = [...bids].sort((a, b) => {
    const [field, order] = sortBy.split('_');

    if (field === 'amount') {
      return order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else if (field === 'deliveryTime') {
      return order === 'asc' ? a.deliveryTime - b.deliveryTime : b.deliveryTime - a.deliveryTime;
    } else if (field === 'createdAt') {
      return order === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }

    return 0;
  });

  if (loading && bids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-sm text-indigo-600 font-medium">Loading your bids...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-6 py-6 sm:px-8 bg-gradient-to-r from-indigo-700 to-purple-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl leading-6 font-bold text-white">My Bids</h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Manage your bids and track their status.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                fetchBids(page, activeTab);
                fetchBidStats();
              }}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Place New Bids
            </Link>
          </div>
        </div>

        {/* Bid Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white border-b border-gray-200">
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-indigo-600">Success Rate</div>
            <div className="mt-1 text-2xl font-semibold text-indigo-900">{bidStats.successRate.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-indigo-700">{bidStats.acceptedBids} of {bidStats.totalBids} bids accepted</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-green-600">Average Bid Amount</div>
            <div className="mt-1 text-2xl font-semibold text-green-900">${bidStats.averageBidAmount.toFixed(2)}</div>
            <div className="mt-1 text-xs text-green-700">Across {bidStats.totalBids} bids</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-yellow-600">Pending Bids</div>
            <div className="mt-1 text-2xl font-semibold text-yellow-900">{bidStats.pendingBids}</div>
            <div className="mt-1 text-xs text-yellow-700">Awaiting client response</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-purple-600">Total Bids</div>
            <div className="mt-1 text-2xl font-semibold text-purple-900">{bidStats.totalBids}</div>
            <div className="mt-1 text-xs text-purple-700">
              {bidStats.acceptedBids} accepted, {bidStats.rejectedBids} rejected, {bidStats.withdrawnBids} withdrawn
            </div>
          </div>
        </div>

        {/* Tabs and Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex space-x-4 mb-4 sm:mb-0">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                activeTab === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              All Bids
            </button>
            <button
              onClick={() => handleTabChange('pending')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                activeTab === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleTabChange('accepted')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                activeTab === 'accepted'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              Accepted
            </button>
            <button
              onClick={() => handleTabChange('rejected')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                activeTab === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              Rejected
            </button>
          </div>
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={handleSortChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
              <option value="deliveryTime_asc">Shortest Delivery</option>
              <option value="deliveryTime_desc">Longest Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bid List */}
      {error ? (
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
                  We encountered an issue while loading your bids. Please try again.
                </p>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      fetchBids(page, activeTab);
                      fetchBidStats();
                    }}
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
      ) : sortedBids.length === 0 ? (
        <div className="bg-white shadow-lg overflow-hidden rounded-xl">
          <div className="px-6 py-12 sm:p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bids found</h3>
            <p className="mt-2 text-base text-gray-500">
              {activeTab === 'all'
                ? "You haven't placed any bids yet."
                : activeTab === 'pending'
                  ? "You don't have any pending bids."
                  : activeTab === 'accepted'
                    ? "You don't have any accepted bids."
                    : "You don't have any rejected bids."}
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
        </div>
      ) : (
        <div className="bg-white shadow-lg overflow-hidden rounded-xl">
          <ul className="divide-y divide-gray-200">
            {sortedBids.map((bid) => (
              <li key={bid.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                <div className="px-6 py-5 sm:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <div className="mr-4">
                        {bid.status === 'pending' ? (
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                        ) : bid.status === 'accepted' ? (
                          <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        ) : bid.status === 'rejected' ? (
                          <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </div>
                        ) : (
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-indigo-700 truncate">
                          <Link to={`/freelancer/projects/${bid.project.id}`} className="hover:text-indigo-900 transition-colors duration-150">
                            {bid.project.title}
                          </Link>
                        </h3>
                        <div className="mt-1 flex items-center">
                          <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(bid.status)}`}>
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </span>
                          {bid.counterOffer && bid.counterOffer.status === 'pending' && (
                            <span className="ml-2 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Counter Offer
                            </span>
                          )}
                          <span className="ml-2 text-sm text-gray-500">
                            Submitted {formatDate(bid.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center">
                      <div className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg text-sm font-medium text-green-800 mr-4">
                        ${bid.amount}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {bid.deliveryTime} days
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
                        Client: <span className="font-medium text-indigo-600">{bid.project.client.name}</span>
                      </span>
                    </div>

                    <div className="mt-3 sm:mt-0 flex justify-end space-x-3">
                      {bid.status === 'pending' && (
                        <button
                          onClick={() => handleWithdrawBid(bid.id, bid.project.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150"
                        >
                          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Withdraw Bid
                        </button>
                      )}
                      <Link
                        to={`/messages/conversations/new?recipientId=${bid.project.client.id}&projectId=${bid.project.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150"
                      >
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                        </svg>
                        Message Client
                      </Link>
                      <Link
                        to={`/freelancer/projects/${bid.project.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all duration-150"
                      >
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        View Project
                      </Link>
                    </div>
                  </div>

                  {/* Counter Offer Section */}
                  {bid.counterOffer && bid.counterOffer.status !== 'none' && (
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800">Counter Offer</h4>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-xs text-blue-600">Amount</span>
                          <p className="text-sm font-medium text-blue-900">${bid.counterOffer.amount}</p>
                        </div>
                        <div>
                          <span className="text-xs text-blue-600">Delivery Time</span>
                          <p className="text-sm font-medium text-blue-900">{bid.counterOffer.deliveryTime} days</p>
                        </div>
                        <div>
                          <span className="text-xs text-blue-600">Status</span>
                          <p className="text-sm font-medium text-blue-900">
                            {bid.counterOffer.status.charAt(0).toUpperCase() + bid.counterOffer.status.slice(1)}
                          </p>
                        </div>
                      </div>
                      {bid.counterOffer.message && (
                        <div className="mt-2">
                          <span className="text-xs text-blue-600">Message</span>
                          <p className="text-sm text-blue-900">{bid.counterOffer.message}</p>
                        </div>
                      )}
                      {bid.counterOffer.status === 'pending' && (
                        <div className="mt-3 flex space-x-3">
                          <button
                            onClick={() => window.location.href = `/freelancer/projects/${bid.project.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
                          >
                            Respond to Counter Offer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(page * 10, bidStats.totalBids)}</span> of{' '}
                    <span className="font-medium">{bidStats.totalBids}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === i + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FreelancerBids;
