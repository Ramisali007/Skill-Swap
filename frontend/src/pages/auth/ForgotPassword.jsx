import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [redirectMessage, setRedirectMessage] = useState(null);

  const { forgotPassword } = useAuth();
  const location = useLocation();

  // Check for redirect message from ResetPassword component
  useEffect(() => {
    if (location.state?.message) {
      setRedirectMessage(location.state.message);
      // Clear the message from location state after displaying it
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(null);
  };

  // Validate form
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      setError(null);

      try {
        console.log(`Submitting forgot password form for email: ${email}`);

        // Call the forgotPassword function from AuthContext
        const response = await forgotPassword(email);

        console.log('Forgot password successful:', response);

        // Set success state to show success message
        setSuccess(true);
        setIsSubmitting(false);
      } catch (err) {
        console.error('Error in forgot password form submission:', err);

        // Set error message
        const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
        console.error('Setting error message:', errorMessage);

        setError(errorMessage);
        setIsSubmitting(false);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-indigo-100">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 sm:px-10">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                  <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-center text-2xl font-bold text-white">
                Password Reset Successful
              </h2>
              <p className="mt-2 text-center text-sm text-green-100">
                Your password has been reset successfully
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-8 sm:px-10">
              <div className="bg-green-50 rounded-xl p-4 border border-green-100 mb-6">
                <p className="text-center text-sm text-green-800">
                  Your new password is: <strong className="font-bold text-green-700 text-base">password123</strong>
                </p>
              </div>

              <p className="text-center text-sm text-gray-600 mb-6">
                Please log in with this password and change it immediately for security reasons.
              </p>

              <Link
                to="/login"
                className="block w-full text-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                <div className="flex items-center justify-center">
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Go to Login
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-indigo-100">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 sm:px-10">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
            <h2 className="text-center text-2xl font-bold text-white">
              Forgot your password?
            </h2>
            <p className="mt-2 text-center text-sm text-indigo-100">
              Enter your email address and we'll reset your password to "password123".
            </p>
          </div>

          {/* Form content */}
          <div className="px-6 py-8 sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Redirect message */}
              {redirectMessage && (
                <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100 shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="bg-indigo-100 rounded-full p-1">
                        <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-indigo-700">{redirectMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100 shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="bg-red-100 rounded-full p-1">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                  <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-3 border border-indigo-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
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
                      <svg className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>

              <div className="text-center pt-4 border-t border-indigo-100">
                <Link
                  to="/login"
                  className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
