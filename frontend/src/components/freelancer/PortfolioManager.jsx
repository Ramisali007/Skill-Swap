import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PortfolioManager = ({ portfolioItems = [], onUpdate }) => {
  const [items, setItems] = useState(portfolioItems);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    technologies: '',
    completionDate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setItems(portfolioItems);
  }, [portfolioItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
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

  const validateForm = () => {
    const newErrors = {};

    if (!newItem.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!newItem.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (newItem.projectUrl && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(newItem.projectUrl)) {
      newErrors.projectUrl = 'Please enter a valid URL';
    }

    if (!newItem.technologies.trim()) {
      newErrors.technologies = 'At least one technology is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Format technologies as array
      const formattedItem = {
        ...newItem,
        technologies: newItem.technologies.split(',').map(tech => tech.trim())
      };

      // Make API call to add portfolio item
      const response = await axios.post('/api/freelancer/portfolio', formattedItem);
      
      // Update local state
      setItems([...items, response.data.portfolioItem]);
      
      // Reset form
      setNewItem({
        title: '',
        description: '',
        imageUrl: '',
        projectUrl: '',
        technologies: '',
        completionDate: ''
      });
      
      setIsAddingItem(false);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate([...items, response.data.portfolioItem]);
      }
      
      toast.success('Portfolio item added successfully!');
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      toast.error(error.response?.data?.message || 'Failed to add portfolio item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = (index) => {
    const item = items[index];
    setIsEditingItem(index);
    setNewItem({
      ...item,
      technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : item.technologies,
      completionDate: item.completionDate ? new Date(item.completionDate).toISOString().split('T')[0] : ''
    });
  };

  const handleUpdateItem = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const itemId = items[isEditingItem]._id;
      
      // Format technologies as array
      const formattedItem = {
        ...newItem,
        technologies: newItem.technologies.split(',').map(tech => tech.trim())
      };

      // Make API call to update portfolio item
      const response = await axios.put(`/api/freelancer/portfolio/${itemId}`, formattedItem);
      
      // Update local state
      const updatedItems = [...items];
      updatedItems[isEditingItem] = response.data.portfolioItem;
      setItems(updatedItems);
      
      // Reset form
      setNewItem({
        title: '',
        description: '',
        imageUrl: '',
        projectUrl: '',
        technologies: '',
        completionDate: ''
      });
      
      setIsEditingItem(null);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedItems);
      }
      
      toast.success('Portfolio item updated successfully!');
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      toast.error(error.response?.data?.message || 'Failed to update portfolio item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (index) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;

    try {
      const itemId = items[index]._id;

      // Make API call to delete portfolio item
      await axios.delete(`/api/freelancer/portfolio/${itemId}`);
      
      // Update local state
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedItems);
      }
      
      toast.success('Portfolio item deleted successfully!');
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete portfolio item');
    }
  };

  const handleCancel = () => {
    setIsAddingItem(false);
    setIsEditingItem(null);
    setNewItem({
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      technologies: '',
      completionDate: ''
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Portfolio Items</h3>
        {!isAddingItem && isEditingItem === null && (
          <button
            type="button"
            onClick={() => setIsAddingItem(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Portfolio Item
          </button>
        )}
      </div>

      {/* Portfolio Items List */}
      {items.length === 0 && !isAddingItem ? (
        <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolio items</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first portfolio item.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsAddingItem(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Portfolio Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300">
              {item.imageUrl && (
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>
              )}
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 truncate">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-3">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {Array.isArray(item.technologies) ? (
                    item.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.technologies}
                    </span>
                  )}
                </div>
                {item.completionDate && (
                  <p className="mt-2 text-xs text-gray-500">
                    Completed: {new Date(item.completionDate).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => handleEditItem(index)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(index)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Portfolio Item Form */}
      {(isAddingItem || isEditingItem !== null) && (
        <div className="bg-white shadow sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isAddingItem ? 'Add Portfolio Item' : 'Edit Portfolio Item'}
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Title */}
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={newItem.title}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.title ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={newItem.description}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.description ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Image URL */}
              <div className="sm:col-span-6">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="imageUrl"
                    id="imageUrl"
                    value={newItem.imageUrl}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Project URL */}
              <div className="sm:col-span-6">
                <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700">
                  Project URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="projectUrl"
                    id="projectUrl"
                    value={newItem.projectUrl}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.projectUrl ? 'border-red-300' : ''
                    }`}
                    placeholder="https://example.com"
                  />
                  {errors.projectUrl && (
                    <p className="mt-2 text-sm text-red-600">{errors.projectUrl}</p>
                  )}
                </div>
              </div>

              {/* Technologies */}
              <div className="sm:col-span-6">
                <label htmlFor="technologies" className="block text-sm font-medium text-gray-700">
                  Technologies *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="technologies"
                    id="technologies"
                    value={newItem.technologies}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.technologies ? 'border-red-300' : ''
                    }`}
                    placeholder="React, Node.js, MongoDB"
                  />
                  {errors.technologies && (
                    <p className="mt-2 text-sm text-red-600">{errors.technologies}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">Separate technologies with commas</p>
                </div>
              </div>

              {/* Completion Date */}
              <div className="sm:col-span-6">
                <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700">
                  Completion Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="completionDate"
                    id="completionDate"
                    value={newItem.completionDate}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={isAddingItem ? handleAddItem : handleUpdateItem}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isAddingItem ? 'Adding...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    {isAddingItem ? 'Add Item' : 'Update Item'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
