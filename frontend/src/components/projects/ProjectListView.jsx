import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectTagManager from './ProjectTagManager';

const ProjectListView = ({ projects, onStatusUpdate, onAddTag, onRemoveTag, availableTags }) => {
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
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Budget
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deadline
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bids
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <React.Fragment key={project.id}>
              <tr className={`hover:bg-gray-50 ${expandedProject === project.id ? 'bg-indigo-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        <Link to={`/client/projects/${project.id}`} className="hover:text-indigo-600">
                          {project.title}
                        </Link>
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.category}
                      </div>
                      {project.tags && project.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                    {formatStatus(project.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${project.budget.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.deadline ? formatDate(project.deadline) : 'No deadline'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.bids}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {expandedProject === project.id ? 'Collapse' : 'Expand'}
                    </button>
                    <Link
                      to={`/client/projects/${project.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
              {expandedProject === project.id && (
                <tr className="bg-indigo-50">
                  <td colSpan="6" className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {project.description}
                        </p>
                        
                        {project.assignedFreelancer && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Assigned Freelancer</h4>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{project.assignedFreelancer.name}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {project.milestones && project.milestones.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Milestones</h4>
                            <ul className="space-y-2">
                              {project.milestones.map((milestone, index) => (
                                <li key={index} className="flex items-start">
                                  <div className={`flex-shrink-0 h-5 w-5 rounded-full ${milestone.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center`}>
                                    {milestone.completed ? (
                                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                      </svg>
                                    ) : (
                                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                      </svg>
                                    )}
                                  </div>
                                  <span className="ml-2 text-sm text-gray-600">{milestone.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div>
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
                        
                        <div className="mb-4">
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
                        
                        {project.progress !== undefined && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Progress</h4>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-indigo-600 h-2.5 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 text-right">{project.progress}% Complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectListView;
