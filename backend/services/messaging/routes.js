const express = require('express');
const router = express.Router();
const messagingController = require('./controller');
const { verifyToken, isVerified } = require('../../middlewares/auth');
const { upload, setUploadType } = require('../../middlewares/upload');

// Get all conversations for current user
router.get('/conversations', verifyToken, messagingController.getConversations);

// Get or create conversation with another user
router.post('/conversations', verifyToken, messagingController.createConversation);

// Get conversation by ID
router.get('/conversations/:id', verifyToken, messagingController.getConversationById);

// Get messages in a conversation
router.get('/conversations/:id/messages', verifyToken, messagingController.getMessages);

// Send a message
router.post(
  '/conversations/:id/messages',
  verifyToken,
  messagingController.sendMessage
);

// Send a message with attachments
router.post(
  '/conversations/:id/messages/attachments',
  verifyToken,
  setUploadType('message'),
  upload.array('files', 5),
  messagingController.sendMessageWithAttachments
);

// Mark messages as read
router.put('/conversations/:id/read', verifyToken, messagingController.markAsRead);

// Delete a message
router.delete('/messages/:id', verifyToken, messagingController.deleteMessage);

// Get unread message count
router.get('/unread-count', verifyToken, messagingController.getUnreadCount);

module.exports = router;
