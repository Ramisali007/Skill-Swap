import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const ManageBids = () => {
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('amount_asc');
  const [acceptingBid, setAcceptingBid] = useState(null);
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [counterOffer, setCounterOffer] = useState({
    amount: '',
    deliveryTime: '',
    message: ''
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Function to fetch project and bids data
  const fetchProjectAndBids = async () => {
    setError(null);

    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();

      // Fetch project details
      const projectResponse = await axios.get(`/api/projects/${id}?_=${timestamp}`);
      console.log('Project data:', projectResponse.data);

      if (!projectResponse.data || !projectResponse.data.project) {
        throw new Error('Invalid project data received');
      }

      const projectData = {
        id: projectResponse.data.project._id,
        title: projectResponse.data.project.title,
        budget: projectResponse.data.project.budget,
        status: projectResponse.data.project.status,
        deadline: projectResponse.data.project.deadline
      };

      // Fetch bids for the project
      const bidsResponse = await axios.get(`/api/projects/${id}/bids?_=${timestamp}`);
      console.log('Bids data:', bidsResponse.data);

      if (!bidsResponse.data || !bidsResponse.data.bids) {
        throw new Error('Invalid bids data received');
      }

      // Transform bids data
      const bidsData = bidsResponse.data.bids.map(bid => ({
        id: bid._id,
        amount: bid.amount,
        deliveryTime: bid.deliveryTime + ' days',
        proposal: bid.proposal,
        status: bid.status,
        createdAt: bid.createdAt,
        counterOffer: bid.counterOffer,
        freelancer: {
          id: bid.freelancer._id,
          name: bid.freelancer.user ? bid.freelancer.user.name : 'Unknown Freelancer',
          rating: bid.freelancer.averageRating || 0,
          completedProjects: bid.freelancer.completedProjects || 0,
          skills: bid.freelancer.skills ? bid.freelancer.skills.map(skill => skill.name) : []
        }
      }));

      setProject(projectData);
      setBids(bidsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching project and bids:', err);
      setError('Failed to load project and bids. Please try again later.');
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    setLoading(true);
    fetchProjectAndBids();
  }, [id]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    // Create socket connection
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
    socketRef.current = socket;

    // Join project room for real-time updates
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join_project', id);
    });

    // Listen for new bids
    socket.on('bid_update', (data) => {
      console.log('New bid received:', data);

      if (data.projectId === id) {
        // Refresh bids data when a new bid is received
        fetchProjectAndBids();
      }
    });

    // Clean up on unmount
    return () => {
      console.log('Disconnecting socket');
      socket.disconnect();
    };
  }, [id]);

  // Sort bids based on selected option
  const sortedBids = [...bids].sort((a, b) => {
    switch (sortBy) {
      case 'amount_asc':
        return a.amount - b.amount;
      case 'amount_desc':
        return b.amount - a.amount;
      case 'rating_desc':
        return b.freelancer.rating - a.freelancer.rating;
      case 'experience_desc':
        return b.freelancer.completedProjects - a.freelancer.completedProjects;
      case 'date_desc':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'date_asc':
        return new Date(a.createdAt) - new Date(b.createdAt);
      default:
        return 0;
    }
  });

  // Handle accept bid
  const handleAcceptBid = async (bidId) => {
    try {
      setAcceptingBid(bidId);

      // Make API call to accept the bid
      const response = await axios.put(`/api/projects/${id}/bids/${bidId}/accept`);
      console.log('Accept bid response:', response.data);

      // Show success message
      alert('Bid accepted successfully! The project is now in progress.');

      // Redirect to project details page
      navigate(`/client/projects/${id}`);
    } catch (err) {
      console.error('Error accepting bid:', err);
      alert('Failed to accept bid. Please try again later.');
      setAcceptingBid(null);
    }
  };

  // Handle counter offer
  const handleCounterOffer = (bid) => {
    setSelectedBid(bid);
    setCounterOffer({
      amount: bid.amount,
      deliveryTime: parseInt(bid.deliveryTime),
      message: ''
    });
    setShowCounterOffer(true);
  };

  // Handle counter offer submission
  const handleSubmitCounterOffer = async (e) => {
    e.preventDefault();

    if (!counterOffer.amount || !counterOffer.deliveryTime || !counterOffer.message) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Make API call to create counter offer
      const response = await axios.post(`/api/projects/${id}/bids/${selectedBid.id}/counter-offer`, {
        amount: parseFloat(counterOffer.amount),
        deliveryTime: parseInt(counterOffer.deliveryTime),
        message: counterOffer.message
      });

      console.log('Counter offer response:', response.data);

      // Show success message
      alert('Counter offer sent successfully!');

      // Close counter offer form and refresh bids
      setShowCounterOffer(false);
      fetchProjectAndBids();

      // Emit socket event for real-time update
      if (socketRef.current) {
        socketRef.current.emit('new_bid', {
          projectId: id,
          type: 'counter_offer',
          bidId: selectedBid.id
        });
      }
    } catch (err) {
      console.error('Error sending counter offer:', err);
      alert('Failed to send counter offer. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-6">
            <Link
              to="/client/projects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg leading-6 font-medium text-gray-900">
                Bids for: {project.title}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {bids.length} bids received • Budget: ${project.budget}
              </p>
            </div>
            <Link
              to={`/client/projects/${id}`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Project
            </Link>
          </div>
        </div>
      </div>

      {/* Sort and Filter */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-700">Sort by:</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="amount_asc">Price: Low to High</option>
            <option value="amount_desc">Price: High to Low</option>
            <option value="rating_desc">Rating: High to Low</option>
            <option value="experience_desc">Experience: Most Projects</option>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Bids List */}
      {sortedBids.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">No bids yet.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {sortedBids.map((bid) => (
              <li key={bid.id} className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">{bid.freelancer.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{bid.freelancer.name}</h3>
                      <div className="flex items-center mt-1">
                        <svg className="text-yellow-400 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-500">{bid.freelancer.rating} ({bid.freelancer.completedProjects} projects)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${bid.amount}</p>
                    <p className="text-sm text-gray-500">Delivery: {bid.deliveryTime}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{bid.proposal}</p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => handleAcceptBid(bid.id)}
                    disabled={acceptingBid === bid.id || project.status !== 'open'}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white ${
                      acceptingBid === bid.id
                        ? 'bg-blue-400 cursor-not-allowed'
                        : project.status !== 'open'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {acceptingBid === bid.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Accept Bid'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCounterOffer(bid)}
                    disabled={project.status !== 'open'}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white ${
                      project.status !== 'open'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                    }`}
                  >
                    Counter Offer
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Message
                  </button>
                  <Link
                    to={`/users/${bid.freelancer.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Profile
                  </Link>
                </div>

                {/* Display counter offer status if exists */}
                {bid.counterOffer && bid.counterOffer.status !== 'none' && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-md border border-amber-200">
                    <h4 className="text-sm font-medium text-amber-800">Counter Offer</h4>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-amber-600">Amount:</span> ${bid.counterOffer.amount}
                      </div>
                      <div>
                        <span className="text-amber-600">Delivery:</span> {bid.counterOffer.deliveryTime} days
                      </div>
                      <div className="col-span-2">
                        <span className="text-amber-600">Message:</span> {bid.counterOffer.message}
                      </div>
                      <div className="col-span-2">
                        <span className="text-amber-600">Status:</span>
                        <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bid.counterOffer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          bid.counterOffer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {bid.counterOffer.status.charAt(0).toUpperCase() + bid.counterOffer.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Counter Offer Modal */}
      {showCounterOffer && selectedBid && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Send Counter Offer
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are making a counter offer to {selectedBid.freelancer.name}'s bid of ${selectedBid.amount} with {selectedBid.deliveryTime} delivery time.
                      </p>

                      <form onSubmit={handleSubmitCounterOffer} className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                            Amount ($)
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              name="amount"
                              id="amount"
                              value={counterOffer.amount}
                              onChange={(e) => setCounterOffer({...counterOffer, amount: e.target.value})}
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              min="1"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">
                            Delivery Time (days)
                          </label>
                          <input
                            type="number"
                            name="deliveryTime"
                            id="deliveryTime"
                            value={counterOffer.deliveryTime}
                            onChange={(e) => setCounterOffer({...counterOffer, deliveryTime: e.target.value})}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Number of days"
                            min="1"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            Message to Freelancer
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            rows="3"
                            value={counterOffer.message}
                            onChange={(e) => setCounterOffer({...counterOffer, message: e.target.value})}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Explain your counter offer..."
                            required
                          ></textarea>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Send Counter Offer
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCounterOffer(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBids;
