import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Check if user has an allowed role
  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user) {
      if (user.role === 'client') {
        return <Navigate to="/client/dashboard" replace />;
      } else if (user.role === 'freelancer') {
        return <Navigate to="/freelancer/dashboard" replace />;
      } else if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
    }
    
    // Fallback to login if no user
    return <Navigate to="/login" replace />;
  }
  
  // Render child routes if user has allowed role
  return <Outlet />;
};

export default RoleBasedRoute;
