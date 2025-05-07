import axios from 'axios';

// Function to test the notification API
export const testNotificationAPI = async () => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'No authentication token' };
    }
    
    // Set up headers with the token
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('Making test request to /api/notify with token:', token);
    
    // Make the request
    const response = await axios.get('/api/notify', config);
    
    console.log('Notification API test response:', response.data);
    
    return { 
      success: true, 
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Notification API test error:', error.response?.data || error.message);
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};

// Function to test the unread count API
export const testUnreadCountAPI = async () => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'No authentication token' };
    }
    
    // Set up headers with the token
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('Making test request to /api/notify/unread-count with token:', token);
    
    // Make the request
    const response = await axios.get('/api/notify/unread-count', config);
    
    console.log('Unread count API test response:', response.data);
    
    return { 
      success: true, 
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Unread count API test error:', error.response?.data || error.message);
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};
