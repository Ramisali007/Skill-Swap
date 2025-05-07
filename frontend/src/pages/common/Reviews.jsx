import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReviewList from '../../components/reviews/ReviewList';

const Reviews = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  });

  useEffect(() => {
    const fetchUserAndStats = async () => {
      setLoading(true);
      try {
        // Fetch user data
        const userResponse = await axios.get(`/api/users/${userId}`);
        if (!userResponse.data || !userResponse.data.user) {
          throw new Error('User not found');
        }
        setUser(userResponse.data.user);

        // Fetch review statistics
        const statsResponse = await axios.get(`/api/reviews/stats/${userId}`);
        setStats(statsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load user data or review statistics');
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error || 'User not found'}</span>
      </div>
    );
  }

  // Calculate percentage for each rating
  const calculatePercentage = (count) => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to={`/users/${userId}`}
          className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-800"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Profile
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-lg leading-6 font-medium text-gray-900">
              Reviews for {user.name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {user.role === 'freelancer' ? 'Freelancer' : 'Client'}
            </p>
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${i < Math.floor(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm font-medium text-gray-900">
                {stats.averageRating.toFixed(1)} out of 5
              </span>
            </div>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-sm text-gray-500">{stats.totalReviews} reviews</span>
          </div>
        </div>

        {stats.totalReviews > 0 && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Rating Breakdown</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <div className="w-24 flex items-center">
                    <span className="text-sm font-medium text-gray-600 mr-2">{rating} star</span>
                    <div className="flex">
                      {[...Array(rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-4 w-4 text-yellow-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${calculatePercentage(stats.ratingCounts[rating])}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 w-16 text-right">
                    <span className="text-sm text-gray-500">
                      {stats.ratingCounts[rating]} ({calculatePercentage(stats.ratingCounts[rating])}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Reviews</h2>
        <ReviewList userId={userId} limit={10} showFilters={true} showPagination={true} />
      </div>
    </div>
  );
};

export default Reviews;
