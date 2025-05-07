import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/users/${id}`);
        console.log('User profile data:', response.data);

        if (!response.data || !response.data.user) {
          throw new Error('User not found');
        }

        setUser(response.data.user);
        setProfile(response.data.profile);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile. The user may not exist or you may not have permission to view this profile.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  // Function to check if a user exists
  const checkUserExists = async (userId) => {
    if (!userId || userId === 'undefined' || userId === 'null') return false;

    try {
      const response = await axios.get(`/api/users/exists/${userId}`);
      return response.data && response.data.exists;
    } catch (err) {
      console.error(`Error checking if user ${userId} exists:`, err);
      return false;
    }
  };

  const getMessageLink = () => {
    // Make sure we're using the correct ID format and that the ID is valid
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Invalid user ID for message link');
      return '/messages';
    }
    return `/messages/conversations/new?recipientId=${id}`;
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
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <p className="text-gray-500">User not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <div>
            <h1 className="text-lg leading-6 font-medium text-gray-900">{user.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
          {currentUser.id !== id && id && id !== 'undefined' && id !== 'null' && (
            <button
              type="button"
              onClick={async () => {
                // Check if user exists before navigating
                const userExists = await checkUserExists(id);
                if (userExists) {
                  navigate(getMessageLink());
                } else {
                  alert('This user account is no longer available for messaging.');
                }
              }}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Message
            </button>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="mt-1 text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>

            {user.role === 'freelancer' && profile && (
              <>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Skills</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-2">
                      {profile.skills && profile.skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>

                {profile.bio && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.bio}</dd>
                  </div>
                )}

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Completed Projects</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.completedProjects || 0}</dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Average Rating</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <span>{profile.averageRating || 'No ratings yet'}</span>
                    {profile.averageRating && (
                      <svg className="ml-1 h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    <Link
                      to={`/users/${id}/reviews`}
                      className="ml-2 text-sm text-blue-600 hover:text-blue-500"
                    >
                      View all reviews
                    </Link>
                  </dd>
                </div>
              </>
            )}

            {user.role === 'client' && profile && (
              <>
                {profile.company && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Company</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.company}</dd>
                  </div>
                )}

                {profile.website && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 hover:text-blue-500">
                        {profile.website}
                      </a>
                    </dd>
                  </div>
                )}

                {profile.bio && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.bio}</dd>
                  </div>
                )}

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Projects Posted</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.projectsPosted || 0}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
