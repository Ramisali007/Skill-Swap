import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();

  // Redirect to forgot password page immediately
  useEffect(() => {
    // Redirect with a message that the reset process has changed
    navigate('/forgot-password', {
      state: {
        message: 'The password reset process has changed. Please enter your email to reset your password directly to "password123".'
      }
    });
  }, [navigate]);

  // Return a loading indicator while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
};

export default ResetPassword;
