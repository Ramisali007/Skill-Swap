import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ReviewList = ({ userId, limit = 5, showFilters = true, showPagination = true }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    sort: 'createdAt',
    order: 'desc',
    minRating: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [userId, pagination.currentPage, filters]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: limit,
        sort: filters.sort,
        order: filters.order
      });

      if (filters.minRating) {
        queryParams.append('minRating', filters.minRating);
      }

      const response = await axios.get(`/api/reviews/user/${userId}?${queryParams}`);
      
      setReviews(response.data.reviews);
      setPagination({
        currentPage: parseInt(response.data.currentPage),
        totalPages: parseInt(response.data.totalPages),
        total: parseInt(response.data.total)
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };

  const handleAddResponse = async (reviewId, responseText) => {
    try {
      await axios.post(`/api/reviews/${reviewId}/response`, {
        comment: responseText
      });
      
      toast.success('Response added successfully');
      fetchReviews(); // Refresh reviews to show the response
    } catch (err) {
      console.error('Error adding response:', err);
      toast.error(err.response?.data?.message || 'Failed to add response');
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-50">
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
              >
                <option value="createdAt">Date</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                id="order"
                name="order"
                value={filters.order}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
                Filter Rating
              </label>
              <select
                id="minRating"
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Star</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-50 text-center">
          <p className="text-gray-500">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem 
              key={review._id} 
              review={review} 
              canRespond={user?.id === userId && user?.role === 'freelancer'} 
              onAddResponse={handleAddResponse}
            />
          ))}
        </div>
      )}

      {showPagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{reviews.length}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> reviews
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      pagination.currentPage === i + 1
                        ? 'z-10 bg-amber-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReviewItem = ({ review, canRespond, onAddResponse }) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddResponse(review._id, responseText);
      setShowResponseForm(false);
      setResponseText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-amber-700 font-semibold">
              {review.reviewer?.name ? review.reviewer.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">{review.reviewer?.name || 'Unknown User'}</h4>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
          <div className="mt-1 flex items-center">
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
            <span className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
          </div>
          <div className="mt-3 text-sm text-gray-700">
            <p>{review.comment}</p>
          </div>

          {/* Freelancer Response */}
          {review.response && review.response.comment && (
            <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-100">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">Response:</span>
                <span className="ml-2 text-xs text-gray-500">
                  {formatDate(review.response.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-700">{review.response.comment}</p>
            </div>
          )}

          {/* Response Form */}
          {canRespond && !review.response?.comment && (
            <div className="mt-4">
              {showResponseForm ? (
                <div className="space-y-3">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Write your response..."
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowResponseForm(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitResponse}
                      disabled={isSubmitting || !responseText.trim()}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                        (isSubmitting || !responseText.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Response'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResponseForm(true)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-600 hover:text-amber-800"
                >
                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Respond to this review
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewList;
