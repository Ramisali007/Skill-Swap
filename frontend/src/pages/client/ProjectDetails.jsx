import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import ReviewForm from '../../components/reviews/ReviewForm';
import AssignedFreelancerSection from '../../components/reviews/AssignedFreelancerSection';
import ProjectTimeline from '../../components/projects/ProjectTimeline';

const ProjectDetails = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingBid, setAcceptingBid] = useState(null);
  const [cancelingProject, setCancelingProject] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [freelancerUserExists, setFreelancerUserExists] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Function to fetch project data
  const fetchProject = async () => {
    setError(null);

    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();

      // Fetch project details
      const response = await axios.get(`/api/projects/${id}?_=${timestamp}`);
      console.log('Project data:', response.data);

      if (!response.data || !response.data.project) {
        throw new Error('Invalid project data received');
      }

      // Fetch bids for the project
      const bidsResponse = await axios.get(`/api/projects/${id}/bids?_=${timestamp}`);
      console.log('Bids data:', bidsResponse.data);

      // Check if client has already reviewed the freelancer for this project
      if (response.data.project.status === 'completed' && response.data.project.assignedFreelancer) {
        try {
          const reviewsResponse = await axios.get(`/api/reviews/project/${id}`);
          const reviews = reviewsResponse.data.reviews || [];

          // Check if any of the reviews are from the current client to the assigned freelancer
          const hasClientReview = reviews.some(review =>
            review.reviewee &&
            review.reviewee._id === response.data.project.assignedFreelancer.user._id
          );

          setHasReviewed(hasClientReview);
        } catch (err) {
          console.error('Error checking for existing reviews:', err);
          setHasReviewed(false);
        }
      }

      // Transform project data
      const projectData = {
        id: response.data.project._id,
        title: response.data.project.title,
        description: response.data.project.description,
        category: response.data.project.category,
        skills: response.data.project.skills || [],
        budget: response.data.project.budget,
        deadline: response.data.project.deadline,
        status: response.data.project.status,
        assignedFreelancer: response.data.project.assignedFreelancer ? {
          id: response.data.project.assignedFreelancer._id,
          name: response.data.project.assignedFreelancer.user ? response.data.project.assignedFreelancer.user.name : 'Unknown Freelancer',
          user: response.data.project.assignedFreelancer.user || null
        } : null,
        progress: response.data.project.progress || 0,
        bids: bidsResponse.data.bids.map(bid => ({
          id: bid._id,
          freelancer: {
            id: bid.freelancer._id,
            name: bid.freelancer.user ? bid.freelancer.user.name : 'Unknown Freelancer',
            rating: bid.freelancer.averageRating || 0,
            completedProjects: bid.freelancer.completedProjects || 0,
            user: bid.freelancer.user || null
          },
          amount: bid.amount,
          deliveryTime: bid.deliveryTime + ' days',
          proposal: bid.proposal,
          status: bid.status,
          createdAt: bid.createdAt
        })),
        attachments: (response.data.project.attachments || []).map(attachment => ({
          name: attachment.name,
          url: attachment.url,
          uploadedAt: attachment.uploadedAt
        })),
        milestones: response.data.project.milestones || [],
        createdAt: response.data.project.createdAt
      };

      setProject(projectData);

      // Check if assigned freelancer user exists
      if (projectData.assignedFreelancer && projectData.assignedFreelancer.user && projectData.assignedFreelancer.user._id) {
        const userExists = await checkUserExists(projectData.assignedFreelancer.user._id);
        setFreelancerUserExists(userExists);
        console.log(`Assigned freelancer user exists: ${userExists}`);
      } else {
        setFreelancerUserExists(false);
      }

      // Fetch submissions if project is in progress or completed
      if (projectData.status === 'in_progress' || projectData.status === 'completed') {
        try {
          const submissionsResponse = await axios.get(`/api/projects/${id}/submissions?_=${timestamp}`);
          console.log('Submissions data:', submissionsResponse.data);

          if (submissionsResponse.data && submissionsResponse.data.submissions) {
            setSubmissions(submissionsResponse.data.submissions.map(submission => ({
              id: submission._id,
              description: submission.description,
              files: submission.files || [],
              status: submission.status,
              createdAt: submission.createdAt,
              freelancer: submission.freelancer ? {
                id: submission.freelancer._id,
                name: submission.freelancer.user ? submission.freelancer.user.name : 'Unknown Freelancer'
              } : null
            })));
          }
        } catch (submissionErr) {
          console.error('Error fetching submissions:', submissionErr);
          // Non-critical error, don't show to user
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project details. Please try again later.');
      setLoading(false);
    }
  };

  // Function to check if a user exists
  const checkUserExists = async (userId) => {
    if (!userId) return false;

    try {
      const response = await axios.get(`/api/users/exists/${userId}`);
      return response.data && response.data.exists;
    } catch (err) {
      console.error(`Error checking if user ${userId} exists:`, err);
      return false;
    }
  };

  // Initial data fetch
  useEffect(() => {
    setLoading(true);
    fetchProject();
  }, [id]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    // Create socket connection
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
    socketRef.current = socket;

    // Join project room for real-time updates
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join_project', id);
    });

    // Listen for work submission updates
    socket.on('work_submission', (data) => {
      console.log('Work submission update received:', data);

      if (data.projectId === id) {
        // Refresh project data when a work submission is received
        fetchProject();
      }
    });

    // Listen for project status updates
    socket.on('project_update', (data) => {
      console.log('Project update received:', data);

      if (data.projectId === id) {
        // Refresh project data when project status is updated
        fetchProject();
      }
    });

    // Clean up on unmount
    return () => {
      console.log('Disconnecting socket');
      socket.disconnect();
    };
  }, [id]);

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

  // Handle accepting a bid
  const handleAcceptBid = async (bidId) => {
    try {
      setAcceptingBid(bidId);

      // Make API call to accept the bid
      const response = await axios.put(`/api/projects/${id}/bids/${bidId}/accept`);
      console.log('Accept bid response:', response.data);

      // Show success message
      alert('Bid accepted successfully! The project is now in progress.');

      // Emit socket event for real-time update
      if (socketRef.current) {
        socketRef.current.emit('project_update', {
          projectId: id,
          type: 'bid_accepted',
          bidId: bidId
        });
      }

      // Refresh the project data
      fetchProject();
    } catch (err) {
      console.error('Error accepting bid:', err);
      alert('Failed to accept bid. Please try again later.');
      setAcceptingBid(null);
    }
  };

  // Handle canceling a project
  const handleCancelProject = async () => {
    if (!window.confirm('Are you sure you want to cancel this project? This action cannot be undone.')) {
      return;
    }

    try {
      setCancelingProject(true);

      // Make API call to cancel the project
      const response = await axios.put(`/api/projects/${id}/status`, {
        status: 'cancelled'
      });
      console.log('Cancel project response:', response.data);

      // Show success message
      alert('Project cancelled successfully.');

      // Refresh the project data
      fetchProject();
    } catch (err) {
      console.error('Error canceling project:', err);
      alert('Failed to cancel project. Please try again later.');
      setCancelingProject(false);
    }
  };

  // Handle submission review
  const handleReviewSubmission = async (submissionId, status) => {
    try {
      setReviewingSubmission(submissionId);

      // Make API call to review the submission
      const response = await axios.put(`/api/projects/${id}/submissions/${submissionId}/review`, {
        status: status
      });
      console.log('Review submission response:', response.data);

      // Show success message
      alert(`Submission ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);

      // If approved and it's the final submission, mark project as completed
      if (status === 'approved') {
        const completeResponse = await axios.put(`/api/projects/${id}/status`, {
          status: 'completed'
        });
        console.log('Complete project response:', completeResponse.data);
        alert('Project marked as completed!');

        // Show review form after marking project as completed
        setShowReviewForm(true);
      }

      // Emit socket event for real-time update
      if (socketRef.current) {
        socketRef.current.emit('project_update', {
          projectId: id,
          type: 'submission_review',
          submissionId: submissionId,
          status: status
        });
      }

      // Refresh the project data
      fetchProject();
    } catch (err) {
      console.error('Error reviewing submission:', err);
      alert('Failed to review submission. Please try again later.');
    } finally {
      setReviewingSubmission(null);
    }
  };

  // Handle review submission
  const handleReviewSubmitted = (review) => {
    setShowReviewForm(false);
    setHasReviewed(true);
    fetchProject(); // Refresh project data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-6">
            <Link
              to="/client/projects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h1 className="text-lg leading-6 font-medium text-gray-900">{project.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Posted on {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-3">
            {project.status === 'open' && (
              <>
                <Link
                  to={`/client/edit-project/${project.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Project
                </Link>
                <button
                  type="button"
                  onClick={handleCancelProject}
                  disabled={cancelingProject}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white ${
                    cancelingProject ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
                >
                  {cancelingProject ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Canceling...
                    </>
                  ) : (
                    'Cancel Project'
                  )}
                </button>
              </>
            )}
            {project.status === 'in_progress' && project.assignedFreelancer && project.assignedFreelancer.user && project.assignedFreelancer.user._id && freelancerUserExists && (
              <Link
                to={`/messages/conversations/new?recipientId=${project.assignedFreelancer.user._id}&projectId=${project.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Message Freelancer
              </Link>
            )}
            {project.status === 'in_progress' && project.assignedFreelancer && (!project.assignedFreelancer.user || !project.assignedFreelancer.user._id || !freelancerUserExists) && (
              <div className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-sm font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed">
                <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Messaging Unavailable
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
              {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
            </span>
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Budget: ${project.budget}
            </span>
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              Deadline: {new Date(project.deadline).toLocaleDateString()}
            </span>
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
              {project.category}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
            <div className="mt-1 text-sm text-gray-500">
              <p>{project.description}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Skills Required</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {project.skills.map((skill, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {project.attachments.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">Attachments</h3>
              <ul className="mt-1 border border-gray-200 rounded-md divide-y divide-gray-200">
                {project.attachments.map((attachment, index) => (
                  <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2 flex-1 w-0 truncate">{attachment.name}</span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <a href={attachment.url} className="font-medium text-blue-600 hover:text-blue-500">
                        Download
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Assigned Freelancer Section */}
      {project.status !== 'open' && project.assignedFreelancer && (
        <AssignedFreelancerSection
          project={project}
          freelancerUserExists={freelancerUserExists}
          hasReviewed={hasReviewed}
          showReviewForm={showReviewForm}
          setShowReviewForm={setShowReviewForm}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Project Timeline */}
      {project.status === 'in_progress' && (
        <ProjectTimeline
          project={project}
          isEditable={false}
          onProgressUpdate={(newProgress) => {
            setProject({
              ...project,
              progress: newProgress
            });
          }}
          onMilestoneUpdate={(updatedMilestones) => {
            setProject({
              ...project,
              milestones: updatedMilestones
            });
          }}
        />
      )}

      {/* Bids Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Bids ({project.bids.length})</h2>
          {project.status === 'open' && (
            <Link
              to={`/client/projects/${project.id}/bids`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Bids
            </Link>
          )}
        </div>

        {project.bids.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">No bids yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {project.bids.slice(0, 2).map((bid) => (
              <li key={bid.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">{bid.freelancer.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{bid.freelancer.name}</h3>
                      <div className="flex items-center mt-1">
                        <svg className="text-yellow-400 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-500">{bid.freelancer.rating} ({bid.freelancer.completedProjects} projects)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${bid.amount}</p>
                      <p className="text-sm text-gray-500">Delivery: {bid.deliveryTime}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{bid.proposal}</p>
                </div>
                {project.status === 'open' && (
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => handleAcceptBid(bid.id)}
                      disabled={acceptingBid === bid.id}
                      className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white ${
                        acceptingBid === bid.id ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                    >
                      {acceptingBid === bid.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Accept Bid'
                      )}
                    </button>
                    {bid.freelancer.user && bid.freelancer.user._id && (
                      <button
                        type="button"
                        onClick={async () => {
                          // Check if user exists before navigating
                          const userExists = await checkUserExists(bid.freelancer.user._id);
                          if (userExists) {
                            navigate(`/messages/conversations/new?recipientId=${bid.freelancer.user._id}&projectId=${project.id}`);
                          } else {
                            alert('This freelancer account is no longer available for messaging.');
                          }
                        }}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Message
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Work Submissions Section */}
      {(project.status === 'in_progress' || project.status === 'completed') && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Work Submissions</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review work submitted by the freelancer.
            </p>
          </div>

          {submissions.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">No work submissions yet.</p>
            </div>
          ) : (
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <li key={submission.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Submission from {submission.freelancer?.name || 'Freelancer'}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Submitted on {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700">Description</h4>
                      <p className="mt-1 text-sm text-gray-500">{submission.description}</p>
                    </div>

                    {submission.files && submission.files.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700">Files</h4>
                        <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
                          {submission.files.map((file, index) => (
                            <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <a href={file.url} className="font-medium text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">
                                  Download
                                </a>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {submission.status === 'pending' && (
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleReviewSubmission(submission.id, 'approved')}
                          disabled={reviewingSubmission === submission.id}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white ${
                            reviewingSubmission === submission.id ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                          }`}
                        >
                          {reviewingSubmission === submission.id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            'Approve & Complete Project'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewSubmission(submission.id, 'rejected')}
                          disabled={reviewingSubmission === submission.id}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white ${
                            reviewingSubmission === submission.id ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          }`}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
