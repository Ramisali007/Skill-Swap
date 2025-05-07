import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5001', // Direct connection to backend
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Disable sending cookies
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
