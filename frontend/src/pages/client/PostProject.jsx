import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const PostProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: '',
    budget: '',
    deadline: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle input change
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.budget) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(formData.budget) || Number(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
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
        // Format skills as an array
        const formattedData = {
          ...formData,
          skills: formData.skills.split(',').map(skill => skill.trim()),
          budget: Number(formData.budget)
        };

        // Make real API call to create project
        const response = await axios.post('/api/projects', formattedData);

        console.log('Project created:', response.data);

        setSuccess(true);
        setIsSubmitting(false);

        // Redirect to projects page after 2 seconds
        setTimeout(() => {
          navigate('/client/projects');
        }, 2000);
      } catch (err) {
        console.error('Error posting project:', err.response?.data || err.message);
        setIsSubmitting(false);
      }
    }
  };

  // Categories for dropdown
  const categories = [
    'Web Development',
    'Mobile App Development',
    'UI/UX Design',
    'Graphic Design',
    'Content Writing',
    'Digital Marketing',
    'Data Entry',
    'Virtual Assistant',
    'Translation',
    'Other'
  ];

  if (success) {
    return (
      <div className="bg-white shadow-lg overflow-hidden rounded-xl p-8 max-w-3xl mx-auto animate-fadeIn">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-md">
            <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">Project Posted Successfully!</h3>
          <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-100 inline-block">
            <p className="text-base text-green-700">
              Your project has been posted and is now visible to freelancers.
            </p>
          </div>
          <div className="mt-6">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting to your projects...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg overflow-hidden rounded-xl max-w-4xl mx-auto">
      <div className="px-6 py-6 sm:px-8 bg-gradient-to-r from-indigo-700 to-purple-700">
        <h1 className="text-xl leading-6 font-bold text-white flex items-center">
          <svg className="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Post a New Project
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-indigo-100">
          Fill out the form below to post your project and start receiving bids from freelancers.
        </p>
      </div>

      <div className="border-t border-indigo-100 bg-white">
        <form onSubmit={handleSubmit} className="px-6 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Project Title */}
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Project Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                    errors.title ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                  }`}
                  placeholder="e.g., Website Redesign for E-commerce Store"
                />
                {errors.title && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {errors.title}
                  </p>
                )}
              </div>
            </div>

            {/* Project Description */}
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
                </svg>
                Project Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                    errors.description ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                  }`}
                  placeholder="Describe your project in detail..."
                />
                {errors.description && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {errors.description}
                  </p>
                )}
              </div>
              <p className="mt-2 text-sm text-indigo-500 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 inline-block">
                <svg className="inline-block mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Be specific about your requirements, deliverables, and expectations.
              </p>
            </div>

            {/* Category */}
            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                Category
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                    errors.category ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="sm:col-span-3">
              <label htmlFor="skills" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Required Skills
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="skills"
                  id="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 hover:border-indigo-300"
                  placeholder="e.g., React, Node.js, UI Design"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600 flex items-center">
                <svg className="mr-1.5 h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Separate skills with commas
              </p>
            </div>

            {/* Budget */}
            <div className="sm:col-span-3">
              <label htmlFor="budget" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Budget ($)
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-indigo-500 sm:text-sm font-medium">$</span>
                </div>
                <input
                  type="number"
                  name="budget"
                  id="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-lg py-2.5 transition-colors duration-200 ${
                    errors.budget ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                  }`}
                  placeholder="0.00"
                  min="1"
                  step="1"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-indigo-500 sm:text-sm font-medium">USD</span>
                </div>
              </div>
              {errors.budget && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                  <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {errors.budget}
                </p>
              )}
            </div>

            {/* Deadline */}
            <div className="sm:col-span-3">
              <label htmlFor="deadline" className="block text-sm font-medium text-indigo-700 mb-1 flex items-center">
                <svg className="mr-1.5 h-4 w-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Deadline
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="deadline"
                  id="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                    errors.deadline ? 'border-red-300 bg-red-50' : 'hover:border-indigo-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.deadline && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center">
                    <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {errors.deadline}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/client/dashboard')}
              className="bg-white py-2.5 px-5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Cancel
              </div>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2.5 px-5 border border-transparent shadow-md text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting Project...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Post Project
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostProject;
