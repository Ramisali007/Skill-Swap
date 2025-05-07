
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';

// Layout Components
import MainLayout from './components/common/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Client Pages
import ClientDashboard from './pages/client/Dashboard';
import PostProject from './pages/client/PostProject';
import EditProject from './pages/client/EditProject';
import ClientProjects from './pages/client/Projects';
import ProjectDetails from './pages/client/ProjectDetails';
import ManageBids from './pages/client/ManageBids';
import ClientProfile from './pages/client/Profile';
import ClientAnalytics from './pages/client/Analytics';
import BrowseFreelancers from './pages/client/BrowseFreelancers';
import ClientProjectManagement from './pages/client/ProjectManagement';

// Freelancer Pages
import FreelancerDashboard from './pages/freelancer/Dashboard';
import FreelancerProjects from './pages/freelancer/Projects';
import FreelancerProjectDetails from './pages/freelancer/ProjectDetails';
import FreelancerProfile from './pages/freelancer/Profile';
import BrowseProjects from './pages/freelancer/BrowseProjects';
import FreelancerAnalytics from './pages/freelancer/Analytics';
import FreelancerBids from './pages/freelancer/MyBids';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProjects from './pages/admin/ManageProjects';
import AdminProjectDetails from './pages/admin/ProjectDetails';
import VerifyFreelancers from './pages/admin/VerifyFreelancers';
import FreelancerVerificationDetails from './pages/admin/FreelancerVerificationDetails';
import AdminAnalytics from './pages/admin/Analytics';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';
import AdminProfile from './pages/admin/Profile';
import NotificationManagement from './pages/admin/NotificationManagement';

// Common Pages
import RealMessaging from './pages/common/RealMessaging';
import RealConversationDetails from './pages/common/RealConversationDetails';
import Notifications from './pages/common/Notifications';
import UserProfile from './pages/common/UserProfile';
import Reviews from './pages/common/Reviews';
import NotFound from './pages/common/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                {/* Client Routes */}
                <Route element={<RoleBasedRoute allowedRoles={['client']} />}>
                  <Route path="/client/dashboard" element={<ClientDashboard />} />
                  <Route path="/client/post-project" element={<PostProject />} />
                  <Route path="/client/edit-project/:id" element={<EditProject />} />
                  <Route path="/client/projects" element={<ClientProjects />} />
                  <Route path="/client/project-management" element={<ClientProjectManagement />} />
                  <Route path="/client/projects/:id" element={<ProjectDetails />} />
                  <Route path="/client/projects/:id/bids" element={<ManageBids />} />
                  <Route path="/client/profile" element={<ClientProfile />} />
                  <Route path="/client/analytics" element={<ClientAnalytics />} />
                  <Route path="/client/browse-freelancers" element={<BrowseFreelancers />} />
                </Route>

                {/* Freelancer Routes */}
                <Route element={<RoleBasedRoute allowedRoles={['freelancer']} />}>
                  <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
                  <Route path="/freelancer/projects" element={<FreelancerProjects />} />
                  <Route path="/freelancer/projects/:id" element={<FreelancerProjectDetails />} />
                  <Route path="/freelancer/profile" element={<FreelancerProfile />} />
                  <Route path="/freelancer/browse-projects" element={<BrowseProjects />} />
                  <Route path="/freelancer/analytics" element={<FreelancerAnalytics />} />
                  <Route path="/freelancer/my-bids" element={<FreelancerBids />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<ManageUsers />} />
                  <Route path="/admin/projects" element={<ManageProjects />} />
                  <Route path="/admin/projects/:id" element={<AdminProjectDetails />} />
                  <Route path="/admin/verify-freelancers" element={<VerifyFreelancers />} />
                  <Route path="/admin/verify-freelancers/:id" element={<FreelancerVerificationDetails />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/platform-analytics" element={<PlatformAnalytics />} />
                  <Route path="/admin/notifications" element={<NotificationManagement />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>

                {/* Common Routes (accessible by all authenticated users) */}
                <Route path="/messages" element={<RealMessaging />} />
                <Route path="/messages/conversations/:id" element={<RealConversationDetails />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/users/:id" element={<UserProfile />} />
                <Route path="/users/:userId/reviews" element={<Reviews />} />
              </Route>
            </Route>

            {/* Redirect root to appropriate dashboard based on role */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
