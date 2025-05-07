import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReviewForm from './ReviewForm';

const AssignedFreelancerSection = ({ 
  project, 
  freelancerUserExists, 
  hasReviewed, 
  showReviewForm, 
  setShowReviewForm, 
  onReviewSubmitted 
}) => {
  if (!project || !project.assignedFreelancer) return null;
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Assigned Freelancer</h2>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {project.assignedFreelancer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{project.assignedFreelancer.name}</h3>
            {freelancerUserExists && (
              <div className="mt-1">
                <Link
                  to={`/users/${project.assignedFreelancer.user?.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View Profile
                </Link>
                <span className="mx-2 text-gray-300">|</span>
                <Link
                  to={`/messages?userId=${project.assignedFreelancer.user?.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Send Message
                </Link>
              </div>
            )}
          </div>
          
          {/* Rate Freelancer Button */}
          {project.status === 'completed' && !hasReviewed && (
            <div className="ml-auto">
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Rate Freelancer
              </button>
            </div>
          )}
          
          {/* Already Reviewed Badge */}
          {project.status === 'completed' && hasReviewed && (
            <div className="ml-auto">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg className="-ml-1 mr-1.5 h-4 w-4 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Reviewed
              </span>
            </div>
          )}
        </div>
        
        {/* Review Form */}
        {showReviewForm && (
          <div className="mt-6">
            <ReviewForm 
              projectId={project.id} 
              freelancerId={project.assignedFreelancer.user?.id} 
              onReviewSubmitted={onReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedFreelancerSection;
