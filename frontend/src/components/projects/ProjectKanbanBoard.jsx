import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Link } from 'react-router-dom';
import ProjectCard from './ProjectCard';

const ProjectKanbanBoard = ({ projects, onStatusUpdate, onAddTag, onRemoveTag, availableTags }) => {
  const [expandedProject, setExpandedProject] = useState(null);
  
  // Group projects by status
  const openProjects = projects.filter(project => project.status === 'open');
  const inProgressProjects = projects.filter(project => project.status === 'in_progress');
  const completedProjects = projects.filter(project => project.status === 'completed');
  const cancelledProjects = projects.filter(project => project.status === 'cancelled');
  
  // Define drop targets for each column
  const [, openDrop] = useDrop({
    accept: 'PROJECT',
    drop: (item) => onStatusUpdate(item.id, 'open'),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  const [, inProgressDrop] = useDrop({
    accept: 'PROJECT',
    drop: (item) => onStatusUpdate(item.id, 'in_progress'),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  const [, completedDrop] = useDrop({
    accept: 'PROJECT',
    drop: (item) => onStatusUpdate(item.id, 'completed'),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  const [, cancelledDrop] = useDrop({
    accept: 'PROJECT',
    drop: (item) => onStatusUpdate(item.id, 'cancelled'),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  // Toggle project expansion
  const toggleExpand = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
    }
  };
  
  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex space-x-6 min-w-max">
        {/* Open Column */}
        <div 
          ref={openDrop}
          className="w-80 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="p-4 border-b border-gray-200 bg-yellow-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-yellow-800">Open</h3>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                {openProjects.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            {openProjects.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-500">No open projects</p>
              </div>
            ) : (
              openProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isExpanded={expandedProject === project.id}
                  onToggleExpand={toggleExpand}
                  onStatusUpdate={onStatusUpdate}
                  onAddTag={onAddTag}
                  onRemoveTag={onRemoveTag}
                  availableTags={availableTags}
                />
              ))
            )}
          </div>
        </div>
        
        {/* In Progress Column */}
        <div 
          ref={inProgressDrop}
          className="w-80 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-blue-800">In Progress</h3>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                {inProgressProjects.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            {inProgressProjects.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-500">No projects in progress</p>
              </div>
            ) : (
              inProgressProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isExpanded={expandedProject === project.id}
                  onToggleExpand={toggleExpand}
                  onStatusUpdate={onStatusUpdate}
                  onAddTag={onAddTag}
                  onRemoveTag={onRemoveTag}
                  availableTags={availableTags}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Completed Column */}
        <div 
          ref={completedDrop}
          className="w-80 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-800">Completed</h3>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                {completedProjects.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            {completedProjects.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-500">No completed projects</p>
              </div>
            ) : (
              completedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isExpanded={expandedProject === project.id}
                  onToggleExpand={toggleExpand}
                  onStatusUpdate={onStatusUpdate}
                  onAddTag={onAddTag}
                  onRemoveTag={onRemoveTag}
                  availableTags={availableTags}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Cancelled Column */}
        <div 
          ref={cancelledDrop}
          className="w-80 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="p-4 border-b border-gray-200 bg-red-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-red-800">Cancelled</h3>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                {cancelledProjects.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            {cancelledProjects.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-500">No cancelled projects</p>
              </div>
            ) : (
              cancelledProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isExpanded={expandedProject === project.id}
                  onToggleExpand={toggleExpand}
                  onStatusUpdate={onStatusUpdate}
                  onAddTag={onAddTag}
                  onRemoveTag={onRemoveTag}
                  availableTags={availableTags}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectKanbanBoard;
