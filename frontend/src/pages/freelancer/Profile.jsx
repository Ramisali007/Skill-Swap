import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProfileCompleteness from '../../components/freelancer/ProfileCompleteness';
import SkillsManager from '../../components/freelancer/SkillsManager';
import PortfolioManager from '../../components/freelancer/PortfolioManager';
import NotificationPreferences from '../../components/notifications/NotificationPreferences';

const FreelancerProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    hourlyRate: '',
    bio: '',
    availability: {
      status: 'Available',
      hoursPerWeek: 40
    },
    categories: []
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [completeness, setCompleteness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    new_projects: true,
    messages: true,
    bid_updates: true,
    marketing: false,
    sms_messages: false,
    sms_bids: false
  });

  const { user, updateProfile, changePassword } = useAuth();

  // Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch freelancer profile
        const response = await axios.get('/api/freelancer/profile');
        const profileData = response.data.profile;

        setProfile(profileData);

        // Set form data
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          title: profileData.title || '',
          hourlyRate: profileData.hourlyRate || '',
          bio: profileData.bio || '',
          availability: profileData.availability || {
            status: 'Available',
            hoursPerWeek: 40
          },
          categories: profileData.categories || []
        });

        // Set other profile data
        setSkills(profileData.skills || []);
        setPortfolio(profileData.portfolio || []);
        setEducation(profileData.education || []);
        setWorkExperience(profileData.workExperience || []);
        setLanguages(profileData.languages || []);
        setCertifications(profileData.certifications || []);

        // Fetch profile completeness
        const completenessResponse = await axios.get('/api/freelancer/profile/completeness');
        setCompleteness(completenessResponse.data.completeness);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');

        // Set default data if API fails
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          title: '',
          hourlyRate: '',
          bio: '',
          availability: {
            status: 'Available',
            hoursPerWeek: 40
          },
          categories: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

    if (!formData.title.trim()) {
      newErrors.title = 'Professional title is required';
    }

    if (!formData.hourlyRate.trim()) {
      newErrors.hourlyRate = 'Hourly rate is required';
    } else if (isNaN(formData.hourlyRate) || Number(formData.hourlyRate) <= 0) {
      newErrors.hourlyRate = 'Hourly rate must be a positive number';
    }

    if (!formData.skills.trim()) {
      newErrors.skills = 'Skills are required';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
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
        // Send data to backend
        const response = await axios.put('/api/freelancer/profile', {
          name: formData.name,
          phone: formData.phone,
          title: formData.title,
          bio: formData.bio,
          hourlyRate: parseFloat(formData.hourlyRate),
          availability: formData.availability,
          categories: formData.categories
        });

        // Update local state with response data
        const updatedProfile = response.data.profile;
        setProfile(updatedProfile);

        // Update completeness
        if (response.data.completeness) {
          setCompleteness(response.data.completeness);
        }

        setSuccess(true);
        toast.success('Profile updated successfully!');

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } catch (err) {
        console.error('Error updating profile:', err);
        toast.error(err.response?.data?.message || 'Failed to update profile');
      } finally {
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

  // Handle notification preferences changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPreferences({
      ...notificationPreferences,
      [name]: checked
    });
  };

  // Handle saving notification preferences
  const handleSaveNotificationPreferences = async () => {
    try {
      // Simulate API call to save notification preferences
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Saved notification preferences:', notificationPreferences);

      // Show success message
      setNotificationSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setNotificationSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-blue-600 shadow-lg overflow-hidden sm:rounded-xl">
        <div className="px-8 py-8 sm:px-10 relative">
          <div className="relative z-10">
            <div className="flex items-center">
              <div className="bg-white/20 p-2.5 rounded-lg mr-4">
                <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl leading-6 font-bold text-white">Freelancer Profile</h1>
                <p className="mt-3 max-w-2xl text-base text-white">
                  Showcase your skills and experience to attract potential clients.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-blue-100 bg-white">
          <nav className="flex px-6 sm:px-8 pt-2 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-700 bg-gradient-to-b from-blue-50 to-blue-100/50 shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              } whitespace-nowrap py-4 px-5 border-b-2 font-medium text-sm mr-3 transition-all duration-200 rounded-t-lg flex items-center transform hover:translate-y-[-2px]`}
            >
              <div className={`${activeTab === 'profile' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} p-1.5 rounded-md mr-2 transition-colors duration-200`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`${
                activeTab === 'skills'
                  ? 'border-blue-600 text-blue-700 bg-gradient-to-b from-blue-50 to-blue-100/50 shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              } whitespace-nowrap py-4 px-5 border-b-2 font-medium text-sm mr-3 transition-all duration-200 rounded-t-lg flex items-center transform hover:translate-y-[-2px]`}
            >
              <div className={`${activeTab === 'skills' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} p-1.5 rounded-md mr-2 transition-colors duration-200`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              Skills
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`${
                activeTab === 'portfolio'
                  ? 'border-blue-600 text-blue-700 bg-gradient-to-b from-blue-50 to-blue-100/50 shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              } whitespace-nowrap py-4 px-5 border-b-2 font-medium text-sm mr-3 transition-all duration-200 rounded-t-lg flex items-center transform hover:translate-y-[-2px]`}
            >
              <div className={`${activeTab === 'portfolio' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} p-1.5 rounded-md mr-2 transition-colors duration-200`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`${
                activeTab === 'password'
                  ? 'border-blue-600 text-blue-700 bg-gradient-to-b from-blue-50 to-blue-100/50 shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              } whitespace-nowrap py-4 px-5 border-b-2 font-medium text-sm mr-3 transition-all duration-200 rounded-t-lg flex items-center transform hover:translate-y-[-2px]`}
            >
              <div className={`${activeTab === 'password' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} p-1.5 rounded-md mr-2 transition-colors duration-200`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              Change Password
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-700 bg-gradient-to-b from-blue-50 to-blue-100/50 shadow-sm'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30'
              } whitespace-nowrap py-4 px-5 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg flex items-center transform hover:translate-y-[-2px]`}
            >
              <div className={`${activeTab === 'notifications' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} p-1.5 rounded-md mr-2 transition-colors duration-200`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </div>
              Notification Settings
            </button>
          </nav>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="px-8 py-8 sm:p-10 bg-white rounded-b-xl">
            {success && (
              <div className="mb-6 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 p-5 border border-teal-100 shadow-md animate-fadeIn transform transition-all duration-300 hover:shadow-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full p-2 shadow-inner">
                      <svg className="h-6 w-6 text-white drop-shadow-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-teal-800">
                      Profile updated successfully!
                    </p>
                    <p className="mt-1 text-sm text-teal-700">
                      Your profile information has been saved and is now visible to potential clients.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Completeness Indicator */}
            {completeness && (
              <div className="mb-6">
                <ProfileCompleteness profile={profile} />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-blue-600">Loading profile data...</span>
              </div>
            ) : (

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Name */}
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    Full Name
                  </label>
                  <div className="mt-1.5 relative group">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'hover:border-blue-300 group-hover:shadow-md'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                        <svg className="mr-1.5 h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    Email Address
                  </label>
                  <div className="mt-1.5 relative group">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'hover:border-blue-300 group-hover:shadow-md'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                        <svg className="mr-1.5 h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                    Phone Number
                  </label>
                  <div className="mt-1.5 relative group">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'hover:border-blue-300 group-hover:shadow-md'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                        <svg className="mr-1.5 h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Title */}
                <div className="sm:col-span-3">
                  <label htmlFor="title" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    Professional Title
                  </label>
                  <div className="mt-1.5 relative group">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${
                        errors.title ? 'border-red-300 bg-red-50' : 'hover:border-blue-300 group-hover:shadow-md'
                      }`}
                      placeholder="e.g., Full Stack Developer"
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                        <svg className="mr-1.5 h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{errors.title}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="sm:col-span-3">
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    Hourly Rate ($)
                  </label>
                  <div className="mt-1.5 relative rounded-lg shadow-sm group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-blue-500 font-medium sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      name="hourlyRate"
                      id="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 pr-24 sm:text-sm border-gray-300 rounded-lg py-3 transition-all duration-200 ${
                        errors.hourlyRate ? 'border-red-300 bg-red-50' : 'hover:border-blue-300 group-hover:shadow-md'
                      }`}
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-blue-500 font-medium sm:text-sm">USD / hour</span>
                    </div>
                  </div>
                  {errors.hourlyRate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                      <svg className="mr-1.5 h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{errors.hourlyRate}</span>
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div className="sm:col-span-6">
                  <label htmlFor="skills" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>
                    Skills
                  </label>
                  <div className="mt-1.5 relative group">
                    <input
                      type="text"
                      name="skills"
                      id="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${
                        errors.skills ? 'border-red-300 bg-red-50' : 'hover:border-blue-300 group-hover:shadow-md'
                      }`}
                      placeholder="e.g., React, Node.js, JavaScript"
                    />
                    {errors.skills && (
                      <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                        <svg className="mr-1.5 h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{errors.skills}</span>
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 inline-block">
                    <svg className="inline-block mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Separate skills with commas. Add your most relevant skills to attract clients.
                  </p>
                </div>

                {/* Bio */}
                <div className="sm:col-span-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
                      </svg>
                    </div>
                    Bio
                  </label>
                  <div className="mt-1.5 relative group">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${
                        errors.bio ? 'border-red-300 bg-red-50' : 'hover:border-blue-300 group-hover:shadow-md'
                      }`}
                      placeholder="Tell clients about yourself and your expertise..."
                    />
                    {errors.bio && (
                      <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                        <svg className="mr-1.5 h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{errors.bio}</span>
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 inline-block">
                    <svg className="inline-block mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    A compelling bio helps clients understand your expertise and approach to work.
                  </p>
                </div>

                {/* Education */}
                <div className="sm:col-span-6">
                  <label htmlFor="education" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    Education
                  </label>
                  <div className="mt-1.5 relative group">
                    <textarea
                      id="education"
                      name="education"
                      rows={3}
                      value={formData.education}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 hover:border-blue-300 group-hover:shadow-md"
                      placeholder="Your educational background..."
                    />
                  </div>
                </div>

                {/* Experience */}
                <div className="sm:col-span-6">
                  <label htmlFor="experience" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    Work Experience
                  </label>
                  <div className="mt-1.5 relative group">
                    <textarea
                      id="experience"
                      name="experience"
                      rows={3}
                      value={formData.experience}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 hover:border-blue-300 group-hover:shadow-md"
                      placeholder="Your work experience..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center py-2.5 px-5 border border-transparent shadow-md text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="px-8 py-8 sm:p-10 bg-white rounded-b-xl">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-blue-600">Loading skills data...</span>
              </div>
            ) : (
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Your Skills</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Add your skills to showcase your expertise to potential clients. The more detailed your skills are, the more likely you are to be found by clients looking for your specific expertise.
                </p>

                <SkillsManager
                  skills={skills}
                  onUpdate={(updatedSkills) => {
                    setSkills(updatedSkills);
                    // Refresh profile completeness
                    axios.get('/api/freelancer/profile/completeness')
                      .then(response => setCompleteness(response.data.completeness))
                      .catch(error => console.error('Error fetching completeness:', error));
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="px-8 py-8 sm:p-10 bg-white rounded-b-xl">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-blue-600">Loading portfolio data...</span>
              </div>
            ) : (
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Your Portfolio</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Showcase your best work to potential clients. A strong portfolio significantly increases your chances of getting hired.
                </p>

                <PortfolioManager
                  portfolioItems={portfolio}
                  onUpdate={(updatedPortfolio) => {
                    setPortfolio(updatedPortfolio);
                    // Refresh profile completeness
                    axios.get('/api/freelancer/profile/completeness')
                      .then(response => setCompleteness(response.data.completeness))
                      .catch(error => console.error('Error fetching completeness:', error));
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="px-8 py-8 sm:p-10 bg-white rounded-b-xl">
            {passwordSuccess && (
              <div className="mb-6 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 p-5 border border-teal-100 shadow-md animate-fadeIn transform transition-all duration-300 hover:shadow-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full p-2 shadow-inner">
                      <svg className="h-6 w-6 text-white drop-shadow-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-teal-800">
                      Password changed successfully!
                    </p>
                    <p className="mt-1 text-sm text-teal-700">
                      Your password has been updated. You'll use this new password the next time you log in.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      For security reasons, please enter your current password to make any changes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Current Password */}
                <div className="sm:col-span-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    Current Password
                  </label>
                  <div className="mt-1.5 relative group">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${
                        passwordErrors.currentPassword ? 'border-red-300 bg-red-50' : 'hover:border-blue-300 group-hover:shadow-md'
                      }`}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                        <svg className="mr-1.5 h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{passwordErrors.currentPassword}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* New Password */}
                <div className="sm:col-span-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                      </svg>
                    </div>
                    New Password
                  </label>
                  <div className="mt-1.5 relative group">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${
                        passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'hover:border-blue-300 group-hover:shadow-md'
                      }`}
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                        <svg className="mr-1.5 h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{passwordErrors.newPassword}</span>
                      </p>
                    )}
                    <p className="mt-1 text-xs text-blue-500">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="sm:col-span-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-700 mb-1.5 flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-md mr-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    Confirm New Password
                  </label>
                  <div className="mt-1.5 relative group">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg py-3 px-4 transition-all duration-200 ${
                        passwordErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'hover:border-blue-300 group-hover:shadow-md'
                      }`}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                        <svg className="mr-1.5 h-4 w-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{passwordErrors.confirmPassword}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="ml-3 inline-flex justify-center py-2.5 px-5 border border-transparent shadow-md text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
          <div className="px-8 py-8 sm:p-10 bg-white rounded-b-xl">
            <NotificationPreferences />
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerProfile;
