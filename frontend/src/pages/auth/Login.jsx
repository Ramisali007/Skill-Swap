import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, error, clearError, redirectToDashboard } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      redirectToDashboard();
    }
  }, [isAuthenticated, redirectToDashboard]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear field error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Clear global error
    if (error) {
      clearError();
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        console.log('Submitting login form with email:', formData.email);
        await login(formData.email, formData.password);
        console.log('Login successful, redirect should happen in useEffect');
        // Redirect will happen in the useEffect
      } catch (err) {
        console.error('Login error in component:', err);
        setIsSubmitting(false);

        // Set specific field errors if available
        if (err.response?.status === 401) {
          setErrors({
            ...errors,
            password: 'Invalid email or password'
          });
        }

        // Global error is handled by the auth context
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-2xl p-8 transition-all duration-300 hover:shadow-indigo-300/30">
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="SkillSwap Logo"
            className="h-20 w-auto mb-4"
          />
          <h2 className="text-center text-3xl font-extrabold text-indigo-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your SkillSwap account
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Or{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* Global error message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 border-l-4 border-red-500 animate-fadeIn">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  errors.email ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  errors.password ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors duration-200"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
