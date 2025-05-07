import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectTagManager from './ProjectTagManager';

const ProjectGridView = ({ projects, onStatusUpdate, onAddTag, onRemoveTag, availableTags }) => {
  const [expandedProject, setExpandedProject] = useState(null);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status text
  const formatStatus = (status) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Toggle project expansion
  const toggleExpand = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className={`bg-white rounded-xl border ${
              expandedProject === project.id 
                ? 'border-indigo-300 ring-2 ring-indigo-200' 
                : 'border-gray-200 hover:border-indigo-200'
            } shadow-sm overflow-hidden transition-all duration-200`}
          >
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900 truncate">
                    <Link to={`/client/projects/${project.id}`} className="hover:text-indigo-600">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {project.category}
                  </p>
                </div>
                <span className={`ml-2 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                  {formatStatus(project.status)}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {project.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-sm font-medium text-gray-900">${project.budget.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="text-sm font-medium text-gray-900">
                    {project.deadline ? formatDate(project.deadline) : 'No deadline'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bids</p>
                  <p className="text-sm font-medium text-gray-900">{project.bids}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(project.createdAt)}</p>
                </div>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 5 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        +{project.tags.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {project.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="text-xs font-medium text-gray-900">{project.progress}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Assigned Freelancer */}
              {project.assignedFreelancer && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Assigned Freelancer</p>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg className="h-3 w-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900">{project.assignedFreelancer.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Actions */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => toggleExpand(project.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {expandedProject === project.id ? 'Collapse' : 'Manage'}
                  <svg 
                    className={`ml-1.5 h-4 w-4 transform transition-transform duration-200 ${expandedProject === project.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <Link
                  to={`/client/projects/${project.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedProject === project.id && (
              <div className="px-6 py-4 bg-indigo-50 border-t border-indigo-100">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Project Tags</h4>
                  <ProjectTagManager
                    projectId={project.id}
                    tags={project.tags || []}
                    availableTags={availableTags}
                    onAddTag={onAddTag}
                    onRemoveTag={onRemoveTag}
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onStatusUpdate(project.id, 'open')}
                      className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md ${
                        project.status === 'open'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-yellow-50'
                      }`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => onStatusUpdate(project.id, 'in_progress')}
                      className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md ${
                        project.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => onStatusUpdate(project.id, 'completed')}
                      className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md ${
                        project.status === 'completed'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => onStatusUpdate(project.id, 'cancelled')}
                      className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md ${
                        project.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50'
                      }`}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectGridView;
