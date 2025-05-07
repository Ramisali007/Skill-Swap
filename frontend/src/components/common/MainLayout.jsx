import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  BellIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import NotificationDropdown from './NotificationDropdown';

const MainLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Navigation links based on user role
  const getNavLinks = () => {
    if (hasRole('client')) {
      return [
        { name: 'Dashboard', path: '/client/dashboard' },
        { name: 'My Projects', path: '/client/projects' },
        { name: 'Project Management', path: '/client/project-management' },
        { name: 'Post a Project', path: '/client/post-project' },
        { name: 'Analytics', path: '/client/analytics' }
      ];
    } else if (hasRole('freelancer')) {
      return [
        { name: 'Dashboard', path: '/freelancer/dashboard' },
        { name: 'My Projects', path: '/freelancer/projects' },
        { name: 'My Bids', path: '/freelancer/my-bids' },
        { name: 'Find Projects', path: '/freelancer/browse-projects' },
        { name: 'Analytics', path: '/freelancer/analytics' }
      ];
    } else if (hasRole('admin')) {
      return [
        { name: 'Dashboard', path: '/admin/dashboard' },
        { name: 'Users', path: '/admin/users' },
        { name: 'Projects', path: '/admin/projects' },
        { name: 'Verify Freelancers', path: '/admin/verify-freelancers' },
        { name: 'Notifications', path: '/admin/notifications' },
        { name: 'Analytics', path: '/admin/analytics' },
        { name: 'Platform Analytics', path: '/admin/platform-analytics' }
      ];
    }

    return [];
  };

  // Get profile path based on user role
  const getProfilePath = () => {
    if (hasRole('client')) {
      return '/client/profile';
    } else if (hasRole('freelancer')) {
      return '/freelancer/profile';
    } else if (hasRole('admin')) {
      return '/admin/profile';
    }

    return '/';
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white bg-opacity-90 backdrop-blur-sm shadow-lg border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and desktop navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center group">
                  <img src="/logo.png" alt="SkillSwap Logo" className="h-9 w-auto mr-2 transform group-hover:scale-105 transition-transform duration-300" />
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300">
                    SkillSwap
                  </span>
                </Link>
              </div>

              {/* Desktop navigation */}
              <nav className="hidden md:ml-10 md:flex md:space-x-2">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-700 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center"
                  >
                    {link.name === 'Dashboard' && (
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                    )}
                    {link.name === 'My Projects' && (
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    )}
                    {link.name === 'Project Management' && (
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                      </svg>
                    )}
                    {link.name === 'Post a Project' && (
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    )}
                    {link.name === 'Analytics' && (
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    )}
                    {link.name === 'My Bids' && (
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    )}
                    {link.name === 'Find Projects' && (
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    )}
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-lg text-indigo-600 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 focus:outline-none"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <span className="sr-only">Open main menu</span>
                {showMobileMenu ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* User navigation */}
            <div className="hidden md:flex md:items-center md:ml-6 space-x-4">
              {/* Messages */}
              <Link
                to="/messages"
                className="relative p-2 rounded-full text-indigo-600 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 focus:outline-none group"
              >
                <span className="sr-only">View messages</span>
                <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-70 blur-sm transition duration-300"></span>
                <ChatBubbleLeftRightIcon className="relative h-6 w-6" aria-hidden="true" />
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  className="relative p-2 rounded-full text-indigo-600 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 focus:outline-none group"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <span className="sr-only">View notifications</span>
                  <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-70 blur-sm transition duration-300"></span>
                  <BellIcon className="relative h-6 w-6" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs text-white text-center font-medium flex items-center justify-center shadow-md animate-pulse ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {showNotifications && (
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="relative flex items-center rounded-full text-sm focus:outline-none p-1.5 border-2 border-transparent hover:border-indigo-200 transition-all duration-300 group"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <span className="sr-only">Open user menu</span>
                  <span className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-50 blur-sm transition duration-300"></span>
                  <UserCircleIcon className="relative h-8 w-8 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-300" aria-hidden="true" />
                </button>

                {/* Profile menu dropdown */}
                {showProfileMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white ring-1 ring-indigo-100 focus:outline-none overflow-hidden transform transition-all duration-300 animate-fadeIn">
                    <div className="py-1">
                      <div className="px-4 py-4 text-sm border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <p className="font-medium text-indigo-900 text-base">{user?.name}</p>
                        <p className="text-indigo-600 text-xs mt-1">{user?.email}</p>
                      </div>
                      <Link
                        to={getProfilePath()}
                        className="block px-4 py-3 text-sm text-indigo-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-1.5 rounded-lg mr-3">
                            <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          </div>
                          <span>Your Profile</span>
                        </div>
                      </Link>
                      <button
                        className="w-full text-left block px-4 py-3 text-sm text-indigo-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                        onClick={handleLogout}
                      >
                        <div className="flex items-center">
                          <div className="bg-indigo-100 p-1.5 rounded-lg mr-3">
                            <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                          </div>
                          <span>Sign out</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden animate-fadeIn">
            <div className="px-3 pt-3 pb-4 space-y-1.5 sm:px-4 bg-gradient-to-r from-indigo-50 to-purple-50">
              {getNavLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-indigo-700 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:translate-x-1"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.name === 'Dashboard' && (
                    <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                  )}
                  {link.name === 'My Projects' && (
                    <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  )}
                  {link.name === 'Project Management' && (
                    <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                    </svg>
                  )}
                  {link.name === 'Post a Project' && (
                    <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  )}
                  {link.name === 'Analytics' && (
                    <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  )}
                  {link.name === 'My Bids' && (
                    <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )}
                  {link.name === 'Find Projects' && (
                    <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  )}
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-4 border-t border-indigo-100 bg-white">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-indigo-900">{user?.name}</div>
                  <div className="text-sm font-medium text-indigo-600">{user?.email}</div>
                </div>
              </div>
              <div className="mt-4 px-3 space-y-2">
                <Link
                  to={getProfilePath()}
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-indigo-700 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:translate-x-1"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="bg-indigo-100 p-1.5 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  Your Profile
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-indigo-700 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:translate-x-1"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="bg-indigo-100 p-1.5 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                  </div>
                  Messages
                </Link>
                <button
                  className="w-full text-left flex items-center px-4 py-3 rounded-lg text-base font-medium text-indigo-700 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:translate-x-1"
                  onClick={handleLogout}
                >
                  <div className="bg-indigo-100 p-1.5 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                  </div>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-indigo-100 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-4">
              <img src="/logo.png" alt="SkillSwap Logo" className="h-8 w-auto mr-2" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SkillSwap
              </span>
            </div>
            <p className="text-center text-sm text-indigo-600">
              &copy; {new Date().getFullYear()} SkillSwap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
