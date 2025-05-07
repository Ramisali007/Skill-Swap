import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Configure axios defaults
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Set auth token for all requests if available
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data.user);
        setLoading(false);
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError('Session expired. Please login again.');
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Sending registration data:', userData);
      const res = await axios.post('/api/auth/signup', userData);
      console.log('Registration response:', res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      setLoading(false);

      // Set specific error message based on the response
      if (err.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = err.response.data.errors;
        const errorMessage = Object.values(validationErrors).join(', ');
        setError(errorMessage || 'Validation failed');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }

      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting login with email:', email);

      // Make sure we're using the correct API URL
      console.log('API URL:', axios.defaults.baseURL);

      const res = await axios.post('/api/auth/login', { email, password });
      console.log('Login response:', res.data);

      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);

      return res.data.user;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setLoading(false);

      // Set specific error message based on the response status
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 403) {
        setError('Please verify your email before logging in.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again later.');
      }

      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/verify-email', { token });

      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);

      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Email verification failed');
      throw err;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      console.log(`Sending forgot password request for email: ${email}`);

      const res = await axios.post('/api/auth/forgot-password', { email });

      console.log('Forgot password response:', res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      console.error('Error in forgot password:', err);
      setLoading(false);

      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      console.error('Error message:', errorMessage);

      setError(errorMessage);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/reset-password', { token, password });
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Password reset failed');
      throw err;
    }
  };

  // Update profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.put('/api/auth/update-profile', userData);
      setUser(res.data.user);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/change-password', { currentPassword, newPassword });
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Password change failed');
      throw err;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Update user data directly
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Redirect to appropriate dashboard based on role
  const redirectToDashboard = () => {
    if (!user) return;

    if (user.role === 'client') {
      navigate('/client/dashboard');
    } else if (user.role === 'freelancer') {
      navigate('/freelancer/dashboard');
    } else if (user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        verifyEmail,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        clearError,
        updateUser,
        hasRole,
        redirectToDashboard,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
