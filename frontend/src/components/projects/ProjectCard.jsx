import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Link } from 'react-router-dom';
import ProjectTagManager from './ProjectTagManager';
import ProjectTimeline from './ProjectTimeline';

const ProjectCard = ({
  project,
  isExpanded,
  onToggleExpand,
  onStatusUpdate,
  onAddTag,
  onRemoveTag,
  availableTags
}) => {
  const [showTimeline, setShowTimeline] = useState(false);
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Set up drag and drop
  const [{ isDragging }, drag] = useDrag({
    type: 'PROJECT',
    item: { id: project.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`bg-white rounded-lg border ${
        isDragging
          ? 'opacity-50 border-dashed border-gray-400'
          : isExpanded
            ? 'border-indigo-300 ring-2 ring-indigo-200'
            : 'border-gray-200 hover:border-indigo-200'
      } shadow-sm overflow-hidden transition-all duration-200 cursor-move`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* Card Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              <Link to={`/client/projects/${project.id}`} className="hover:text-indigo-600">
                {project.title}
              </Link>
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleExpand(project.id);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3">
        <div className="mb-2">
          <p className="text-xs text-gray-500">Budget</p>
          <p className="text-sm font-medium text-gray-900">${project.budget.toFixed(2)}</p>
        </div>

        <div className="mb-2">
          <p className="text-xs text-gray-500">Deadline</p>
          <p className="text-sm font-medium text-gray-900">
            {project.deadline ? formatDate(project.deadline) : 'No deadline'}
          </p>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
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
          </div>
        )}

        {/* Progress Bar */}
        {project.progress !== undefined && (
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-500">Progress</p>
              <p className="text-xs font-medium text-gray-900">{project.progress}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Card Actions */}
        <div className="mt-3 flex justify-end">
          <Link
            to={`/client/projects/${project.id}`}
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View
          </Link>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 bg-indigo-50 border-t border-indigo-100">
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Description</p>
            <p className="text-xs text-gray-600 line-clamp-3">
              {project.description}
            </p>
          </div>

          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Project Tags</p>
            <ProjectTagManager
              projectId={project.id}
              tags={project.tags || []}
              availableTags={availableTags}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
            />
          </div>

          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Update Status</p>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => onStatusUpdate(project.id, 'open')}
                className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded ${
                  project.status === 'open'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-yellow-50'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => onStatusUpdate(project.id, 'in_progress')}
                className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded ${
                  project.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => onStatusUpdate(project.id, 'completed')}
                className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded ${
                  project.status === 'completed'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => onStatusUpdate(project.id, 'cancelled')}
                className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded ${
                  project.status === 'cancelled'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {project.status === 'in_progress' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-700">Timeline & Progress</p>
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="inline-flex items-center px-2 py-1 border text-xs font-medium rounded bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50"
                >
                  {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
                </button>
              </div>

              {showTimeline && (
                <div className="mt-2 border border-indigo-200 rounded-lg overflow-hidden">
                  <ProjectTimeline
                    project={project}
                    isEditable={false}
                    onProgressUpdate={(newProgress) => {
                      // This would be handled by the parent component
                    }}
                    onMilestoneUpdate={(updatedMilestones) => {
                      // This would be handled by the parent component
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
