import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import ProjectTimeline from '../../components/projects/ProjectTimeline';

const FreelancerProjectDetails = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);
  const [showSubmitWorkForm, setShowSubmitWorkForm] = useState(false);
  const [workDescription, setWorkDescription] = useState('');
  const [workFiles, setWorkFiles] = useState([]);
  const [submittingWork, setSubmittingWork] = useState(false);
  const [myBid, setMyBid] = useState(null);
  const [showCounterOfferResponse, setShowCounterOfferResponse] = useState(false);
  const [counterOfferResponse, setCounterOfferResponse] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Function to fetch project data
  const fetchProject = async () => {
    setError(null);

    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await axios.get(`/api/projects/${id}?_=${timestamp}`);
      console.log('Project data from API:', response.data);

      if (response.data && response.data.project) {
        // Transform the data to match our component's expected format
        const projectData = {
          id: response.data.project._id,
          title: response.data.project.title,
          description: response.data.project.description,
          category: response.data.project.category,
          skills: response.data.project.skills || [],
          budget: response.data.project.budget,
          deadline: response.data.project.deadline,
          status: response.data.project.status,
          client: {
            id: response.data.project.client._id,
            name: response.data.project.client.user ? response.data.project.client.user.name : 'Unknown Client',
            projectsPosted: response.data.project.client.projectsPosted || 0,
            user: {
              _id: response.data.project.client.user ? response.data.project.client.user._id : response.data.project.client._id
            }
          },
          milestones: (response.data.project.milestones || []).map(milestone => ({
            id: milestone._id,
            title: milestone.title,
            description: milestone.description,
            amount: milestone.amount,
            status: milestone.status,
            dueDate: milestone.dueDate,
            completedDate: milestone.completedDate
          })),
          attachments: (response.data.project.attachments || []).map(attachment => ({
            name: attachment.name,
            url: attachment.url,
            uploadedAt: attachment.uploadedAt
          })),
          messages: [], // We'll fetch messages separately or from a different endpoint
          createdAt: response.data.project.createdAt
        };

        setProject(projectData);

        // Try to fetch the freelancer's bid on this project
        try {
          const bidsResponse = await axios.get(`/api/projects/freelancer/my-bids?projectId=${id}`);
          console.log('My bids data:', bidsResponse.data);

          if (bidsResponse.data && bidsResponse.data.bids && bidsResponse.data.bids.length > 0) {
            // Find the bid for this project
            const projectBid = bidsResponse.data.bids.find(bid => {
              // The bid.project might be an object or just the ID string
              const bidProjectId = typeof bid.project === 'object' ? bid.project._id : bid.project;
              console.log(`Comparing bid project ${bidProjectId} with current project ${id}`);
              return bidProjectId === id;
            });

            if (projectBid) {
              console.log('Found bid for this project:', projectBid);
              console.log('Counter offer data:', projectBid.counterOffer);

              setMyBid({
                id: projectBid._id,
                amount: projectBid.amount,
                deliveryTime: projectBid.deliveryTime,
                proposal: projectBid.proposal,
                status: projectBid.status,
                counterOffer: projectBid.counterOffer
              });

              // If there's a pending counter offer, show the response form
              if (projectBid.counterOffer && projectBid.counterOffer.status === 'pending') {
                setShowCounterOfferResponse(true);
              }
            }
          }
        } catch (bidErr) {
          console.error('Error fetching my bids:', bidErr);
          // Non-critical error, don't show to user
        }
      } else {
        throw new Error('Invalid project data received from server');
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

    // Listen for bid updates
    socket.on('bid_update', (data) => {
      console.log('Bid update received:', data);

      if (data.projectId === id) {
        // Refresh project data when a bid update is received
        fetchProject();
      }
    });

    // Listen for work submission updates
    socket.on('work_submission', (data) => {
      console.log('Work submission update received:', data);

      if (data.projectId === id) {
        // If the update includes a status change to completed
        if (data.projectStatus === 'completed') {
          console.log('Project status changed to completed');
          // Update the project status in the state
          setProject(prevProject => ({
            ...prevProject,
            status: 'completed',
            progress: 100
          }));
        }
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
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle bid submission
  const handleSubmitBid = async (e) => {
    e.preventDefault();

    if (!bidAmount || !bidProposal || !deliveryTime) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post(`/api/projects/${id}/bids`, {
        amount: parseFloat(bidAmount),
        proposal: bidProposal,
        deliveryTime: parseInt(deliveryTime)
      });

      console.log('Bid submitted successfully:', response.data);

      // Update local state with the new bid
      setMyBid({
        id: response.data.bid._id,
        amount: response.data.bid.amount,
        deliveryTime: response.data.bid.deliveryTime,
        proposal: response.data.bid.proposal,
        status: response.data.bid.status,
        counterOffer: response.data.bid.counterOffer
      });

      // Emit socket event for real-time update
      if (socketRef.current) {
        socketRef.current.emit('new_bid', {
          projectId: id,
          bidId: response.data.bid._id
        });
      }

      alert('Your bid has been submitted successfully!');
      setShowBidForm(false);

      // Clear form fields
      setBidAmount('');
      setBidProposal('');
      setDeliveryTime('');

      // Refresh project data
      fetchProject();
    } catch (err) {
      console.error('Error submitting bid:', err);
      alert('Failed to submit bid. Please try again later.');
    }
  };

  // Handle counter offer response
  const handleCounterOfferResponse = async (response) => {
    if (!myBid || !myBid.counterOffer) {
      alert('No counter offer found');
      return;
    }

    try {
      const apiResponse = await axios.put(`/api/projects/${id}/bids/${myBid.id}/counter-offer`, {
        response: response
      });

      console.log('Counter offer response:', apiResponse.data);

      // Update local state
      setMyBid({
        ...myBid,
        counterOffer: {
          ...myBid.counterOffer,
          status: response === 'accept' ? 'accepted' : 'rejected'
        }
      });

      // Emit socket event for real-time update
      if (socketRef.current) {
        socketRef.current.emit('new_bid', {
          projectId: id,
          bidId: myBid.id,
          type: 'counter_offer_response'
        });
      }

      alert(`Counter offer ${response === 'accept' ? 'accepted' : 'rejected'} successfully!`);
      setShowCounterOfferResponse(false);

      // Refresh project data
      fetchProject();
    } catch (err) {
      console.error('Error responding to counter offer:', err);
      alert('Failed to respond to counter offer. Please try again later.');
    }
  };

  // Handle work submission
  const handleSubmitWork = async (e) => {
    e.preventDefault();

    if (!workDescription) {
      alert('Please provide a description of the work completed');
      return;
    }

    try {
      setSubmittingWork(true);

      // Create form data for file upload
      const formData = new FormData();
      formData.append('description', workDescription);

      // Add files to form data
      if (workFiles.length > 0) {
        for (let i = 0; i < workFiles.length; i++) {
          formData.append('files', workFiles[i]);
        }
      }

      // Submit work
      const response = await axios.post(`/api/projects/${id}/submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Work submitted successfully:', response.data);

      // Update project data in state
      setProject({
        ...project,
        progress: 100,
        status: 'completed', // Update status to completed
        submissions: [
          ...(project.submissions || []),
          response.data.submission
        ]
      });

      // Emit socket event for real-time update
      if (socketRef.current) {
        socketRef.current.emit('work_submission', {
          projectId: id,
          submissionId: response.data.submission._id,
          projectStatus: 'completed' // Add project status to the socket event
        });
      }

      // Show a completion notification
      const completionMessage = document.createElement('div');
      completionMessage.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fadeIn';
      completionMessage.innerHTML = `
        <div class="flex items-center">
          <svg class="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="font-bold">Project Completed!</h3>
            <p class="text-sm">Your work has been submitted and the project is now marked as completed.</p>
          </div>
        </div>
      `;
      document.body.appendChild(completionMessage);

      // Remove notification after 5 seconds
      setTimeout(() => {
        completionMessage.classList.add('animate-fadeOut');
        setTimeout(() => {
          document.body.removeChild(completionMessage);
        }, 500);
      }, 5000);

      setShowSubmitWorkForm(false);
      setWorkDescription('');
      setWorkFiles([]);

      // Refresh project data without page reload
      fetchProject();

      // Navigate to the projects page after a short delay to show the updated status
      setTimeout(() => {
        navigate('/freelancer/projects');
      }, 3000);
    } catch (err) {
      console.error('Error submitting work:', err);
      alert('Failed to submit work. Please try again later.');
    } finally {
      setSubmittingWork(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    // Convert FileList to Array for better handling
    setWorkFiles(Array.from(e.target.files));
  };

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
              to="/freelancer/projects"
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
            <div className="flex items-center">
              <h1 className="text-lg leading-6 font-medium text-gray-900">{project.title}</h1>
              {myBid && myBid.counterOffer && myBid.counterOffer.status === 'pending' && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                  <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                  </svg>
                  New Counter Offer
                </span>
              )}
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Posted on {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-3">
            {/* Only show message button if we have a valid recipient ID */}
            {(project.client.user?._id || project.client.id) && (
              <button
                type="button"
                onClick={async () => {
                  const clientId = project.client.user?._id || project.client.id;
                  // Check if user exists before navigating
                  const userExists = await checkUserExists(clientId);
                  if (userExists) {
                    navigate(`/messages/conversations/new?recipientId=${clientId}&projectId=${project.id}`);
                  } else {
                    alert('This client account is no longer available for messaging.');
                  }
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Message Client
              </button>
            )}
            {project.status === 'in_progress' && (
              <button
                type="button"
                onClick={() => setShowSubmitWorkForm(!showSubmitWorkForm)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {showSubmitWorkForm ? 'Cancel Submission' : 'Submit Work'}
              </button>
            )}
            {project.status === 'open' && !myBid && (
              <button
                type="button"
                onClick={() => setShowBidForm(!showBidForm)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {showBidForm ? 'Cancel Bid' : 'Place Bid'}
              </button>
            )}
            {myBid && myBid.counterOffer && myBid.counterOffer.status === 'pending' && (
              <button
                type="button"
                onClick={() => document.getElementById('counter-offer-section').scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                </svg>
                View Counter Offer
              </button>
            )}
          </div>
        </div>

        {/* My Bid Status */}
        {myBid && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Bid</h3>
            <div className="mt-3 bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-blue-700">Amount:</span>
                  <span className="ml-2 text-sm text-blue-800">${myBid.amount}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Delivery Time:</span>
                  <span className="ml-2 text-sm text-blue-800">{myBid.deliveryTime} days</span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-medium text-blue-700">Status:</span>
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    myBid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    myBid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {myBid.status.charAt(0).toUpperCase() + myBid.status.slice(1)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-medium text-blue-700">Proposal:</span>
                  <p className="mt-1 text-sm text-blue-800">{myBid.proposal}</p>
                </div>
              </div>

              {/* Counter Offer Section */}
              {myBid.counterOffer && myBid.counterOffer.status !== 'none' && (
                <div id="counter-offer-section" className="mt-4 border-t border-blue-200 pt-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <svg className="h-6 w-6 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                      </svg>
                      <h4 className="text-lg font-medium text-amber-800">Client Counter Offer</h4>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-amber-100">
                        <span className="text-sm font-medium text-amber-700">Amount:</span>
                        <span className="ml-2 text-lg font-semibold text-amber-800">${myBid.counterOffer.amount}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-amber-100">
                        <span className="text-sm font-medium text-amber-700">Delivery Time:</span>
                        <span className="ml-2 text-lg font-semibold text-amber-800">{myBid.counterOffer.deliveryTime} days</span>
                      </div>
                      <div className="col-span-2 bg-white p-3 rounded-lg border border-amber-100">
                        <span className="text-sm font-medium text-amber-700">Message from Client:</span>
                        <p className="mt-1 text-sm text-amber-800">{myBid.counterOffer.message}</p>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm font-medium text-amber-700 mr-2">Status:</span>
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-md ${
                          myBid.counterOffer.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          myBid.counterOffer.status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {myBid.counterOffer.status === 'pending' ? 'Awaiting Your Response' :
                           myBid.counterOffer.status === 'accepted' ? 'You Accepted This Offer' :
                           'You Declined This Offer'}
                        </span>
                      </div>

                      {/* Counter Offer Response Buttons */}
                      {myBid.counterOffer.status === 'pending' && (
                        <div className="col-span-2 mt-3 flex space-x-4">
                          <button
                            type="button"
                            onClick={() => handleCounterOfferResponse('accept')}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm"
                          >
                            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Accept Counter Offer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCounterOfferResponse('reject')}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
                          >
                            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            Decline Counter Offer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Work Submission Form */}
        {showSubmitWorkForm && project.status === 'in_progress' && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Submit Your Work</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Provide details about the work you've completed and upload any relevant files.
            </p>

            <form onSubmit={handleSubmitWork} className="mt-4 space-y-4">
              <div>
                <label htmlFor="workDescription" className="block text-sm font-medium text-gray-700">
                  Description of Work Completed
                </label>
                <div className="mt-1">
                  <textarea
                    id="workDescription"
                    name="workDescription"
                    rows={4}
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe the work you've completed, including any challenges faced and how you resolved them."
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="workFiles" className="block text-sm font-medium text-gray-700">
                  Upload Files (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    id="workFiles"
                    name="workFiles"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  You can upload multiple files (max 5 files, 10MB each).
                </p>

                {/* Display selected files */}
                {workFiles.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                    <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                      {workFiles.map((file, index) => (
                        <li key={index} className="pl-3 pr-4 py-2 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = [...workFiles];
                                newFiles.splice(index, 1);
                                setWorkFiles(newFiles);
                              }}
                              className="font-medium text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubmitWorkForm(false)}
                  className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWork}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    submittingWork ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {submittingWork ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Work'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bid Form */}
        {showBidForm && project.status === 'open' && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Place Your Bid</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Submit a competitive bid to work on this project.
            </p>

            <form onSubmit={handleSubmitBid} className="mt-4 space-y-4">
              <div>
                <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">
                  Bid Amount ($)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="bidAmount"
                    id="bidAmount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Project budget: ${project.budget}
                </p>
              </div>

              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">
                  Delivery Time (days)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="deliveryTime"
                    id="deliveryTime"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Number of days to complete"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bidProposal" className="block text-sm font-medium text-gray-700">
                  Proposal
                </label>
                <div className="mt-1">
                  <textarea
                    id="bidProposal"
                    name="bidProposal"
                    rows={4}
                    value={bidProposal}
                    onChange={(e) => setBidProposal(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe why you're the best fit for this project and how you plan to approach it."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowBidForm(false)}
                  className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Bid
                </button>
              </div>
            </form>
          </div>
        )}
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

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Client</h3>
            <div className="mt-1 flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">{project.client.name.charAt(0)}</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{project.client.name}</p>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">{project.client.projectsPosted} projects posted</span>
                </div>
              </div>
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

      {/* Project Timeline */}
      {project.status === 'in_progress' && (
        <ProjectTimeline
          project={project}
          isEditable={true}
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

      {/* Recent Messages */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Messages</h2>
          {/* Only show message button if we have a valid recipient ID */}
          {(project.client.user?._id || project.client.id) && (
            <button
              type="button"
              onClick={async () => {
                const clientId = project.client.user?._id || project.client.id;
                // Check if user exists before navigating
                const userExists = await checkUserExists(clientId);
                if (userExists) {
                  navigate(`/messages/conversations/new?recipientId=${clientId}&projectId=${project.id}`);
                } else {
                  alert('This client account is no longer available for messaging.');
                }
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Messages
            </button>
          )}
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {project.messages.map((message) => (
              <li key={message.id} className="px-4 py-4 sm:px-6">
                <div className={`flex ${message.sender === 'freelancer' ? 'justify-end' : ''}`}>
                  <div className={`inline-block max-w-lg rounded-lg px-4 py-2 ${
                    message.sender === 'freelancer'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProjectDetails;
