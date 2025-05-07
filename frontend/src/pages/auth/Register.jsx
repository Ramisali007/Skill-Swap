import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      // Handle regular fields
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear field error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Clear global error
    if (error) {
      clearError();
    }
  };

  // Validate form
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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Remove confirmPassword from data sent to API
        const { confirmPassword, ...registerData } = formData;

        console.log('Submitting registration data:', registerData);

        // Add a timeout to handle potential network issues
        const registerPromise = register(registerData);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Registration request timed out')), 10000)
        );

        // Race between the registration and timeout
        const result = await Promise.race([registerPromise, timeoutPromise]);
        console.log('Registration successful:', result);

        // Show success message
        setSuccess(true);
        setIsSubmitting(false);
      } catch (err) {
        console.error('Registration error in component:', err);
        setIsSubmitting(false);

        // Handle network errors
        if (err.message === 'Registration request timed out') {
          setErrors({
            ...errors,
            general: 'Registration request timed out. Please check your internet connection and try again.'
          });
          return;
        }

        if (!err.response) {
          setErrors({
            ...errors,
            general: 'Network error. Please check your internet connection and try again.'
          });
          return;
        }

        // Set specific field errors if available
        if (err.response?.data?.errors) {
          const serverErrors = err.response.data.errors;
          const fieldErrors = {};

          // Map server errors to form fields
          Object.keys(serverErrors).forEach(field => {
            fieldErrors[field] = serverErrors[field];
          });

          setErrors(prev => ({
            ...prev,
            ...fieldErrors
          }));
        } else if (err.response?.data?.error === 'duplicate_email') {
          setErrors({
            ...errors,
            email: 'This email is already registered. Please use a different email or try logging in.'
          });
        }

        // Error is also handled by the auth context for global errors
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-2xl p-8 transition-all duration-300 hover:shadow-indigo-300/30 animate-fadeIn">
          <div className="flex flex-col items-center">
            <img
              src="/logo.png"
              alt="SkillSwap Logo"
              className="h-20 w-auto mb-4"
            />
            <h2 className="mt-2 text-center text-3xl font-extrabold text-indigo-900">
              Registration Successful!
            </h2>
            <div className="mt-6 text-center">
              <div className="rounded-full bg-green-100 p-4 inline-flex shadow-md">
                <svg className="h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="mt-6 text-center text-md text-gray-700">
              Please check your email to verify your account.
            </p>
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-2xl p-8 transition-all duration-300 hover:shadow-indigo-300/30">
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="SkillSwap Logo"
            className="h-20 w-auto mb-4"
          />
          <h2 className="text-center text-3xl font-extrabold text-indigo-900">
            Join SkillSwap
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account to get started
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* Global error messages */}
          {(error || errors.general) && (
            <div className="rounded-md bg-red-50 p-4 border-l-4 border-red-500 animate-fadeIn">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error || errors.general}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  errors.name ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  errors.email ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  errors.phone ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Address Fields */}
            <div className="pt-2">
              <h3 className="text-sm font-medium text-indigo-800 mb-3 border-b border-indigo-100 pb-2">Address Information <span className="text-gray-400 text-xs">(optional)</span></h3>

              <div className="space-y-3">
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    id="address.street"
                    name="address.street"
                    type="text"
                    autoComplete="street-address"
                    value={formData.address.street}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-3 border ${
                      errors['address.street'] ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                    } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      id="address.city"
                      name="address.city"
                      type="text"
                      autoComplete="address-level2"
                      value={formData.address.city}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-3 py-3 border ${
                        errors['address.city'] ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                      } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      id="address.state"
                      name="address.state"
                      type="text"
                      autoComplete="address-level1"
                      value={formData.address.state}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-3 py-3 border ${
                        errors['address.state'] ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                      } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                      placeholder="State/Province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Zip/Postal Code
                    </label>
                    <input
                      id="address.zipCode"
                      name="address.zipCode"
                      type="text"
                      autoComplete="postal-code"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-3 py-3 border ${
                        errors['address.zipCode'] ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                      } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                      placeholder="Zip/Postal Code"
                    />
                  </div>

                  <div>
                    <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      id="address.country"
                      name="address.country"
                      type="text"
                      autoComplete="country-name"
                      value={formData.address.country}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-3 py-3 border ${
                        errors['address.country'] ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                      } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="pt-2">
              <h3 className="text-sm font-medium text-indigo-800 mb-3 border-b border-indigo-100 pb-2">Account Information</h3>

              <div className="space-y-3">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-3 border ${
                      errors.password ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                    } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-3 border ${
                      errors.confirmPassword ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                    } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    I want to
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-3 border ${
                      errors.role ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'
                    } placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all duration-200`}
                  >
                    <option value="client">Hire Freelancers (Client)</option>
                    <option value="freelancer">Work as a Freelancer</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-sm text-center pt-4">
            <p className="text-gray-600">
              By signing up, you agree to our{' '}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                Privacy Policy
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
