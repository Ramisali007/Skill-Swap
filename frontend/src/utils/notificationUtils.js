/**
 * Utility functions for handling notifications
 */

import { useAuth } from '../context/AuthContext';

/**
 * Maps notification links to the correct routes based on the notification type and user role
 * @param {Object} notification - The notification object
 * @param {Object} user - The current user object
 * @returns {string} The correct route for the notification
 */
export const getCorrectNotificationLink = (notification, user) => {
  if (!notification || !notification.link) {
    return '/notifications';
  }

  // Extract the notification type and any IDs from the link
  const { type } = notification;
  
  // Handle review links
  if (notification.link.startsWith('/reviews/')) {
    const reviewId = notification.link.split('/reviews/')[1];
    
    // For now, redirect to the user's profile since we don't have a dedicated reviews page
    if (user.role === 'client') {
      return '/client/profile';
    } else if (user.role === 'freelancer') {
      return '/freelancer/profile';
    } else {
      return '/notifications';
    }
  }
  
  // Handle project links
  if (notification.link.startsWith('/projects/')) {
    const parts = notification.link.split('/');
    const projectId = parts[2];
    
    // Check if it's a bid-related link
    if (parts.length > 3 && parts[3] === 'bids') {
      if (user.role === 'client') {
        return `/client/projects/${projectId}/bids`;
      } else {
        return `/freelancer/projects/${projectId}`;
      }
    }
    
    // Regular project link
    if (user.role === 'client') {
      return `/client/projects/${projectId}`;
    } else if (user.role === 'freelancer') {
      return `/freelancer/projects/${projectId}`;
    } else if (user.role === 'admin') {
      return `/admin/projects/${projectId}`;
    }
  }
  
  // Handle message links
  if (notification.link.startsWith('/messages/')) {
    return notification.link; // These should already be correct
  }
  
  // Handle profile links
  if (notification.link === '/profile') {
    if (user.role === 'client') {
      return '/client/profile';
    } else if (user.role === 'freelancer') {
      return '/freelancer/profile';
    } else {
      return '/admin/dashboard';
    }
  }
  
  // Handle dashboard links
  if (notification.link === '/dashboard') {
    if (user.role === 'client') {
      return '/client/dashboard';
    } else if (user.role === 'freelancer') {
      return '/freelancer/dashboard';
    } else {
      return '/admin/dashboard';
    }
  }
  
  // Default case: use the original link
  return notification.link;
};

/**
 * Hook to get the correct notification link
 * @returns {Function} A function that takes a notification and returns the correct link
 */
export const useNotificationLinks = () => {
  const { user } = useAuth();
  
  return (notification) => {
    return getCorrectNotificationLink(notification, user);
  };
};
