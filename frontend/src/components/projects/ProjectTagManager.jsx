import React, { useState } from 'react';

const ProjectTagManager = ({ projectId, tags, availableTags, onAddTag, onRemoveTag }) => {
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Filter available tags based on input
  const filteredTags = availableTags
    .filter(tag => !tags.includes(tag))
    .filter(tag => tag.toLowerCase().includes(newTag.toLowerCase()))
    .slice(0, 5);
  
  // Handle tag input change
  const handleInputChange = (e) => {
    setNewTag(e.target.value);
    setShowSuggestions(true);
  };
  
  // Handle tag selection from suggestions
  const handleTagSelect = (tag) => {
    onAddTag(projectId, tag);
    setNewTag('');
    setShowSuggestions(false);
  };
  
  // Handle tag creation
  const handleCreateTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag(projectId, newTag.trim());
      setNewTag('');
    }
  };
  
  // Handle tag removal
  const handleRemoveTag = (tag) => {
    onRemoveTag(projectId, tag);
  };
  
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => (
          <div key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-200 text-indigo-600 hover:bg-indigo-300 focus:outline-none focus:bg-indigo-500"
            >
              <span className="sr-only">Remove tag {tag}</span>
              <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
              </svg>
            </button>
          </div>
        ))}
        {tags.length === 0 && (
          <span className="text-sm text-gray-500">No tags added yet</span>
        )}
      </div>
      
      <form onSubmit={handleCreateTag} className="relative">
        <div className="flex">
          <input
            type="text"
            value={newTag}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Add a tag..."
            className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 sm:text-sm"
          >
            Add
          </button>
        </div>
        
        {/* Tag Suggestions */}
        {showSuggestions && filteredTags.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm">
            {filteredTags.map((tag) => (
              <div
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default ProjectTagManager;
