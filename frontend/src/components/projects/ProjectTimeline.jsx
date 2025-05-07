import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProjectTimeline = ({ project, onProgressUpdate, onMilestoneUpdate, isEditable = false }) => {
  const [progress, setProgress] = useState(project.progress || 0);
  const [milestones, setMilestones] = useState(project.milestones || []);
  const [timeTracking, setTimeTracking] = useState({
    isTracking: false,
    startTime: null,
    totalTime: project.timeTracked || 0, // in seconds
    sessionTime: 0
  });
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    amount: ''
  });
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [deadlineReminder, setDeadlineReminder] = useState({
    enabled: false,
    days: 3
  });
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [timeTrackingInterval, setTimeTrackingInterval] = useState(null);

  // Update local state when project props change
  useEffect(() => {
    setProgress(project.progress || 0);
    setMilestones(project.milestones || []);

    // Check if deadline is approaching
    if (project.deadline) {
      const deadlineDate = new Date(project.deadline);
      const today = new Date();
      const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline <= deadlineReminder.days && daysUntilDeadline > 0 && deadlineReminder.enabled) {
        toast.warning(`Deadline approaching! Only ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} left until the project deadline.`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    }
  }, [project, deadlineReminder.days, deadlineReminder.enabled]);

  // Clean up time tracking interval on unmount
  useEffect(() => {
    return () => {
      if (timeTrackingInterval) {
        clearInterval(timeTrackingInterval);
      }
    };
  }, [timeTrackingInterval]);

  // Handle progress change
  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value, 10);
    setProgress(newProgress);
  };

  // Save progress change
  const saveProgressChange = async () => {
    try {
      await axios.put(`/api/projects/${project.id}/progress`, { progress });

      if (onProgressUpdate) {
        onProgressUpdate(progress);
      }

      toast.success('Progress updated successfully!');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress. Please try again.');
    }
  };

  // Toggle time tracking
  const toggleTimeTracking = async () => {
    if (timeTracking.isTracking) {
      // Stop tracking
      clearInterval(timeTrackingInterval);
      setTimeTrackingInterval(null);

      // Calculate total time
      const totalTime = timeTracking.totalTime + timeTracking.sessionTime;

      // Save to database
      try {
        await axios.put(`/api/projects/${project.id}/time-tracking`, {
          timeTracked: totalTime
        });

        toast.success('Time tracking stopped and saved.');
      } catch (error) {
        console.error('Error saving time tracking:', error);
        toast.error('Failed to save time tracking data.');
      }

      setTimeTracking({
        ...timeTracking,
        isTracking: false,
        startTime: null,
        totalTime: totalTime,
        sessionTime: 0
      });
    } else {
      // Start tracking
      const startTime = new Date();

      const interval = setInterval(() => {
        const now = new Date();
        const sessionSeconds = Math.floor((now - startTime) / 1000);

        setTimeTracking(prev => ({
          ...prev,
          sessionTime: sessionSeconds
        }));
      }, 1000);

      setTimeTrackingInterval(interval);

      setTimeTracking({
        ...timeTracking,
        isTracking: true,
        startTime: startTime,
        sessionTime: 0
      });

      toast.info('Time tracking started.');
    }
  };

  // Format time (seconds) to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle milestone form change
  const handleMilestoneChange = (e) => {
    const { name, value } = e.target;
    setNewMilestone({
      ...newMilestone,
      [name]: value
    });
  };

  // Add new milestone
  const addMilestone = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`/api/projects/${project.id}/milestones`, newMilestone);

      const updatedMilestones = [...milestones, response.data.milestone];
      setMilestones(updatedMilestones);

      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestones);
      }

      setNewMilestone({
        title: '',
        description: '',
        dueDate: '',
        amount: ''
      });

      setShowAddMilestone(false);
      toast.success('Milestone added successfully!');
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast.error('Failed to add milestone. Please try again.');
    }
  };

  // Update milestone status
  const updateMilestoneStatus = async (milestoneId, newStatus) => {
    try {
      await axios.put(`/api/projects/${project.id}/milestones/${milestoneId}`, {
        status: newStatus
      });

      const updatedMilestones = milestones.map(milestone =>
        milestone._id === milestoneId ? { ...milestone, status: newStatus } : milestone
      );

      setMilestones(updatedMilestones);

      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestones);
      }

      toast.success(`Milestone ${newStatus === 'completed' ? 'completed' : 'updated'} successfully!`);

      // If all milestones are completed, update progress to 100%
      if (newStatus === 'completed' && updatedMilestones.every(m => m.status === 'completed')) {
        setProgress(100);
        saveProgressChange();
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone. Please try again.');
    }
  };

  // Toggle deadline reminder
  const toggleDeadlineReminder = () => {
    setDeadlineReminder({
      ...deadlineReminder,
      enabled: !deadlineReminder.enabled
    });

    if (!deadlineReminder.enabled) {
      toast.info(`Deadline reminders enabled. You'll be notified ${deadlineReminder.days} days before the deadline.`);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Project Timeline</h2>
        {project.deadline && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
            <button
              type="button"
              onClick={toggleDeadlineReminder}
              className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white ${
                deadlineReminder.enabled ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 hover:bg-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        {/* Progress Tracking */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Progress</h3>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                disabled={!isEditable}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            {isEditable && (
              <button
                type="button"
                onClick={saveProgressChange}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* Time Tracking */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Time Tracking</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                Total: {formatTime(timeTracking.totalTime + timeTracking.sessionTime)}
              </span>
              {timeTracking.isTracking && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                  <svg className="mr-1 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Recording
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {timeTracking.isTracking ? (
                <span>Session: {formatTime(timeTracking.sessionTime)}</span>
              ) : (
                <span>Click start to begin tracking time</span>
              )}
            </div>
            <button
              type="button"
              onClick={toggleTimeTracking}
              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                timeTracking.isTracking
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {timeTracking.isTracking ? (
                <>
                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                  </svg>
                  Stop
                </>
              ) : (
                <>
                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Start
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Milestones</h3>
          {isEditable && (
            <button
              type="button"
              onClick={() => setShowAddMilestone(!showAddMilestone)}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showAddMilestone ? 'Cancel' : 'Add Milestone'}
            </button>
          )}
        </div>

        {/* Add Milestone Form */}
        {showAddMilestone && (
          <form onSubmit={addMilestone} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-xs font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={newMilestone.title}
                  onChange={handleMilestoneChange}
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-xs font-medium text-gray-700">
                  Amount ($)
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={newMilestone.amount}
                  onChange={handleMilestoneChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-xs font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  value={newMilestone.dueDate}
                  onChange={handleMilestoneChange}
                  required
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-xs font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={newMilestone.description}
                  onChange={handleMilestoneChange}
                  rows="2"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Milestone
              </button>
            </div>
          </form>
        )}

        {/* Milestones Timeline */}
        {milestones.length === 0 ? (
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500">No milestones added yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute top-0 left-5 bottom-0 w-0.5 bg-gray-200"></div>

            <ul className="space-y-6">
              {milestones.map((milestone, index) => (
                <li key={milestone._id || index} className="relative pl-10">
                  {/* Milestone dot */}
                  <div className={`absolute left-0 top-0 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    milestone.status === 'completed'
                      ? 'bg-green-100 border-green-500'
                      : milestone.status === 'in_progress'
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-gray-100 border-gray-300'
                  }`}>
                    {milestone.status === 'completed' ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : milestone.status === 'in_progress' ? (
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    )}
                  </div>

                  {/* Milestone content */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(milestone.status)}`}>
                        {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-3">{milestone.description}</p>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Due:</span> {new Date(milestone.dueDate).toLocaleDateString()}
                      </div>
                      {milestone.completedAt && (
                        <div>
                          <span className="font-medium">Completed:</span> {new Date(milestone.completedAt).toLocaleDateString()}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Amount:</span> ${milestone.amount}
                      </div>
                    </div>

                    {isEditable && milestone.status !== 'completed' && (
                      <div className="mt-3 flex justify-end space-x-2">
                        {milestone.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => updateMilestoneStatus(milestone._id, 'in_progress')}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Start
                          </button>
                        )}
                        {milestone.status === 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => updateMilestoneStatus(milestone._id, 'completed')}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTimeline;
