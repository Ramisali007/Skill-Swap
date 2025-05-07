import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const RealMessaging = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching conversations for user:', user.id);

        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/messages/conversations?_=${timestamp}`);

        console.log('Conversations API response:', response);

        if (!response.data || !response.data.conversations) {
          console.error('Invalid response format:', response.data);
          throw new Error('Invalid response format');
        }

        // Transform data with better error handling
        const conversationsData = await Promise.all(response.data.conversations.map(async (conv) => {
          try {
            // Get the other participant (not the current user)
            const otherParticipantId = conv.participants.find(p => {
              return p._id ? p._id.toString() !== user.id : p.toString() !== user.id;
            });

            const participantId = otherParticipantId._id || otherParticipantId;
            console.log('Fetching details for participant:', participantId);

            // Fetch user details
            const userResponse = await axios.get(`/api/users/${participantId}`);

            if (!userResponse.data || !userResponse.data.user) {
              console.error('Invalid user response:', userResponse.data);
              throw new Error('Failed to fetch user details');
            }

            // Fetch project details if available
            let projectData = null;
            if (conv.project) {
              try {
                const projectId = conv.project._id || conv.project;
                const projectResponse = await axios.get(`/api/projects/${projectId}`);

                if (projectResponse.data && projectResponse.data.project) {
                  projectData = {
                    id: projectResponse.data.project._id,
                    title: projectResponse.data.project.title
                  };
                }
              } catch (err) {
                console.error('Error fetching project:', err);
                // Continue without project data
              }
            }

            // Get last message data
            let lastMessageData = null;
            if (conv.lastMessage) {
              try {
                // If lastMessage is already populated, use it directly
                if (typeof conv.lastMessage === 'object' && conv.lastMessage.content) {
                  lastMessageData = {
                    id: conv.lastMessage._id,
                    content: conv.lastMessage.content,
                    sender: conv.lastMessage.sender === user.id ? 'current_user' : conv.lastMessage.sender,
                    timestamp: conv.lastMessage.createdAt,
                    read: conv.lastMessage.readStatus
                  };
                } else {
                  // Otherwise fetch the message
                  const messageId = conv.lastMessage._id || conv.lastMessage;
                  const messageResponse = await axios.get(`/api/messages/conversations/${conv._id}/messages`);

                  if (messageResponse.data && messageResponse.data.messages && messageResponse.data.messages.length > 0) {
                    const msg = messageResponse.data.messages[0];
                    lastMessageData = {
                      id: msg._id,
                      content: msg.content,
                      sender: msg.sender._id === user.id ? 'current_user' : msg.sender._id,
                      timestamp: msg.createdAt,
                      read: msg.readStatus
                    };
                  }
                }
              } catch (err) {
                console.error('Error fetching last message:', err);
                // Continue without last message data
              }
            }

            return {
              id: conv._id,
              recipient: {
                id: userResponse.data.user._id,
                name: userResponse.data.user.name,
                role: userResponse.data.user.role,
                avatar: userResponse.data.user.avatar
              },
              lastMessage: lastMessageData,
              unreadCount: conv.unreadCount ? (conv.unreadCount.get(user.id.toString()) || 0) : 0,
              project: projectData
            };
          } catch (err) {
            console.error('Error processing conversation:', err);
            // Return a minimal conversation object to avoid breaking the UI
            return {
              id: conv._id,
              recipient: {
                id: 'unknown',
                name: 'Unknown User',
                role: 'unknown',
                avatar: null
              },
              lastMessage: null,
              unreadCount: 0,
              project: null
            };
          }
        }));

        console.log('Processed conversations:', conversationsData);
        setConversations(conversationsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);

        // Log detailed error information
        if (err.response) {
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
        } else if (err.request) {
          console.error('No response received:', err.request);
        } else {
          console.error('Error setting up request:', err.message);
        }

        setError('Failed to load conversations. Please try again later.');
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user.id]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      conversation.recipient.name.toLowerCase().includes(searchTermLower) ||
      (conversation.project && conversation.project.title.toLowerCase().includes(searchTermLower)) ||
      (conversation.lastMessage && conversation.lastMessage.content.toLowerCase().includes(searchTermLower))
    );
  });

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);

    // If the message is from today, show the time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // If the message is from this week, show the day name
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }

    // Otherwise, show the date
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header - Skeleton */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg overflow-hidden rounded-xl">
          <div className="px-6 py-6 sm:px-8 relative">
            <div className="absolute inset-0 bg-white opacity-5 pattern-dots"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-white/20 rounded-md mr-3 animate-pulse"></div>
                <div className="h-8 w-40 bg-white/20 rounded-md animate-pulse"></div>
              </div>
              <div className="mt-2 h-5 w-64 bg-white/20 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Search - Skeleton */}
        <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-indigo-50">
          <div className="px-6 py-5 sm:px-8">
            <div className="w-full h-10 bg-indigo-50/50 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Conversations List - Skeleton */}
        <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-indigo-50">
          <div className="px-6 py-4 sm:px-8 border-b border-indigo-50">
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-5 w-20 bg-indigo-100 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="divide-y divide-indigo-50">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 animate-pulse"></div>
                    <div className="ml-4">
                      <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                      <div className="h-4 w-48 bg-gray-100 rounded-md animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-indigo-50 rounded-full animate-pulse"></div>
                </div>
                <div className="mt-2 ml-16 h-4 w-3/4 bg-gray-100 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg overflow-hidden rounded-xl">
          <div className="px-6 py-6 sm:px-8 relative">
            <div className="absolute inset-0 bg-white opacity-5 pattern-dots"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h1 className="text-2xl leading-6 font-bold text-white">Messages</h1>
              </div>
              <p className="mt-2 max-w-2xl text-base text-indigo-100">
                Communicate with clients, freelancers, and administrators.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-red-100 p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Messages</h3>
            <p className="text-base text-gray-600 max-w-md mx-auto mb-6">
              {error} This could be due to a network issue or server problem.
            </p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                // Force reload with a slight delay
                setTimeout(() => window.location.reload(), 500);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg overflow-hidden rounded-xl">
        <div className="px-6 py-6 sm:px-8 relative">
          <div className="absolute inset-0 bg-white opacity-5 pattern-dots"></div>
          <div className="relative z-10">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h1 className="text-2xl leading-6 font-bold text-white">Messages</h1>
            </div>
            <p className="mt-2 max-w-2xl text-base text-indigo-100">
              Communicate with clients, freelancers, and administrators.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-indigo-50">
        <div className="px-6 py-5 sm:px-8">
          <div className="w-full">
            <label htmlFor="search" className="sr-only">
              Search conversations
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-3 border border-indigo-100 rounded-lg leading-5 bg-indigo-50/30 placeholder-indigo-400 focus:outline-none focus:placeholder-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                placeholder="Search conversations by name, project or message content..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-indigo-50">
        <div className="px-6 py-4 sm:px-8 border-b border-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <h2 className="text-lg leading-6 font-bold text-gray-900">Your Conversations</h2>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {filteredConversations.length} {filteredConversations.length === 1 ? 'conversation' : 'conversations'}
            </span>
          </div>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="px-6 py-12 sm:px-8 text-center">
            <div className="bg-indigo-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-10 w-10 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No conversations found</h3>
            <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
              {searchTerm
                ? `No conversations matching "${searchTerm}". Try a different search term.`
                : "You don't have any conversations yet. When you connect with other users, your conversations will appear here."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-indigo-50">
            {filteredConversations.map((conversation) => (
              <li key={conversation.id} className="transition-colors duration-200 hover:bg-indigo-50/50">
                <Link
                  to={`/messages/conversations/${conversation.id}`}
                  className="block"
                >
                  <div className="px-6 py-5 sm:px-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 relative">
                          {conversation.recipient.avatar ? (
                            <img
                              className="h-12 w-12 rounded-full border-2 border-indigo-100 shadow-sm"
                              src={conversation.recipient.avatar}
                              alt={conversation.recipient.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center shadow-sm">
                              <span className="text-white font-medium text-lg">
                                {conversation.recipient.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          {conversation.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full ring-2 ring-white">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-base font-semibold text-gray-900">{conversation.recipient.name}</h3>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {conversation.recipient.role.charAt(0).toUpperCase() + conversation.recipient.role.slice(1)}
                            </span>
                          </div>
                          {conversation.project && (
                            <p className="text-sm text-indigo-600 mt-0.5">
                              <span className="font-medium">Project:</span> {conversation.project.title}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {conversation.lastMessage && (
                          <p className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                            {formatTimestamp(conversation.lastMessage.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 ml-16">
                      {conversation.lastMessage ? (
                        <p className={`text-sm ${conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'} truncate`}>
                          {conversation.lastMessage.sender === 'current_user' ? (
                            <span className="text-indigo-600 font-medium">You: </span>
                          ) : ''}
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No messages yet</p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RealMessaging;
