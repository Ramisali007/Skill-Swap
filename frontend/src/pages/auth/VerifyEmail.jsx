import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  
  const { verifyEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  
  // Verify email on component mount if token exists
  useEffect(() => {
    if (token) {
      const verify = async () => {
        setVerifying(true);
        try {
          await verifyEmail(token);
          setVerified(true);
          setVerifying(false);
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } catch (err) {
          setError(err.response?.data?.message || 'Verification failed');
          setVerifying(false);
        }
      };
      
      verify();
    }
  }, [token, verifyEmail, navigate]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !token) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, token]);
  
  // If no token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Email Verification
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please check your email for the verification link.
            </p>
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          
          {verifying && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying your email...</p>
            </div>
          )}
          
          {verified && (
            <div className="mt-8 text-center">
              <div className="rounded-full bg-green-100 p-3 inline-flex">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-gray-600">
                Your email has been verified successfully! Redirecting to dashboard...
              </p>
            </div>
          )}
          
          {error && (
            <div className="mt-8 text-center">
              <div className="rounded-full bg-red-100 p-3 inline-flex">
                <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mt-4 text-red-600">{error}</p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Return to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
