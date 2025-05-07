import { useState, useEffect } from 'react';
import axios from 'axios';

const EditUserForm = ({ userId, onClose, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    country: '',
    status: 'active'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/admin/users/${userId}`);
        const { user, profile } = response.data;

        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          phone: user.phone || '',
          country: user.address?.country || '',
          status: user.accountStatus || 'active'
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Update user data
      const response = await axios.put(`/api/admin/users/${userId}`, {
        name: formData.name,
        phone: formData.phone,
        country: formData.country,
        status: formData.status
      });

      console.log('User updated:', response.data);
      setSuccess(true);

      // Call the callback to update the parent component
      if (onUserUpdated) {
        onUserUpdated(response.data.user);
      }

      // Close the form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user. Please try again.');

      // Log detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          User updated successfully!
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
              Account Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditUserForm;
