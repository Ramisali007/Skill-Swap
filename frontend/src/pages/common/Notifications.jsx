import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { CheckIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useNotificationLinks } from '../../utils/notificationUtils';

const Notifications = () => {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const getNotificationLink = useNotificationLinks();

  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications on mount and when page changes
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setError(null);
        console.log('Loading notifications page:', page);
        const response = await fetchNotifications(page, 10);
        console.log('Notifications response:', response);

        if (response) {
          setTotalPages(response.totalPages || 1);

          if (response.error) {
            setError(response.error);
            console.error('Error in response:', response.error);
          }
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      }
    };

    loadNotifications();
  }, [page]);

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);
      await markAllAsRead();
      setMarkingAllAsRead(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
      setMarkingAllAsRead(false);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project':
        return (
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-full shadow-sm border border-blue-200">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'bid':
        return (
          <div className="bg-gradient-to-r from-green-100 to-green-200 p-3 rounded-full shadow-sm border border-green-200">
            <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-3 rounded-full shadow-sm border border-purple-200">
            <svg className="h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'review':
        return (
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-3 rounded-full shadow-sm border border-yellow-200">
            <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        );
      case 'verification':
        return (
          <div className="bg-gradient-to-r from-indigo-100 to-indigo-200 p-3 rounded-full shadow-sm border border-indigo-200">
            <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 rounded-full shadow-sm border border-gray-200">
            <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return notification.type === filter;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-6 py-6 sm:px-8 relative">
          <div className="absolute inset-0 bg-white opacity-5"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center">
                <svg className="h-8 w-8 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h1 className="text-2xl leading-6 font-bold text-white">Notifications</h1>
              </div>
              <p className="mt-2 max-w-2xl text-base text-indigo-100">
                Stay updated with your latest activities and interactions
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600/30 hover:bg-indigo-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-all duration-200"
              >
                <FunnelIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead || !notifications.some(n => !n.read)}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-all duration-200 ${
                  markingAllAsRead || !notifications.some(n => !n.read)
                    ? 'bg-gray-400/50 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400'
                }`}
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {markingAllAsRead ? 'Marking...' : 'Mark all as read'}
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-sm font-semibold text-indigo-900">Filter Notifications</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === 'unread'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <div className="flex items-center">
                  <span className="h-2 w-2 bg-indigo-500 rounded-full mr-1.5"></span>
                  Unread
                </div>
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === 'read'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <div className="flex items-center">
                  <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Read
                </div>
              </button>
              <button
                onClick={() => setFilter('project')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === 'project'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <div className="flex items-center">
                  <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Projects
                </div>
              </button>
              <button
                onClick={() => setFilter('bid')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === 'bid'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <div className="flex items-center">
                  <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bids
                </div>
              </button>
              <button
                onClick={() => setFilter('message')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === 'message'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <div className="flex items-center">
                  <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Messages
                </div>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="mt-6 text-base text-indigo-600 font-medium">Loading your notifications...</p>
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-xl p-6 shadow-sm max-w-lg mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-red-400 to-pink-400 rounded-full p-2">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-red-800">{error}</h3>
                  <p className="mt-2 text-base text-red-700">
                    We encountered an issue while loading your notifications. Please try again.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                    >
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-indigo-100">
              <svg
                className="h-10 w-10 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">No notifications</h3>
            <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
              {filter === 'all'
                ? "You don't have any notifications yet. When you receive notifications, they will appear here."
                : `You don't have any ${filter} notifications. Try selecting a different filter.`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                View All Notifications
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-indigo-100">
            {filteredNotifications.map((notification) => (
              <li key={notification._id} className={`px-6 py-5 sm:px-8 transition-colors duration-200 ${!notification.read ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between">
                      <p className={`text-base font-semibold ${notification.read ? 'text-gray-700' : 'text-indigo-900'}`}>
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            New
                          </span>
                        )}
                      </p>
                      <div className="flex-shrink-0 flex">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="ml-2 text-indigo-400 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full p-1.5 transition-colors duration-200"
                            title="Mark as read"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="ml-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-1.5 transition-colors duration-200"
                          title="Delete notification"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className={`mt-2 text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full inline-flex items-center">
                        <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                      {notification.link && notification.link !== '#' && (
                        <Link
                          to={getNotificationLink(notification)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center group"
                          onClick={() => {
                            markAsRead(notification._id);
                          }}
                        >
                          View details
                          <svg className="ml-1 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 text-center border-t border-indigo-100 sm:px-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-indigo-700">
                Page {page} of {totalPages}
              </p>
              <nav className="flex justify-center space-x-3">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
                  }`}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
                  }`}
                >
                  Next
                  <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
