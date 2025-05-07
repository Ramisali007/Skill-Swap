import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const ScheduledNotificationsManager = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // Form data for creating a new scheduled notification
  const [formData, setFormData] = useState({
    templateId: '',
    recipients: [],
    recipientFilter: {
      roles: [],
      skills: []
    },
    data: {},
    scheduledFor: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // Default to 1 hour from now
    recurrence: {
      pattern: 'once',
      cronExpression: '',
      endDate: ''
    },
    channels: {
      email: true,
      sms: false,
      inApp: true
    }
  });

  // Fetch scheduled notifications
  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Fetching scheduled notifications with params:', { page, status: filterStatus });
      const res = await axios.get(`/api/notify/scheduled?page=${page}&status=${filterStatus}`);
      console.log('Scheduled notifications response:', res.data);

      if (res.data && res.data.scheduledNotifications) {
        setNotifications(res.data.scheduledNotifications);
        setPagination({
          currentPage: res.data.currentPage || 1,
          totalPages: res.data.totalPages || 1,
          total: res.data.total || 0
        });
      } else {
        setNotifications([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          total: 0
        });
        console.warn('No scheduled notifications found in response:', res.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
      // More detailed error handling
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        toast.error(`Failed to load scheduled notifications: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast.error('Failed to load scheduled notifications: No response from server');
      } else {
        toast.error(`Failed to load scheduled notifications: ${error.message}`);
      }
      setNotifications([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        total: 0
      });
      setLoading(false);
    }
  };

  // Fetch notification templates
  const fetchTemplates = async () => {
    try {
      console.log('Fetching notification templates');
      const res = await axios.get('/api/notify/templates');
      console.log('Templates response:', res.data);

      if (res.data && res.data.templates) {
        setTemplates(res.data.templates);
      } else {
        setTemplates([]);
        console.warn('No templates found in response:', res.data);
        toast.warning('No notification templates found. Please create templates first.');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      // More detailed error handling
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        toast.error(`Failed to load templates: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast.error('Failed to load templates: No response from server');
      } else {
        toast.error(`Failed to load templates: ${error.message}`);
      }
      setTemplates([]);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, [filterStatus]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: checked
      });
    }
  };

  // Handle role selection
  const handleRoleSelection = (role) => {
    const roles = [...formData.recipientFilter.roles];

    if (roles.includes(role)) {
      const index = roles.indexOf(role);
      roles.splice(index, 1);
    } else {
      roles.push(role);
    }

    setFormData({
      ...formData,
      recipientFilter: {
        ...formData.recipientFilter,
        roles
      }
    });
  };

  // Create a new scheduled notification
  const createScheduledNotification = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/api/notify/scheduled', formData);
      toast.success('Scheduled notification created successfully');
      setIsCreating(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error creating scheduled notification:', error);
      toast.error(error.response?.data?.message || 'Failed to create scheduled notification');
    }
  };

  // Cancel a scheduled notification
  const cancelNotification = async (id) => {
    try {
      await axios.put(`/api/notify/scheduled/${id}/cancel`);
      toast.success('Notification cancelled successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error cancelling notification:', error);
      toast.error('Failed to cancel notification');
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Render notification list
  const renderNotificationList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No scheduled notifications found</p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Schedule Notification
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled For
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recurrence
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Channels
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notifications.map((notification) => (
              <tr key={notification._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {notification.template?.name || 'Unknown Template'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {notification.template?.category || 'Unknown Category'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(notification.scheduledFor)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {notification.recurrence?.pattern === 'once' ?
                    'One-time' :
                    notification.recurrence?.pattern.charAt(0).toUpperCase() + notification.recurrence?.pattern.slice(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {notification.channels?.email && (
                      <EnvelopeIcon className="h-5 w-5 text-blue-500" title="Email" />
                    )}
                    {notification.channels?.sms && (
                      <DevicePhoneMobileIcon className="h-5 w-5 text-purple-500" title="SMS" />
                    )}
                    {notification.channels?.inApp && (
                      <BellIcon className="h-5 w-5 text-green-500" title="In-App" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(notification.status)}`}>
                    {notification.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {notification.status === 'scheduled' && (
                    <button
                      onClick={() => cancelNotification(notification._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchNotifications(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => fetchNotifications(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * 20 + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * 20, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => fetchNotifications(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => fetchNotifications(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === pagination.totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Scheduled Notifications</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage scheduled email, SMS, and in-app notifications
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Schedule Notification
          </button>
        )}
      </div>

      {/* Filter */}
      {!isCreating && (
        <div className="px-4 py-3 bg-gray-50 border-t border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">
              Status:
            </label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200">
        {isCreating ? (
          <form onSubmit={createScheduledNotification} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Template Selection */}
              <div className="sm:col-span-6">
                <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">
                  Notification Template
                </label>
                <select
                  id="templateId"
                  name="templateId"
                  value={formData.templateId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name} ({template.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Filter */}
              <div className="sm:col-span-6">
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700">Recipient Roles</legend>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="role-client"
                        type="checkbox"
                        checked={formData.recipientFilter.roles.includes('client')}
                        onChange={() => handleRoleSelection('client')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="role-client" className="ml-2 block text-sm text-gray-700">
                        Clients
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="role-freelancer"
                        type="checkbox"
                        checked={formData.recipientFilter.roles.includes('freelancer')}
                        onChange={() => handleRoleSelection('freelancer')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="role-freelancer" className="ml-2 block text-sm text-gray-700">
                        Freelancers
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="role-admin"
                        type="checkbox"
                        checked={formData.recipientFilter.roles.includes('admin')}
                        onChange={() => handleRoleSelection('admin')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="role-admin" className="ml-2 block text-sm text-gray-700">
                        Admins
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* Schedule Date/Time */}
              <div className="sm:col-span-3">
                <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700">
                  Schedule Date/Time
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="datetime-local"
                    name="scheduledFor"
                    id="scheduledFor"
                    value={formData.scheduledFor}
                    onChange={handleChange}
                    required
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Recurrence Pattern */}
              <div className="sm:col-span-3">
                <label htmlFor="recurrence.pattern" className="block text-sm font-medium text-gray-700">
                  Recurrence
                </label>
                <select
                  id="recurrence.pattern"
                  name="recurrence.pattern"
                  value={formData.recurrence.pattern}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="once">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Notification Channels */}
              <div className="sm:col-span-6">
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700">Notification Channels</legend>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="channels.email"
                        name="channels.email"
                        type="checkbox"
                        checked={formData.channels.email}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="channels.email" className="ml-2 block text-sm text-gray-700">
                        Email
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="channels.sms"
                        name="channels.sms"
                        type="checkbox"
                        checked={formData.channels.sms}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="channels.sms" className="ml-2 block text-sm text-gray-700">
                        SMS
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="channels.inApp"
                        name="channels.inApp"
                        type="checkbox"
                        checked={formData.channels.inApp}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="channels.inApp" className="ml-2 block text-sm text-gray-700">
                        In-App
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Schedule
              </button>
            </div>
          </form>
        ) : (
          renderNotificationList()
        )}
      </div>
    </div>
  );
};

export default ScheduledNotificationsManager;
