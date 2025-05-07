import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  const { user, token } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      console.log('Initializing socket connection');
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
        auth: {
          token
        }
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      setSocket(socketInstance);

      // Clean up on unmount
      return () => {
        console.log('Disconnecting socket');
        socketInstance.disconnect();
      };
    }
  }, [user, token]);

  // Listen for new notifications
  useEffect(() => {
    if (socket && user) {
      socket.on('notification', (notification) => {
        if (notification.recipient === user.id) {
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, [socket, user]);

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  // Fetch all notifications
  const fetchNotifications = async (page = 1, limit = 20) => {
    if (!user) {
      console.error('Cannot fetch notifications: No user logged in');
      return null;
    }

    try {
      setLoading(true);
      console.log('Fetching notifications for user:', user.id, 'page:', page, 'limit:', limit);

      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const res = await axios.get(`/api/notify?page=${page}&limit=${limit}&_=${timestamp}`);

      console.log('Notifications API response status:', res.status);
      console.log('Notifications response data:', res.data);

      // Return the full response data for pagination
      const responseData = {
        notifications: res.data.notifications || [],
        totalPages: res.data.totalPages || 1,
        currentPage: res.data.currentPage || 1,
        total: res.data.total || 0
      };

      console.log('Processed notifications data:', {
        count: responseData.notifications.length,
        totalPages: responseData.totalPages,
        currentPage: responseData.currentPage,
        total: responseData.total
      });

      setNotifications(responseData.notifications);
      setLoading(false);

      return responseData;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      console.error('Error details:', err.response?.data || err.message);
      setLoading(false);
      return {
        notifications: [],
        totalPages: 1,
        currentPage: 1,
        total: 0,
        error: err.response?.data?.message || err.message
      };
    }
  };

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const res = await axios.get('/api/notify/unread-count');
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notify/${id}/read`);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );

      // Update unread count
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read');
      // Send an empty object as the body since the backend expects a request body
      const response = await axios.put('/api/notify/read-all', {});
      console.log('Mark all as read response:', response.data);

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      setUnreadCount(0);

      // Refresh notifications to ensure UI is in sync with backend
      fetchNotifications();

      return response.data;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      console.error('Error details:', err.response?.data || err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notify/${id}`);

      // Update local state
      setNotifications(prev =>
        prev.filter(notification => notification._id !== id)
      );

      // Update unread count if needed
      const deletedNotification = notifications.find(n => n._id === id);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Send email notification
  const sendEmailNotification = async (recipientId, subject, message) => {
    try {
      await axios.post('/api/notify/email', {
        recipientId,
        subject,
        message
      });
      return true;
    } catch (err) {
      console.error('Error sending email notification:', err);
      return false;
    }
  };

  // Send SMS notification
  const sendSmsNotification = async (recipientId, message) => {
    try {
      await axios.post('/api/notify/sms', {
        recipientId,
        message
      });
      return true;
    } catch (err) {
      console.error('Error sending SMS notification:', err);
      return false;
    }
  };

  // Update notification preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await axios.put('/api/notify/preferences', preferences);

      // Update user object with new preferences if available
      if (response.data && response.data.preferences) {
        // If we have an auth context update function, use it
        if (user && typeof updateUser === 'function') {
          updateUser({
            ...user,
            notificationPreferences: response.data.preferences
          });
        }
      }

      return true;
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      throw err;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        sendEmailNotification,
        sendSmsNotification,
        updatePreferences
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
