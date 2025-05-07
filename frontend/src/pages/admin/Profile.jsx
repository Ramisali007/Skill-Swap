import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AdminProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { user, updateProfile, changePassword } = useAuth();

  // Load user data
  useEffect(() => {
    if (user) {
      // Simulate API call to get full profile
      setTimeout(() => {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: 'Platform administrator responsible for managing users, projects, and system operations.'
        });
      }, 500);
    }
  }, [user]);

  // Handle profile form input change
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
  };

  // Handle password form input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });

    // Clear field error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate profile form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Updated profile data:', formData);

        setSuccess(true);
        setIsSubmitting(false);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } catch (err) {
        console.error('Error updating profile:', err);
        setIsSubmitting(false);
      }
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (validatePasswordForm()) {
      setIsChangingPassword(true);
      setErrors({});

      try {
        // Call the real changePassword function from AuthContext
        const response = await changePassword(
          passwordData.currentPassword,
          passwordData.newPassword
        );

        console.log('Password change response:', response);

        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        setPasswordSuccess(true);
        setIsChangingPassword(false);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setPasswordSuccess(false);
        }, 3000);
      } catch (err) {
        console.error('Error changing password:', err);
        setIsChangingPassword(false);

        // Handle specific error cases
        if (err.response?.status === 401) {
          setErrors({
            currentPassword: 'Current password is incorrect'
          });
        } else {
          // Show general error message
          setErrors({
            general: err.response?.data?.message || 'Failed to change password. Please try again.'
          });
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-800 to-purple-800 shadow-xl overflow-hidden rounded-xl transform transition-all duration-300 hover:shadow-2xl">
        <div className="px-8 py-8 sm:px-10 relative">
          <div className="absolute inset-0 bg-white opacity-5 z-0"></div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full filter blur-2xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl shadow-lg mr-4">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Profile Settings</h1>
                <p className="mt-2 max-w-2xl text-base text-indigo-100">
                  Manage your administrator account information and platform settings.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 flex items-center">
                <UserCircleIcon className="h-5 w-5 text-indigo-200 mr-2" />
                <span className="text-white text-sm">{formData.name}</span>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-indigo-200 mr-2" />
                <span className="text-white text-sm">{formData.email}</span>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 flex items-center">
                <Cog6ToothIcon className="h-5 w-5 text-indigo-200 mr-2" />
                <span className="text-white text-sm">Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <nav className="flex">
            <button
              className={`py-5 px-8 text-center font-medium text-sm transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-white text-indigo-700 shadow-sm relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600'
                  : 'text-gray-600 hover:text-indigo-700 hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <div className="flex items-center justify-center">
                <div className={`p-1.5 rounded-lg mr-2 ${activeTab === 'profile' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <UserCircleIcon className={`h-5 w-5 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-500'}`} />
                </div>
                <span>Profile Information</span>
              </div>
            </button>
            <button
              className={`py-5 px-8 text-center font-medium text-sm transition-all duration-200 ${
                activeTab === 'security'
                  ? 'bg-white text-indigo-700 shadow-sm relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600'
                  : 'text-gray-600 hover:text-indigo-700 hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('security')}
            >
              <div className="flex items-center justify-center">
                <div className={`p-1.5 rounded-lg mr-2 ${activeTab === 'security' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <KeyIcon className={`h-5 w-5 ${activeTab === 'security' ? 'text-indigo-600' : 'text-gray-500'}`} />
                </div>
                <span>Security</span>
              </div>
            </button>
            <button
              className={`py-5 px-8 text-center font-medium text-sm transition-all duration-200 ${
                activeTab === 'notifications'
                  ? 'bg-white text-indigo-700 shadow-sm relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-600'
                  : 'text-gray-600 hover:text-indigo-700 hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <div className="flex items-center justify-center">
                <div className={`p-1.5 rounded-lg mr-2 ${activeTab === 'notifications' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <BellIcon className={`h-5 w-5 ${activeTab === 'notifications' ? 'text-indigo-600' : 'text-gray-500'}`} />
                </div>
                <span>Notifications</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="px-8 py-8 bg-white">
            {success && (
              <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-100 shadow-sm animate-fadeIn">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-1.5 shadow-sm">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-800">
                      Profile updated successfully!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <UserCircleIcon className="h-5 w-5 text-indigo-700" />
                </div>
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Update your personal information and how it appears across the platform.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
                {/* Name */}
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-indigo-700 mb-1.5 flex items-center">
                    <UserCircleIcon className="mr-1.5 h-4 w-4 text-indigo-600" />
                    Full Name
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pr-10 sm:text-sm border-gray-300 rounded-lg py-3 px-4 bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 ${
                        errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.name ? (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                  {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-indigo-700 mb-1.5 flex items-center">
                    <EnvelopeIcon className="mr-1.5 h-4 w-4 text-indigo-600" />
                    Email Address
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pr-10 sm:text-sm border-gray-300 rounded-lg py-3 px-4 bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 ${
                        errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.email ? (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                  {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-indigo-700 mb-1.5 flex items-center">
                    <PhoneIcon className="mr-1.5 h-4 w-4 text-indigo-600" />
                    Phone Number
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-indigo-700 mb-1.5 flex items-center">
                    <ShieldCheckIcon className="mr-1.5 h-4 w-4 text-indigo-600" />
                    Role
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="text"
                      value="Administrator"
                      disabled
                      className="block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="sm:col-span-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-indigo-700 mb-1.5 flex items-center">
                    <DocumentTextIcon className="mr-1.5 h-4 w-4 text-indigo-600" />
                    Bio
                  </label>
                  <div className="mt-1 rounded-lg shadow-sm">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={5}
                      value={formData.bio}
                      onChange={handleChange}
                      className="block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300"
                      placeholder="Tell us about your role as an administrator..."
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Brief description for your profile. URLs are hyperlinked.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="px-8 py-8 bg-white">
            {passwordSuccess && (
              <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-100 shadow-sm animate-fadeIn">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-1.5 shadow-sm">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-800">
                      Password changed successfully!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {errors.general && (
              <div className="mb-6 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 p-4 border border-red-100 shadow-sm animate-fadeIn">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-red-400 to-rose-400 rounded-full p-1.5 shadow-sm">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-800">
                      {errors.general}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <KeyIcon className="h-5 w-5 text-indigo-700" />
                </div>
                Security Settings
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage your password and account security settings.
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 mb-8 border border-indigo-100 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-lg">
                  <LockClosedIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-indigo-800">Password Security</h3>
                  <p className="mt-1 text-sm text-indigo-700">
                    Ensure your account is using a strong password to protect your administrator access. We recommend using a password manager to generate and store secure passwords.
                  </p>
                  <ul className="mt-3 list-disc list-inside text-xs text-indigo-700 space-y-1">
                    <li>Use at least 8 characters</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Include numbers and special characters</li>
                    <li>Avoid using easily guessable information</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-indigo-700 mb-1.5 flex items-center">
                    <KeyIcon className="mr-1.5 h-4 w-4 text-indigo-600" />
                    Current Password
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full pr-10 sm:text-sm border-gray-300 rounded-lg py-3 px-4 bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 ${
                        errors.currentPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.currentPassword ? (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                  {errors.currentPassword && <p className="mt-1.5 text-sm text-red-600">{errors.currentPassword}</p>}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-indigo-700 mb-1.5 flex items-center">
                    <LockClosedIcon className="mr-1.5 h-4 w-4 text-indigo-600" />
                    New Password
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full pr-10 sm:text-sm border-gray-300 rounded-lg py-3 px-4 bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 ${
                        errors.newPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.newPassword ? (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                  {errors.newPassword && <p className="mt-1.5 text-sm text-red-600">{errors.newPassword}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-700 mb-1.5 flex items-center">
                    <LockClosedIcon className="mr-1.5 h-4 w-4 text-indigo-600" />
                    Confirm New Password
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full pr-10 sm:text-sm border-gray-300 rounded-lg py-3 px-4 bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 ${
                        errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.confirmPassword ? (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                  {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isChangingPassword ? (
                    <>
                      <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notification Settings Tab */}
        {activeTab === 'notifications' && (
          <div className="px-8 py-8 bg-white">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <BellIcon className="h-5 w-5 text-indigo-700" />
                </div>
                Notification Settings
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Customize how and when you receive notifications from SkillSwap.
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 mb-8 border border-indigo-100 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-lg">
                  <BellIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-indigo-800">Notification Preferences</h3>
                  <p className="mt-1 text-sm text-indigo-700">
                    Configure your notification preferences to stay informed about important platform activities. As an administrator, you'll receive critical system alerts regardless of these settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Email Notifications */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-indigo-600 mr-2" />
                    <h3 className="text-base font-semibold text-indigo-900">Email Notifications</h3>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">System Alerts</p>
                      <p className="text-xs text-gray-600 mt-1">Receive notifications about system updates and maintenance</p>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          id="system-alerts"
                          name="system-alerts"
                          type="checkbox"
                          defaultChecked={true}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">User Management</p>
                      <p className="text-xs text-gray-600 mt-1">Notifications about new user registrations and verification requests</p>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          id="user-management"
                          name="user-management"
                          type="checkbox"
                          defaultChecked={true}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Project Updates</p>
                      <p className="text-xs text-gray-600 mt-1">Notifications about new projects and project status changes</p>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          id="project-updates"
                          name="project-updates"
                          type="checkbox"
                          defaultChecked={true}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* In-App Notifications */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-base font-semibold text-indigo-900">In-App Notifications</h3>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Dashboard Alerts</p>
                      <p className="text-xs text-gray-600 mt-1">Show alerts and notifications on your dashboard</p>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          id="dashboard-alerts"
                          name="dashboard-alerts"
                          type="checkbox"
                          defaultChecked={true}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Real-time Notifications</p>
                      <p className="text-xs text-gray-600 mt-1">Receive real-time notifications while using the platform</p>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          id="realtime-notifications"
                          name="realtime-notifications"
                          type="checkbox"
                          defaultChecked={true}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
