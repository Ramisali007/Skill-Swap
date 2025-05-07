import { useState } from 'react';
import axios from 'axios';

const AddUserForm = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    phone: '',
    country: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      console.log('Submitting user data:', formData);
      const response = await axios.post('/api/admin/users', formData);
      console.log('User created:', response.data);
      setSuccess(true);

      // Call the callback to update the parent component
      if (onUserAdded) {
        onUserAdded(response.data.user);
      }

      // Reset form after successful submission
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 2000);
    } catch (err) {
      console.error('Error creating user:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);

      // Show detailed error message
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Error creating user. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
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
          User created successfully!
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
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              minLength={6}
            />
            <p className="text-gray-500 text-xs mt-1">Password must be at least 6 characters long</p>
          </div>

          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
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

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddUserForm;
