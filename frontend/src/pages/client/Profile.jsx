import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ClientProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

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
          company: 'Acme Inc.',
          website: 'www.acmeinc.com',
          bio: 'We are a company specializing in innovative solutions for businesses.'
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
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
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

    if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[-()\s]/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
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

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
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

      try {
        // Call the actual changePassword function from AuthContext
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

        // Show error message if available
        if (err.response?.data?.message) {
          setPasswordErrors({
            ...passwordErrors,
            general: err.response.data.message
          });
        } else {
          setPasswordErrors({
            ...passwordErrors,
            general: 'Failed to change password. Please try again.'
          });
        }

        // Clear error message after 5 seconds
        setTimeout(() => {
          setPasswordErrors({
            ...passwordErrors,
            general: ''
          });
        }, 5000);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-6 sm:px-8 relative">
          <div className="absolute inset-0 bg-white opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h1 className="text-2xl leading-6 font-bold text-white">Profile Settings</h1>
            </div>
            <p className="mt-2 max-w-2xl text-base text-indigo-100">
              Manage your account information and settings to enhance your SkillSwap experience.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-indigo-100 bg-white">
          <nav className="flex px-6 sm:px-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                  : 'border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm mr-2 transition-all duration-200 rounded-t-lg flex items-center`}
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`${
                activeTab === 'password'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                  : 'border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm mr-2 transition-all duration-200 rounded-t-lg flex items-center`}
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Change Password
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                  : 'border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg flex items-center`}
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              Notification Settings
            </button>
          </nav>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="px-6 py-6 sm:p-8 bg-white">
            {success && (
              <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-100 shadow-sm animate-fadeIn">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-1">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-green-800">
                      Profile updated successfully!
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Your profile information has been saved and is now visible to others.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Name */}
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center">
                        <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center">
                        <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center">
                        <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company */}
                <div className="sm:col-span-3">
                  <label htmlFor="company" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Company
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 hover:border-indigo-300"
                      placeholder="Your company name"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="sm:col-span-3">
                  <label htmlFor="website" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                    </svg>
                    Website
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">https://</span>
                    </div>
                    <input
                      type="text"
                      name="website"
                      id="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 pl-16 pr-3 transition-colors duration-200 hover:border-indigo-300"
                      placeholder="www.example.com"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="sm:col-span-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
                    </svg>
                    Bio
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={5}
                      value={formData.bio}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 hover:border-indigo-300"
                      placeholder="Tell us about you or your company..."
                    />
                  </div>
                  <p className="mt-2 text-sm text-indigo-500 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 inline-block">
                    <svg className="inline-block mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Brief description about you or your company. This will be visible to freelancers.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center py-2.5 px-5 border border-transparent shadow-md text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="px-6 py-6 sm:p-8 bg-white">
            {passwordSuccess && (
              <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-100 shadow-sm animate-fadeIn">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-1">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-green-800">
                      Password changed successfully!
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Your password has been updated. You'll use this new password the next time you log in.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-indigo-700">
                    For security reasons, please enter your current password to make any changes.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* General error message */}
              {passwordErrors.general && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100 shadow-sm animate-fadeIn">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="bg-red-400 rounded-full p-1">
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{passwordErrors.general}</h3>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Current Password */}
                <div className="sm:col-span-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    Current Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                        passwordErrors.currentPassword ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                      }`}
                      placeholder="Enter your current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center">
                        <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* New Password */}
                <div className="sm:col-span-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                    </svg>
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                        passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                      }`}
                      placeholder="Enter your new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center">
                        <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {passwordErrors.newPassword}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-indigo-500">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="sm:col-span-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                        passwordErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center">
                        <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="ml-3 inline-flex justify-center py-2.5 px-5 border border-transparent shadow-md text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isChangingPassword ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Changing...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                      </svg>
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notification Settings Tab */}
        {activeTab === 'notifications' && (
          <div className="px-6 py-6 sm:p-8 bg-white">
            <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-indigo-700">
                    Customize how and when you receive notifications from SkillSwap.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                <div className="px-4 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <h3 className="text-base font-bold text-indigo-900">Email Notifications</h3>
                  </div>
                </div>
                <div className="p-4 space-y-5">
                  <div className="flex items-start hover:bg-indigo-50/50 p-2 rounded-lg transition-colors duration-150">
                    <div className="flex items-center h-5">
                      <input
                        id="new_bids"
                        name="new_bids"
                        type="checkbox"
                        defaultChecked
                        className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="new_bids" className="font-medium text-gray-900 text-sm">New bids on your projects</label>
                      <p className="text-gray-600 text-xs mt-1">Get notified when a freelancer places a bid on your project.</p>
                    </div>
                  </div>

                  <div className="flex items-start hover:bg-indigo-50/50 p-2 rounded-lg transition-colors duration-150">
                    <div className="flex items-center h-5">
                      <input
                        id="messages"
                        name="messages"
                        type="checkbox"
                        defaultChecked
                        className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="messages" className="font-medium text-gray-900 text-sm">New messages</label>
                      <p className="text-gray-600 text-xs mt-1">Get notified when you receive a new message.</p>
                    </div>
                  </div>

                  <div className="flex items-start hover:bg-indigo-50/50 p-2 rounded-lg transition-colors duration-150">
                    <div className="flex items-center h-5">
                      <input
                        id="project_updates"
                        name="project_updates"
                        type="checkbox"
                        defaultChecked
                        className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="project_updates" className="font-medium text-gray-900 text-sm">Project updates</label>
                      <p className="text-gray-600 text-xs mt-1">Get notified about updates to your projects.</p>
                    </div>
                  </div>

                  <div className="flex items-start hover:bg-indigo-50/50 p-2 rounded-lg transition-colors duration-150">
                    <div className="flex items-center h-5">
                      <input
                        id="marketing"
                        name="marketing"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="marketing" className="font-medium text-gray-900 text-sm">Marketing emails</label>
                      <p className="text-gray-600 text-xs mt-1">Receive tips, product updates, and other marketing communications.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                <div className="px-4 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <h3 className="text-base font-bold text-indigo-900">SMS Notifications</h3>
                  </div>
                </div>
                <div className="p-4 space-y-5">
                  <div className="flex items-start hover:bg-indigo-50/50 p-2 rounded-lg transition-colors duration-150">
                    <div className="flex items-center h-5">
                      <input
                        id="sms_messages"
                        name="sms_messages"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="sms_messages" className="font-medium text-gray-900 text-sm">New messages</label>
                      <p className="text-gray-600 text-xs mt-1">Get SMS notifications for new messages.</p>
                    </div>
                  </div>

                  <div className="flex items-start hover:bg-indigo-50/50 p-2 rounded-lg transition-colors duration-150">
                    <div className="flex items-center h-5">
                      <input
                        id="sms_bids"
                        name="sms_bids"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="sms_bids" className="font-medium text-gray-900 text-sm">New bids</label>
                      <p className="text-gray-600 text-xs mt-1">Get SMS notifications for new bids on your projects.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center py-2.5 px-5 border border-transparent shadow-md text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
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

export default ClientProfile;
