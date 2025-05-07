import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const EditProject = () => {
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
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);

      try {
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();

        // Make real API call to fetch project data
        const response = await axios.get(`/api/projects/${id}?_=${timestamp}`);
        console.log('Project data:', response.data);

        if (!response.data || !response.data.project) {
          throw new Error('Invalid project data received');
        }

        const projectData = response.data.project;

        // Format the date to YYYY-MM-DD for the date input
        const deadlineDate = new Date(projectData.deadline);
        const formattedDeadline = deadlineDate.toISOString().split('T')[0];

        setFormData({
          title: projectData.title,
          description: projectData.description,
          category: projectData.category,
          skills: projectData.skills.join(', '),
          budget: projectData.budget,
          deadline: formattedDeadline
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

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

        // Make real API call to update project
        const response = await axios.put(`/api/projects/${id}`, formattedData);
        console.log('Updated project data:', response.data);

        setSuccess(true);
        setIsSubmitting(false);

        // Redirect to projects page after 2 seconds
        setTimeout(() => {
          navigate('/client/projects');
        }, 2000);
      } catch (err) {
        console.error('Error updating project:', err.response?.data || err.message);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Project Updated Successfully!</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your project has been updated.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Redirecting to your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-lg leading-6 font-medium text-gray-900">Edit Project</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Update your project details below.
        </p>
      </div>

      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Project Title */}
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Project Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.title ? 'border-red-300' : ''
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
            </div>

            {/* Project Description */}
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Project Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.category ? 'border-red-300' : ''
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
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="sm:col-span-3">
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Required Skills
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="skills"
                  id="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., React, Node.js, UI Design"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Separate skills with commas
              </p>
            </div>

            {/* Budget */}
            <div className="sm:col-span-3">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                Budget ($)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="budget"
                  id="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                    errors.budget ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                  min="1"
                  step="1"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
              )}
            </div>

            {/* Deadline */}
            <div className="sm:col-span-3">
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                Deadline
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="deadline"
                  id="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.deadline ? 'border-red-300' : ''
                  }`}
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/client/projects')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;
