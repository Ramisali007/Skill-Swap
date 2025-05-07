const express = require('express');
const router = express.Router();
const notificationController = require('./controller');
const { verifyToken, checkRole } = require('../../middlewares/auth');

// User notification routes
// Get all notifications for current user
router.get('/', verifyToken, notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', verifyToken, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', verifyToken, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', verifyToken, notificationController.deleteNotification);

// Get unread notification count
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);

// Update notification preferences
router.put('/preferences', verifyToken, notificationController.updatePreferences);

// Notification sending routes
// Send email notification
router.post('/email', verifyToken, notificationController.sendEmailNotification);

// Send SMS notification
router.post('/sms', verifyToken, notificationController.sendSmsNotification);

// Template management routes (admin only)
// Get all templates
router.get('/templates', verifyToken, checkRole('admin'), notificationController.getTemplates);

// Get template by ID
router.get('/templates/:id', verifyToken, checkRole('admin'), notificationController.getTemplateById);

// Create template
router.post('/templates', verifyToken, checkRole('admin'), notificationController.createTemplate);

// Update template
router.put('/templates/:id', verifyToken, checkRole('admin'), notificationController.updateTemplate);

// Delete template
router.delete('/templates/:id', verifyToken, checkRole('admin'), notificationController.deleteTemplate);

// Scheduled notification routes (admin only)
// Get all scheduled notifications
router.get('/scheduled', verifyToken, checkRole('admin'), notificationController.getScheduledNotifications);

// Get scheduled notification by ID
router.get('/scheduled/:id', verifyToken, checkRole('admin'), notificationController.getScheduledNotificationById);

// Create scheduled notification
router.post('/scheduled', verifyToken, checkRole('admin'), notificationController.createScheduledNotification);

// Cancel scheduled notification
router.put('/scheduled/:id/cancel', verifyToken, checkRole('admin'), notificationController.cancelScheduledNotification);

module.exports = router;
