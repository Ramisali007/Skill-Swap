import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

// Configure axios with auth token
const configureAxios = (token) => {
  // Set default base URL
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Set auth token for all requests if available
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  return axios;
};

const RealConversationDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const axiosInstance = useRef(null);
  const { user, token } = useAuth();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('projectId');
  const recipientId = queryParams.get('recipientId');

  // Configure axios with auth token
  useEffect(() => {
    if (!token) {
      console.error('No authentication token available');
      setError('Authentication error. Please log in again.');
      return;
    }

    console.log('Configuring axios with token');
    axiosInstance.current = configureAxios(token);
  }, [token]);

  useEffect(() => {
    const fetchConversationAndMessages = async () => {
      setLoading(true);
      setError(null);

      // Check if we have a configured axios instance
      if (!axiosInstance.current) {
        console.error('Axios not configured yet');
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }

      // Check if user is authenticated
      if (!user || !user.id) {
        console.error('User not authenticated');
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        let conversationData;

        // If we have an ID, fetch the existing conversation
        if (id !== 'new') {
          // Fetch conversation details
          console.log(`Fetching conversation with ID: ${id}`);
          const conversationResponse = await axiosInstance.current.get(`/api/messages/conversations/${id}`);
          console.log('Conversation response:', conversationResponse.data);

          if (!conversationResponse.data || !conversationResponse.data.conversation) {
            throw new Error('Invalid conversation data received');
          }

          conversationData = conversationResponse.data.conversation;

          // Fetch messages
          console.log(`Fetching messages for conversation ID: ${id}`);
          const messagesResponse = await axiosInstance.current.get(`/api/messages/conversations/${id}/messages`);
          console.log('Messages response:', messagesResponse.data);

          if (messagesResponse.data && messagesResponse.data.messages) {
            setMessages(messagesResponse.data.messages.map(msg => ({
              id: msg._id,
              content: msg.content,
              sender: msg.sender._id === user.id ? 'current_user' : msg.sender._id,
              senderName: msg.sender.name,
              timestamp: msg.createdAt,
              read: msg.readStatus,
              attachments: msg.attachments || []
            })));
          } else {
            setMessages([]);
          }
        }
        // If we're creating a new conversation
        else if (recipientId) {
          console.log('Creating new conversation with recipient:', recipientId, 'for project:', projectId);

          try {
            // Check if recipientId is undefined or null
            if (!recipientId || recipientId === 'undefined' || recipientId === 'null') {
              throw new Error('Missing or invalid recipient ID');
            }

            // Validate recipient ID format
            if (!recipientId.match(/^[0-9a-fA-F]{24}$/)) {
              throw new Error('Invalid recipient ID format');
            }

            // Check if the user exists
            console.log(`Checking if user with ID ${recipientId} exists`);
            const userExistsResponse = await axiosInstance.current.get(`/api/users/exists/${recipientId}`);

            if (!userExistsResponse.data.exists) {
              throw new Error('User not found. The user you are trying to message may not exist in the system.');
            }

            // Validate project ID format if provided
            if (projectId && !projectId.match(/^[0-9a-fA-F]{24}$/)) {
              throw new Error('Invalid project ID format');
            }

            // Create a new conversation with better error handling
            console.log(`Creating new conversation with recipient: ${recipientId}, project: ${projectId || 'none'}`);
            const createResponse = await axiosInstance.current.post('/api/messages/conversations', {
              participantId: recipientId,
              projectId: projectId || undefined
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            console.log('Create conversation response:', createResponse.data);

            if (!createResponse.data || !createResponse.data.conversation) {
              throw new Error('Invalid response when creating conversation');
            }

            conversationData = createResponse.data.conversation;
            setMessages([]);

            // Instead of redirecting, continue with the current conversation
            console.log('Successfully created conversation:', conversationData._id);

            // Update the URL without reloading the page
            window.history.replaceState(
              null,
              '',
              `/messages/conversations/${conversationData._id}`
            );
          } catch (createErr) {
            console.error('Error creating conversation:', createErr);

            // Log detailed error information
            if (createErr.response) {
              console.error('Error response data:', createErr.response.data);
              console.error('Error response status:', createErr.response.status);
            } else if (createErr.request) {
              console.error('No response received:', createErr.request);
            } else {
              console.error('Error setting up request:', createErr.message);
            }

            // Throw a more descriptive error
            throw new Error('Failed to create conversation: ' + (createErr.response?.data?.message || createErr.message));
          }
        } else {
          throw new Error('Missing recipient ID for new conversation');
        }

        try {
          // Get recipient details
          const recipientId = conversationData.participants.find(p => p !== user.id);
          console.log('Recipient ID:', recipientId);

          if (!recipientId) {
            throw new Error('Could not find recipient in conversation participants');
          }

          console.log(`Fetching recipient details for ID: ${recipientId}`);
          const recipientResponse = await axiosInstance.current.get(`/api/users/${recipientId}`);
          console.log('Recipient response:', recipientResponse.data);

          if (!recipientResponse.data || !recipientResponse.data.user) {
            throw new Error('Invalid recipient data received');
          }

          // Get project details if available
          let projectData = null;
          if (conversationData.project) {
            try {
              console.log(`Fetching project details for ID: ${conversationData.project}`);
              const projectResponse = await axiosInstance.current.get(`/api/projects/${conversationData.project}`);
              console.log('Project response:', projectResponse.data);

              if (projectResponse.data && projectResponse.data.project) {
                projectData = {
                  id: projectResponse.data.project._id,
                  title: projectResponse.data.project.title
                };
              }
            } catch (projectErr) {
              console.error('Error fetching project details:', projectErr);
              // Continue without project data
            }
          }

          // Format conversation data
          setConversation({
            id: conversationData._id,
            recipient: {
              id: recipientResponse.data.user._id,
              name: recipientResponse.data.user.name,
              role: recipientResponse.data.user.role,
              avatar: recipientResponse.data.user.avatar
            },
            project: projectData
          });
        } catch (detailsErr) {
          console.error('Error fetching conversation details:', detailsErr);
          throw new Error('Failed to load conversation details: ' + detailsErr.message);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversation:', err);

        // Log detailed error information
        if (err.response) {
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);

          // Set a more specific error message based on the response
          if (err.response.status === 404) {
            // Store the detailed error message for UI display
            const errorDetails = err.response.data.details || '';

            if (err.response.data.message === 'User not found') {
              setError('User not found. The user you are trying to message may not exist in the system.');
            } else {
              setError('User or project not found. Please check the IDs and try again.');
            }

            // Store additional error details in localStorage for debugging
            if (errorDetails) {
              localStorage.setItem('lastMessageError', JSON.stringify({
                message: err.response.data.message,
                details: errorDetails,
                timestamp: new Date().toISOString()
              }));
            }
          } else if (err.response.status === 401) {
            setError('Authentication error. Please log in again.');
          } else if (err.response.status === 403) {
            setError('You do not have permission to access this conversation.');
          } else {
            setError(`Server error: ${err.response.data.message || 'Failed to load conversation'}`);
          }
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('No response from server. Please check your internet connection and try again.');
        } else {
          console.error('Error setting up request:', err.message);
          setError(`Error: ${err.message}`);
        }

        setLoading(false);
      }
    };

    fetchConversationAndMessages();
  }, [id, user, user.id, token, projectId, recipientId, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up Socket.io for real-time messaging
  useEffect(() => {
    if (!conversation || !conversation.id) return;

    // Create socket connection with auth token
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      auth: {
        token: token
      }
    });
    socketRef.current = socket;

    // Join chat room for this conversation
    socket.on('connect', () => {
      console.log('Socket connected for chat:', socket.id);
      socket.emit('join_chat', conversation.id);
    });

    // Listen for new messages
    socket.on('receive_message', (data) => {
      console.log('New message received:', data);

      // Only process if it's for this conversation
      if (data.chatId === conversation.id) {
        // If the message is from the other user, add it to the messages
        if (data.senderId !== user.id) {
          const newMessageObj = {
            id: data.messageId,
            content: data.content,
            sender: data.senderId,
            senderName: data.senderName,
            timestamp: data.timestamp,
            read: false,
            attachments: data.attachments || []
          };

          setMessages(prevMessages => [...prevMessages, newMessageObj]);

          // Mark the message as read since we're viewing the conversation
          markMessagesAsRead();
        }
      }
    });

    // Listen for read receipts
    socket.on('messages_read', (data) => {
      console.log('Messages read event received:', data);

      // Only process if it's for this conversation and from the other user
      if (data.chatId === conversation.id && data.userId !== user.id) {
        // Update read status for messages sent by current user
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.sender === 'current_user' ? { ...msg, read: true } : msg
          )
        );
      }
    });

    // Clean up on unmount
    return () => {
      console.log('Disconnecting chat socket');
      socket.disconnect();
    };
  }, [conversation, user.id, token]);

  // Mark messages as read when conversation is opened or when new messages arrive
  useEffect(() => {
    if (conversation && conversation.id) {
      markMessagesAsRead();
    }
  }, [conversation]);

  // Function to mark messages as read
  const markMessagesAsRead = async () => {
    if (!conversation || !conversation.id || !axiosInstance.current) {
      console.error('Cannot mark messages as read: missing conversation ID or axios instance');
      return;
    }

    try {
      console.log(`Marking messages as read for conversation: ${conversation.id}`);
      await axiosInstance.current.put(`/api/messages/conversations/${conversation.id}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Messages marked as read');

      // Emit socket event for real-time read receipt update
      if (socketRef.current) {
        socketRef.current.emit('mark_messages_read', {
          chatId: conversation.id,
          userId: user.id
        });
      }

      // Update local message state to show read receipts
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.sender !== 'current_user' ? { ...msg, read: true } : msg
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);

      // Log detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    let currentMessages = [];

    messages.forEach(message => {
      const messageDate = new Date(message.timestamp).toLocaleDateString();

      if (messageDate !== currentDate) {
        if (currentDate) {
          groups.push({
            formattedDate: currentDate,
            messages: currentMessages
          });
        }

        currentDate = messageDate;
        currentMessages = [message];
      } else {
        currentMessages.push(message);
      }
    });

    if (currentMessages.length > 0) {
      groups.push({
        formattedDate: currentDate,
        messages: currentMessages
      });
    }

    return groups;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && files.length === 0) return;

    // Check if we have a configured axios instance
    if (!axiosInstance.current) {
      console.error('Cannot send message: axios not configured');
      alert('Authentication error. Please log in again.');
      return;
    }

    // Check if we have a valid conversation
    if (!conversation || !conversation.id) {
      console.error('Cannot send message: missing conversation ID');
      alert('Conversation error. Please try again.');
      return;
    }

    setSending(true);

    try {
      let response;

      // If we have files, use the attachment endpoint
      if (files.length > 0) {
        setUploadingFiles(true);

        // Include metadata with timestamp and device info for security
        const metadata = JSON.stringify({
          timestamp: new Date().toISOString(),
          device: navigator.userAgent,
          clientId: user.id,
          fileCount: files.length
        });

        const formData = new FormData();
        formData.append('content', newMessage);
        formData.append('metadata', metadata);

        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }

        response = await axiosInstance.current.post(
          `/api/messages/conversations/${conversation.id}/messages/attachments`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setUploadingFiles(false);
      } else {
        // Regular message without attachments
        // Include metadata with timestamp and device info for security
        const metadata = JSON.stringify({
          timestamp: new Date().toISOString(),
          device: navigator.userAgent,
          clientId: user.id
        });

        response = await axiosInstance.current.post(`/api/messages/conversations/${conversation.id}/messages`, {
          content: newMessage,
          metadata
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }

      console.log('Message sent response:', response.data);

      // Add the new message to the list
      const newMessageObj = {
        id: response.data.data._id,
        content: response.data.data.content,
        sender: 'current_user',
        senderName: user.name,
        timestamp: response.data.data.createdAt,
        read: false,
        attachments: response.data.data.attachments || []
      };

      setMessages([...messages, newMessageObj]);
      setNewMessage('');
      setFiles([]);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Emit socket event for real-time update
      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          chatId: conversation.id,
          messageId: response.data.data._id,
          senderId: user.id,
          senderName: user.name,
          content: response.data.data.content,
          timestamp: response.data.data.createdAt,
          attachments: response.data.data.attachments || []
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);

      // Log detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }

      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 5) {
      alert('You can only upload up to 5 files at once.');
      e.target.value = '';
      return;
    }

    setFiles(Array.from(e.target.files));
  };

  // Handle removing a file from the selection
  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));

    // Reset the file input if all files are removed
    if (files.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        {/* Header - Skeleton */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sm:rounded-t-lg">
          <div className="px-6 py-4 sm:px-8 flex justify-between items-center relative">
            <div className="absolute inset-0 bg-white opacity-5 pattern-dots"></div>
            <div className="flex items-center relative z-10">
              <div className="h-6 w-6 bg-white/20 rounded-md mr-4 animate-pulse"></div>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-white/20 animate-pulse"></div>
                <div className="ml-4">
                  <div className="h-6 w-40 bg-white/20 rounded-md animate-pulse mb-2"></div>
                  <div className="h-4 w-60 bg-white/20 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages - Skeleton */}
        <div className="flex-1 bg-gradient-to-b from-indigo-50/50 to-white p-4 overflow-y-auto">
          <div className="flex justify-center mb-6">
            <div className="h-5 w-24 bg-indigo-100 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-64 h-20 rounded-2xl animate-pulse ${i % 2 === 0 ? 'bg-gray-100' : 'bg-indigo-300'}`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Input - Skeleton */}
        <div className="bg-white border-t border-indigo-100 p-4 sm:rounded-b-lg shadow-md">
          <div className="flex items-end">
            <div className="flex-1 mr-3">
              <div className="h-10 bg-indigo-50/50 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-10 w-10 bg-indigo-100 rounded-lg animate-pulse"></div>
              <div className="h-10 w-16 bg-indigo-300 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-red-100 p-8 max-w-2xl mx-auto mt-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Conversation Error</h3>
          <p className="text-base text-gray-600 mb-4">{error}</p>

          {/* Debug information for developers */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Information:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li><strong>Conversation ID:</strong> {id}</li>
              <li><strong>Recipient ID:</strong> {recipientId || 'Not provided'}</li>
              <li><strong>Project ID:</strong> {projectId || 'Not provided'}</li>
              <li><strong>User Authenticated:</strong> {user ? 'Yes' : 'No'}</li>
              <li><strong>Token Available:</strong> {token ? 'Yes' : 'No'}</li>
              <li><strong>Axios Configured:</strong> {axiosInstance.current ? 'Yes' : 'No'}</li>
            </ul>

            {/* User-friendly error explanation */}
            {recipientId === 'undefined' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                <p className="font-medium">Missing Recipient Information</p>
                <p className="mt-1">The user you're trying to message couldn't be identified. Please try again from the user's profile or project page.</p>
              </div>
            )}
            {error && error.includes('User not found') && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                <p className="font-medium">User Not Found</p>
                <p className="mt-1">The user you're trying to message doesn't exist in our system. This could happen if the user was deleted or if there's an issue with the user ID.</p>
                <p className="mt-1">Please go back to the project page and try again.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/messages"
              className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Messages
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-5 py-3 border border-indigo-300 text-base font-medium rounded-lg shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-indigo-100 p-8 max-w-2xl mx-auto mt-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-indigo-100 mb-6">
            <svg className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Conversation Not Found</h3>
          <p className="text-base text-gray-600 mb-6">The conversation you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/messages"
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sm:rounded-t-lg">
        <div className="px-6 py-4 sm:px-8 flex justify-between items-center relative">
          <div className="absolute inset-0 bg-white opacity-5 pattern-dots"></div>
          <div className="flex items-center relative z-10">
            <Link to="/messages" className="mr-4 text-white/80 hover:text-white transition-colors duration-200">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {conversation.recipient.avatar ? (
                  <img
                    className="h-12 w-12 rounded-full border-2 border-white/30 shadow-md"
                    src={conversation.recipient.avatar}
                    alt={conversation.recipient.name}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shadow-md border-2 border-white/30">
                    <span className="text-white font-medium text-lg">
                      {conversation.recipient.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-white">{conversation.recipient.name}</h2>
                <div className="flex items-center">
                  <span className="text-sm text-indigo-100 bg-white/10 px-2 py-0.5 rounded-full">
                    {conversation.recipient.role.charAt(0).toUpperCase() + conversation.recipient.role.slice(1)}
                  </span>
                  {conversation.project && (
                    <span className="ml-2 text-sm text-indigo-100">
                      <span className="mx-1 text-indigo-200">•</span>
                      Project: <span className="font-medium">{conversation.project.title}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-gradient-to-b from-indigo-50/50 to-white p-4 overflow-y-auto">
        {messageGroups.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-indigo-50 max-w-md">
              <div className="bg-indigo-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Start a Conversation</h3>
              <p className="mt-2 text-base text-gray-600">
                Send a message to begin your conversation with {conversation.recipient.name}.
              </p>
            </div>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4 mb-6">
              <div className="flex justify-center">
                <div className="bg-indigo-100 rounded-full px-3 py-1 shadow-sm">
                  <span className="text-xs font-medium text-indigo-800">{group.formattedDate}</span>
                </div>
              </div>

              {group.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'current_user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 shadow-sm ${
                      message.sender === 'current_user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-white text-gray-900 border border-indigo-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2 border-t pt-2 border-white/20">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center">
                            <svg className="h-4 w-4 mr-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs truncate ${
                                message.sender === 'current_user' ? 'text-indigo-100 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'
                              }`}
                            >
                              {attachment.name}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end items-center mt-1">
                      {message.sender === 'current_user' && (
                        <span
                          className={`mr-1 ${
                            message.read ? 'text-indigo-200' : 'text-indigo-100'
                          }`}
                          title={message.read ? 'Read' : 'Delivered'}
                        >
                          {message.read ? (
                            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                            </svg>
                          )}
                        </span>
                      )}
                      <p
                        className={`text-xs ${
                          message.sender === 'current_user' ? 'text-indigo-200' : 'text-gray-500'
                        }`}
                      >
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-indigo-100 p-4 sm:rounded-b-lg shadow-md">
        {/* Selected files preview */}
        {files.length > 0 && (
          <div className="mb-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <div className="text-xs font-medium text-indigo-700 mb-2">Selected files:</div>
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-white px-3 py-1.5 rounded-full border border-indigo-200 text-xs shadow-sm">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 text-indigo-400 hover:text-indigo-600 transition-colors duration-150"
                  >
                    <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end">
          <div className="flex-1 mr-3">
            <textarea
              rows="1"
              name="message"
              id="message"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm border-indigo-200 rounded-lg resize-none py-3 transition-all duration-200"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <div className="flex space-x-2">
            <label htmlFor="file-upload" className="cursor-pointer">
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <div className="inline-flex items-center px-3 py-3 border border-indigo-200 shadow-sm text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
            </label>
            <button
              type="submit"
              disabled={sending || (newMessage.trim() === '' && files.length === 0)}
              className={`inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${
                sending || (newMessage.trim() === '' && files.length === 0)
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200'
              }`}
            >
              {sending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploadingFiles ? 'Uploading...' : 'Sending...'}
                </>
              ) : (
                <>
                  <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RealConversationDetails;
