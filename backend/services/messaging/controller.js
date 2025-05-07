const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const User = require('../../models/User');
const Project = require('../../models/Project');
const Notification = require('../../models/Notification');
const crypto = require('crypto');

// Get all conversations for current user
exports.getConversations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    console.log(`Getting conversations for user: ${req.userId}, page: ${page}, limit: ${limit}`);

    // Find conversations where user is a participant
    const conversations = await Conversation.find({
      participants: req.userId
    })
      .populate({
        path: 'participants',
        select: 'name email role'
      })
      .populate({
        path: 'lastMessage',
        select: 'content createdAt readStatus sender'
      })
      .populate({
        path: 'project',
        select: 'title description'
      })
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log(`Found ${conversations.length} conversations for user ${req.userId}`);

    // Count total conversations
    const total = await Conversation.countDocuments({
      participants: req.userId
    });

    // Format conversations for response with better error handling
    const formattedConversations = conversations.map(conversation => {
      try {
        // Get the other participant (not the current user)
        const otherParticipants = conversation.participants.filter(
          participant => participant._id && participant._id.toString() !== req.userId.toString()
        );

        // Handle unreadCount safely
        let unreadCount = 0;
        if (conversation.unreadCount && conversation.unreadCount instanceof Map) {
          unreadCount = conversation.unreadCount.get(req.userId.toString()) || 0;
        } else if (conversation.unreadCount && typeof conversation.unreadCount === 'object') {
          unreadCount = conversation.unreadCount[req.userId.toString()] || 0;
        }

        return {
          _id: conversation._id,
          participants: conversation.participants,
          otherParticipants,
          project: conversation.project,
          lastMessage: conversation.lastMessage,
          unreadCount: unreadCount,
          updatedAt: conversation.updatedAt
        };
      } catch (err) {
        console.error('Error formatting conversation:', err);
        // Return a minimal valid conversation object
        return {
          _id: conversation._id,
          participants: conversation.participants || [],
          otherParticipants: [],
          project: null,
          lastMessage: null,
          unreadCount: 0,
          updatedAt: conversation.updatedAt || new Date()
        };
      }
    });

    console.log(`Returning ${formattedConversations.length} formatted conversations`);

    res.status(200).json({
      conversations: formattedConversations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({
      message: 'Failed to retrieve conversations',
      error: error.message
    });
  }
};

// Create a new conversation or get existing one
exports.createConversation = async (req, res, next) => {
  try {
    const { participantId, projectId } = req.body;
    console.log(`Creating/retrieving conversation: user ${req.userId} with participant ${participantId}, project ${projectId || 'none'}`);

    // Validate participant
    let participant;
    try {
      participant = await User.findById(participantId);

      if (!participant) {
        console.log(`Participant with ID ${participantId} not found`);
        return res.status(404).json({
          message: 'User not found',
          details: `The user with ID ${participantId} does not exist in the database.`
        });
      }
    } catch (err) {
      console.log(`Error finding participant with ID ${participantId}: ${err.message}`);
      return res.status(400).json({
        message: 'Invalid user ID format or database error',
        details: err.message
      });
    }

    console.log(`Found participant: ${participant.name} (${participant._id})`);

    // Check if project exists if provided
    let project = null;
    if (projectId) {
      project = await Project.findById(projectId);

      if (!project) {
        console.log(`Project with ID ${projectId} not found`);
        return res.status(404).json({ message: 'Project not found' });
      }

      console.log(`Found project: ${project.title} (${project._id})`);
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, participantId] },
      ...(projectId ? { project: projectId } : { project: { $exists: false } })
    });

    if (conversation) {
      console.log(`Found existing conversation: ${conversation._id}`);
    } else {
      console.log('No existing conversation found, creating new one');

      // If conversation doesn't exist, create a new one
      conversation = new Conversation({
        participants: [req.userId, participantId],
        project: projectId,
        unreadCount: new Map([[participantId.toString(), 0], [req.userId.toString(), 0]])
      });

      await conversation.save();
      console.log(`Created new conversation: ${conversation._id}`);
    }

    // Return the conversation with populated participants
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate({
        path: 'participants',
        select: 'name'
      })
      .populate({
        path: 'project',
        select: 'title'
      });

    res.status(200).json({
      message: 'Conversation created/retrieved successfully',
      conversation: populatedConversation
    });
  } catch (error) {
    console.error('Error in createConversation:', error);
    next(error);
  }
};

// Get conversation by ID
exports.getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Getting conversation with ID: ${id} for user: ${req.userId}`);

    // Find conversation
    const conversation = await Conversation.findById(id)
      .populate({
        path: 'participants',
        select: 'name'
      })
      .populate({
        path: 'project',
        select: 'title'
      });

    if (!conversation) {
      console.log(`Conversation with ID ${id} not found`);
      return res.status(404).json({ message: 'Conversation not found' });
    }

    console.log('Found conversation:', {
      id: conversation._id,
      participants: conversation.participants.map(p => p._id),
      project: conversation.project
    });

    // Check if user is a participant
    const isParticipant = conversation.participants.some(participant =>
      participant._id.toString() === req.userId.toString()
    );

    if (!isParticipant) {
      console.log(`User ${req.userId} is not authorized to view conversation ${id}`);
      return res.status(403).json({ message: 'You are not authorized to view this conversation' });
    }

    // Get the other participant (not the current user)
    const otherParticipants = conversation.participants.filter(
      participant => participant._id.toString() !== req.userId.toString()
    );

    console.log('Other participants:', otherParticipants);

    const conversationData = {
      ...conversation.toObject(),
      otherParticipants
    };

    res.status(200).json({
      conversation: conversationData
    });
  } catch (error) {
    console.error('Error in getConversationById:', error);
    next(error);
  }
};

// Get messages in a conversation
exports.getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    console.log(`Getting messages for conversation ID: ${id}, user: ${req.userId}, page: ${page}, limit: ${limit}`);

    // Validate conversation ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`Invalid conversation ID format: ${id}`);
      return res.status(400).json({ message: 'Invalid conversation ID format' });
    }

    // Find conversation
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      console.log(`Conversation with ID ${id} not found`);
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(participant => {
      const participantId = participant._id ? participant._id.toString() : participant.toString();
      return participantId === req.userId.toString();
    });

    if (!isParticipant) {
      console.log(`User ${req.userId} is not authorized to view messages in conversation ${id}`);
      return res.status(403).json({ message: 'You are not authorized to view these messages' });
    }

    try {
      // Find messages with pagination (newest first)
      const messages = await Message.find({ conversation: id })
        .populate({
          path: 'sender',
          select: 'name email role'
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      console.log(`Found ${messages.length} messages for conversation ${id}`);

      // Count total messages
      const total = await Message.countDocuments({ conversation: id });

      try {
        // Mark messages as read
        await Message.updateMany(
          {
            conversation: id,
            receiver: req.userId,
            readStatus: false
          },
          {
            readStatus: true,
            readAt: Date.now()
          }
        );

        // Reset unread count for this user
        if (conversation.unreadCount && conversation.unreadCount instanceof Map) {
          conversation.unreadCount.set(req.userId.toString(), 0);
          await conversation.save();
        } else if (conversation.unreadCount && typeof conversation.unreadCount === 'object') {
          conversation.unreadCount[req.userId.toString()] = 0;
          await conversation.save();
        }
      } catch (markError) {
        // Log error but continue - marking as read is not critical
        console.error('Error marking messages as read:', markError);
      }

      // Reverse to get oldest first for client display
      const orderedMessages = messages.reverse();

      res.status(200).json({
        messages: orderedMessages,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } catch (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return res.status(500).json({
        message: 'Failed to retrieve messages',
        error: messagesError.message
      });
    }
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      message: 'An error occurred while retrieving messages',
      error: error.message
    });
  }
};

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, metadata } = req.body;

    // Find conversation
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'You are not authorized to send messages in this conversation' });
    }

    // Get receiver (the other participant)
    const receiver = conversation.participants.find(
      participant => participant.toString() !== req.userId.toString()
    );

    // Create new message
    const message = new Message({
      conversation: id,
      sender: req.userId,
      receiver,
      content,
      metadata: metadata ? metadata : undefined,
      readStatus: false
    });

    await message.save();

    // Update conversation with last message
    conversation.lastMessage = message._id;

    // Increment unread count for receiver
    const receiverUnreadCount = conversation.unreadCount.get(receiver.toString()) || 0;
    conversation.unreadCount.set(receiver.toString(), receiverUnreadCount + 1);

    await conversation.save();

    // Create notification for receiver
    const notification = new Notification({
      recipient: receiver,
      type: 'message',
      title: 'New Message',
      message: 'You have received a new message',
      link: `/messages/conversations/${id}`,
      relatedId: message._id,
      relatedModel: 'Message'
    });

    await notification.save();

    // Populate sender info for response
    await message.populate({
      path: 'sender',
      select: 'name'
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// Send a message with attachments
exports.sendMessageWithAttachments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, metadata } = req.body;

    // Find conversation
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'You are not authorized to send messages in this conversation' });
    }

    // Get receiver (the other participant)
    const receiver = conversation.participants.find(
      participant => participant.toString() !== req.userId.toString()
    );

    // Process uploaded files
    const attachments = req.files.map(file => ({
      name: file.originalname,
      url: file.path,
      type: file.mimetype
    }));

    // Create new message
    const message = new Message({
      conversation: id,
      sender: req.userId,
      receiver,
      content,
      metadata: metadata ? metadata : undefined,
      attachments,
      readStatus: false
    });

    await message.save();

    // Update conversation with last message
    conversation.lastMessage = message._id;

    // Increment unread count for receiver
    const receiverUnreadCount = conversation.unreadCount.get(receiver.toString()) || 0;
    conversation.unreadCount.set(receiver.toString(), receiverUnreadCount + 1);

    await conversation.save();

    // Create notification for receiver
    const notification = new Notification({
      recipient: receiver,
      type: 'message',
      title: 'New Message with Attachments',
      message: 'You have received a new message with attachments',
      link: `/messages/conversations/${id}`,
      relatedId: message._id,
      relatedModel: 'Message'
    });

    await notification.save();

    // Populate sender info for response
    await message.populate({
      path: 'sender',
      select: 'name'
    });

    res.status(201).json({
      message: 'Message with attachments sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// Mark messages as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find conversation
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'You are not authorized to access this conversation' });
    }

    // Update all unread messages sent to the current user
    await Message.updateMany(
      {
        conversation: id,
        receiver: req.userId,
        readStatus: false
      },
      {
        readStatus: true,
        readAt: Date.now()
      }
    );

    // Reset unread count for current user
    conversation.unreadCount.set(req.userId.toString(), 0);
    await conversation.save();

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

// Delete a message
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find message
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this message' });
    }

    // Check if message was sent within the last hour (can only delete recent messages)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (message.createdAt < oneHourAgo) {
      return res.status(400).json({ message: 'Messages can only be deleted within one hour of sending' });
    }

    // Delete message
    await Message.deleteOne({ _id: id });

    // If this was the last message in the conversation, update the lastMessage field
    const conversation = await Conversation.findById(message.conversation);

    if (conversation.lastMessage && conversation.lastMessage.toString() === id) {
      // Find the new last message
      const newLastMessage = await Message.findOne({ conversation: conversation._id })
        .sort({ createdAt: -1 });

      conversation.lastMessage = newLastMessage ? newLastMessage._id : null;
      await conversation.save();
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res, next) => {
  try {
    // Count total unread messages across all conversations
    const conversations = await Conversation.find({
      participants: req.userId
    });

    let totalUnread = 0;

    for (const conversation of conversations) {
      totalUnread += conversation.unreadCount.get(req.userId.toString()) || 0;
    }

    res.status(200).json({ unreadCount: totalUnread });
  } catch (error) {
    next(error);
  }
};
