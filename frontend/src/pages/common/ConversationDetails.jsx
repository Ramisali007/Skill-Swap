import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ConversationDetails = () => {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversation = async () => {
      setLoading(true);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock conversation data
        const mockConversation = {
          id: id,
          recipient: {
            id: '101',
            name: 'John Doe',
            role: 'freelancer',
            avatar: null
          },
          project: {
            id: '201',
            title: 'E-commerce Website Development'
          }
        };

        // Mock messages data
        const mockMessages = [
          {
            id: '1',
            content: 'Hi there! I\'m interested in discussing the project requirements in more detail.',
            sender: '101',
            timestamp: '2023-07-15T10:30:00Z',
            read: true
          },
          {
            id: '2',
            content: 'Hello! Sure, I\'d be happy to discuss the project with you. What specific aspects would you like to know more about?',
            sender: 'current_user',
            timestamp: '2023-07-15T10:35:00Z',
            read: true
          },
          {
            id: '3',
            content: 'I was wondering about the timeline for the project. When do you need it completed by?',
            sender: '101',
            timestamp: '2023-07-15T10:40:00Z',
            read: true
          },
          {
            id: '4',
            content: 'We\'re looking to have the project completed within 6 weeks. Is that feasible for you?',
            sender: 'current_user',
            timestamp: '2023-07-15T10:45:00Z',
            read: true
          },
          {
            id: '5',
            content: 'Yes, that timeline works for me. I can deliver the project within 6 weeks.',
            sender: '101',
            timestamp: '2023-07-15T10:50:00Z',
            read: true
          },
          {
            id: '6',
            content: 'Great! Another question I had was about the payment structure. Will it be milestone-based or a single payment at the end?',
            sender: '101',
            timestamp: '2023-07-15T10:55:00Z',
            read: true
          },
          {
            id: '7',
            content: 'We prefer milestone-based payments. We can set up 3 milestones: initial design approval, functional prototype, and final delivery.',
            sender: 'current_user',
            timestamp: '2023-07-15T11:00:00Z',
            read: true
          },
          {
            id: '8',
            content: 'That sounds perfect. I\'m comfortable with milestone-based payments.',
            sender: '101',
            timestamp: '2023-07-15T11:05:00Z',
            read: true
          },
          {
            id: '9',
            content: 'Do you have any specific design preferences or examples of websites you like?',
            sender: '101',
            timestamp: '2023-07-15T14:30:00Z',
            read: true
          }
        ];

        setConversation(mockConversation);
        setMessages(mockMessages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversation:', err);
        setLoading(false);
      }
    };

    fetchConversation();
  }, [id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for message groups
  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};

    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateString = date.toDateString();

      if (!groups[dateString]) {
        groups[dateString] = [];
      }

      groups[dateString].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      formattedDate: formatMessageDate(date),
      messages
    }));
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newMessageObj = {
        id: `new-${Date.now()}`,
        content: newMessage,
        sender: 'current_user',
        timestamp: new Date().toISOString(),
        read: false
      };

      setMessages([...messages, newMessageObj]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-sm text-indigo-600 font-medium">Loading conversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="bg-white shadow-lg overflow-hidden rounded-xl p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
            <svg className="h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">Conversation not found</h3>
          <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
            The conversation you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            to="/messages"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 shadow-lg sm:rounded-t-xl">
        <div className="px-6 py-4 sm:px-8 flex justify-between items-center relative">
          <div className="absolute inset-0 bg-white opacity-5"></div>
          <div className="flex items-center relative z-10">
            <Link to="/messages" className="mr-4 text-white hover:text-indigo-200 transition-colors duration-200">
              <div className="bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors duration-200">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            </Link>
            <div className="flex items-center">
              <div className="flex-shrink-0 relative">
                {conversation.recipient.avatar ? (
                  <img
                    className="h-12 w-12 rounded-full border-2 border-white/30 shadow-md"
                    src={conversation.recipient.avatar}
                    alt={conversation.recipient.name}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shadow-md border-2 border-white/30">
                    <span className="text-white font-medium text-lg">
                      {conversation.recipient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-bold text-white flex items-center">
                  {conversation.recipient.name}
                  <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 text-white`}>
                    {conversation.recipient.role.charAt(0).toUpperCase() + conversation.recipient.role.slice(1)}
                  </span>
                </h2>
                {conversation.project && (
                  <p className="text-sm text-indigo-100 flex items-center">
                    <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {conversation.project.title}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-gradient-to-b from-indigo-50/50 to-white p-6 overflow-y-auto">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-6 mb-8">
            <div className="flex justify-center">
              <div className="bg-indigo-100 rounded-full px-4 py-1 shadow-sm">
                <span className="text-xs font-medium text-indigo-700">{group.formattedDate}</span>
              </div>
            </div>

            {group.messages.map((message, messageIndex) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'current_user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender !== 'current_user' && (
                  <div className="flex-shrink-0 mr-2 self-end mb-1">
                    {conversation.recipient.avatar ? (
                      <img
                        className="h-8 w-8 rounded-full border border-indigo-100"
                        src={conversation.recipient.avatar}
                        alt={conversation.recipient.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {conversation.recipient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 shadow-sm ${
                    message.sender === 'current_user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white text-gray-900 border border-indigo-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 text-right ${
                      message.sender === 'current_user' ? 'text-indigo-200' : 'text-indigo-400'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
                {message.sender === 'current_user' && (
                  <div className="flex-shrink-0 ml-2 self-end mb-1">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-indigo-100 px-6 py-5 sm:px-8 sm:rounded-b-xl shadow-inner">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <div className="flex-1 relative">
            <label htmlFor="message" className="sr-only">Message</label>
            <textarea
              id="message"
              name="message"
              rows="2"
              className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-indigo-200 rounded-xl py-3 px-4 pr-12 transition-colors duration-200 resize-none"
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            ></textarea>
            <div className="absolute right-3 bottom-2 text-xs text-indigo-400">
              Press Enter to send
            </div>
          </div>
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="inline-flex items-center rounded-xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-5 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {sending ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationDetails;
