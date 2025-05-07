import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const NotificationTemplateManager = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email',
    subject: '',
    content: '',
    category: 'system',
    isActive: true,
    variables: []
  });
  const [currentVariable, setCurrentVariable] = useState({ name: '', description: '' });
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, [page, filterType, filterCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);

      if (filterType) params.append('type', filterType);
      if (filterCategory) params.append('category', filterCategory);

      console.log('Fetching templates with params:', params.toString());
      const response = await axios.get(`/api/notify/templates?${params.toString()}`);
      console.log('Templates response:', response.data);

      if (response.data && response.data.templates) {
        setTemplates(response.data.templates);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setTemplates([]);
        setTotalPages(1);
        console.warn('No templates found in response:', response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        toast.error(`Failed to load templates: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        toast.error('Failed to load templates: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(`Failed to load templates: ${error.message}`);
      }
      setTemplates([]);
      setTotalPages(1);
      setLoading(false);
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle variable input change
  const handleVariableChange = (e) => {
    const { name, value } = e.target;
    setCurrentVariable({
      ...currentVariable,
      [name]: value
    });
  };

  // Add variable to the list
  const addVariable = () => {
    if (!currentVariable.name.trim()) {
      toast.error('Variable name is required');
      return;
    }

    setFormData({
      ...formData,
      variables: [...formData.variables, { ...currentVariable }]
    });

    setCurrentVariable({ name: '', description: '' });
  };

  // Remove variable from the list
  const removeVariable = (index) => {
    const updatedVariables = [...formData.variables];
    updatedVariables.splice(index, 1);

    setFormData({
      ...formData,
      variables: updatedVariables
    });
  };

  // Edit template
  const editTemplate = (template) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      type: template.type,
      subject: template.subject || '',
      content: template.content,
      category: template.category,
      isActive: template.isActive,
      variables: template.variables || []
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Create new template
  const createTemplate = () => {
    setCurrentTemplate(null);
    setFormData({
      name: '',
      description: '',
      type: 'email',
      subject: '',
      content: '',
      category: 'system',
      isActive: true,
      variables: []
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  // Duplicate template
  const duplicateTemplate = (template) => {
    setCurrentTemplate(null);
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description,
      type: template.type,
      subject: template.subject || '',
      content: template.content,
      category: template.category,
      isActive: true,
      variables: template.variables || []
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  // Delete template
  const deleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await axios.delete(`/api/notify/templates/${id}`);
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  // Save template
  const saveTemplate = async (e) => {
    e.preventDefault();

    try {
      if (isCreating) {
        await axios.post('/api/notify/templates', formData);
        toast.success('Template created successfully');
      } else if (isEditing && currentTemplate) {
        await axios.put(`/api/notify/templates/${currentTemplate._id}`, formData);
        toast.success('Template updated successfully');
      }

      setIsCreating(false);
      setIsEditing(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(error.response?.data?.message || 'Failed to save template');
    }
  };

  // Cancel editing/creating
  const cancelEdit = () => {
    setIsEditing(false);
    setIsCreating(false);
    setCurrentTemplate(null);
  };

  // Render template list
  const renderTemplateList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (templates.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found</p>
          <button
            onClick={createTemplate}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create Template
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
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr key={template._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <div className="text-sm text-gray-500">{template.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    template.type === 'email' ? 'bg-blue-100 text-blue-800' :
                    template.type === 'sms' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {template.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {template.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {template.isActive ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => editTemplate(template)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => duplicateTemplate(template)}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{templates.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages).keys()].map((i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === i + 1
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
      </div>
    );
  };

  // Render template form
  const renderTemplateForm = () => {
    return (
      <form onSubmit={saveTemplate} className="space-y-6">
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {isCreating ? 'Create Template' : 'Edit Template'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isCreating
                  ? 'Create a new notification template'
                  : 'Edit the selected notification template'}
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                {/* Template Name */}
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Template Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                {/* Template Type */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="inApp">In-App</option>
                  </select>
                </div>

                {/* Template Category */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="project">Project</option>
                    <option value="bid">Bid</option>
                    <option value="message">Message</option>
                    <option value="payment">Payment</option>
                    <option value="review">Review</option>
                    <option value="verification">Verification</option>
                    <option value="system">System</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                {/* Template Description */}
                <div className="col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                {/* Email Subject (only for email type) */}
                {formData.type === 'email' && (
                  <div className="col-span-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                )}

                {/* Template Content */}
                <div className="col-span-6">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={6}
                    value={formData.content}
                    onChange={handleChange}
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder={formData.type === 'email' ? '<h1>Hello {{recipientName}}</h1><p>Your content here</p>' : 'Hello {{recipientName}}, your content here'}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Use double curly braces for variables, e.g., {'{{'} + 'recipientName' + '}}'}
                  </p>
                </div>

                {/* Template Variables */}
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Variables
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="name"
                      value={currentVariable.name}
                      onChange={handleVariableChange}
                      placeholder="Variable name"
                      className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                    />
                    <input
                      type="text"
                      name="description"
                      value={currentVariable.description}
                      onChange={handleVariableChange}
                      placeholder="Description"
                      className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none sm:text-sm border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={addVariable}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add
                    </button>
                  </div>

                  {/* Variable List */}
                  {formData.variables.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Defined Variables:</h4>
                      <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                        {formData.variables.map((variable, index) => (
                          <li key={index} className="px-4 py-3 flex items-center justify-between text-sm">
                            <div className="flex-1">
                              <span className="font-medium text-indigo-600">{'{{'}{variable.name}{'}}'}</span>
                              {variable.description && (
                                <span className="ml-2 text-gray-500">- {variable.description}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariable(index)}
                              className="ml-2 text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Active Status */}
                <div className="col-span-6">
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={cancelEdit}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Notification Templates</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage email, SMS, and in-app notification templates
          </p>
        </div>
        {!isEditing && !isCreating && (
          <button
            onClick={createTemplate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create Template
          </button>
        )}
      </div>

      {!isEditing && !isCreating && (
        <div className="px-4 py-3 bg-gray-50 sm:px-6 flex flex-wrap gap-4">
          <div>
            <label htmlFor="filterType" className="block text-sm font-medium text-gray-700">
              Filter by Type
            </label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="inApp">In-App</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700">
              Filter by Category
            </label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Categories</option>
              <option value="project">Project</option>
              <option value="bid">Bid</option>
              <option value="message">Message</option>
              <option value="payment">Payment</option>
              <option value="review">Review</option>
              <option value="verification">Verification</option>
              <option value="system">System</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200">
        {isEditing || isCreating ? renderTemplateForm() : renderTemplateList()}
      </div>
    </div>
  );
};

export default NotificationTemplateManager;
