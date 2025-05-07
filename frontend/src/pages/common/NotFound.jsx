import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get the appropriate dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/login';

    switch (user.role) {
      case 'client':
        return '/client/dashboard';
      case 'freelancer':
        return '/freelancer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="bg-white shadow-xl rounded-xl p-8 border border-indigo-100">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100 mb-6">
            <svg className="h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-center text-3xl font-bold text-gray-900">
            404 - Page Not Found
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            The page you are looking for doesn't exist or has been moved.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
            <Link
              to={getDashboardLink()}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
