import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNotificationLinks } from '../../utils/notificationUtils';

const NotificationDropdown = ({ onClose }) => {
  const {
    notifications,
    loading: contextLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  const { user } = useAuth();
  const getNotificationLink = useNotificationLinks();

  const [directNotifications, setDirectNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  const dropdownRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    console.log('NotificationDropdown mounted, fetching notifications');
    try {
      fetchNotifications();
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    }
  }, []);

  // Update loading state based on contextLoading
  useEffect(() => {
    setLoading(contextLoading);
  }, [contextLoading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (notification && notification._id && !notification.read) {
      markAsRead(notification._id);
    }

    // Check if the link is valid before closing the dropdown
    if (!notification.link || notification.link === '#' || notification.link === '') {
      // If no valid link, prevent navigation and just close the dropdown
      onClose();
      return false;
    }

    onClose();
    return true;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project':
        return <div className="bg-blue-100 p-2 rounded-full text-blue-500">P</div>;
      case 'bid':
        return <div className="bg-green-100 p-2 rounded-full text-green-500">B</div>;
      case 'message':
        return <div className="bg-purple-100 p-2 rounded-full text-purple-500">M</div>;
      case 'review':
        return <div className="bg-yellow-100 p-2 rounded-full text-yellow-500">R</div>;
      case 'verification':
        return <div className="bg-indigo-100 p-2 rounded-full text-indigo-500">V</div>;
      default:
        return <div className="bg-gray-100 p-2 rounded-full text-gray-500">N</div>;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div className="py-1">
        <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
          <button
            onClick={async () => {
              try {
                setMarkingAllAsRead(true);
                await markAllAsRead();
                setMarkingAllAsRead(false);
              } catch (error) {
                console.error('Error marking all as read:', error);
                setMarkingAllAsRead(false);
              }
            }}
            disabled={markingAllAsRead || !notifications || notifications.length === 0}
            className={`text-xs ${
              markingAllAsRead || !notifications || notifications.length === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            {markingAllAsRead ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>

        {loading ? (
          <div className="px-4 py-3 text-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="px-4 py-3 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`px-4 py-3 border-b border-gray-100 flex items-start ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  {notification.link && notification.link !== '#' ? (
                    <Link
                      to={getNotificationLink(notification)}
                      className="block"
                      onClick={(e) => {
                        if (!handleNotificationClick(notification)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </Link>
                  ) : (
                    <div
                      className="block cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 ml-2 flex">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Mark as read"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                    title="Delete notification"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 py-2 border-t border-gray-200">
          <Link
            to="/notifications"
            className="block text-center text-xs text-blue-600 hover:text-blue-800"
            onClick={onClose}
          >
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
