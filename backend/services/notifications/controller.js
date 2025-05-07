const Notification = require('../../models/Notification');
const NotificationTemplate = require('../../models/NotificationTemplate');
const ScheduledNotification = require('../../models/ScheduledNotification');
const User = require('../../models/User');
const notificationService = require('./service');

// Get all notifications for current user
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    console.log('Getting notifications for user:', req.userId);
    console.log('Query params:', { page, limit, type });

    // Build query
    const query = { recipient: req.userId };

    if (type) {
      query.type = type;
    }

    console.log('Query:', query);

    // Count total notifications
    const total = await Notification.countDocuments(query);
    console.log('Total notifications found:', total);

    // Find notifications with pagination
    let notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Ensure all notifications have valid links
    notifications = notifications.map(notification => {
      // If notification doesn't have a link or has an invalid link, set a default link based on type
      if (!notification.link || notification.link === '#' || notification.link === '') {
        switch (notification.type) {
          case 'project':
            notification.link = '/freelancer/browse-projects';
            break;
          case 'bid':
            notification.link = '/freelancer/projects';
            break;
          case 'message':
            notification.link = '/messages';
            break;
          case 'review':
            notification.link = '/freelancer/profile';
            break;
          case 'verification':
            notification.link = '/profile';
            break;
          case 'system':
          default:
            notification.link = '/dashboard';
            break;
        }
      }
      return notification;
    });

    console.log('Notifications found:', notifications.length);

    if (notifications.length > 0) {
      console.log('Sample notification:', {
        id: notifications[0]._id,
        title: notifications[0].title,
        type: notifications[0].type,
        read: notifications[0].read
      });
    }

    const response = {
      notifications,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    };

    console.log('Response metadata:', {
      totalPages: response.totalPages,
      currentPage: response.currentPage,
      total: response.total
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    next(error);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find notification
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to access this notification' });
    }

    // Update notification
    notification.read = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    console.log('markAllAsRead called for user:', req.userId);
    const { type } = req.body || {};

    // Build query
    const query = {
      recipient: req.userId,
      read: false
    };

    if (type) {
      query.type = type;
    }

    console.log('Query for marking all as read:', query);

    // Update all unread notifications
    const result = await Notification.updateMany(
      query,
      { read: true }
    );

    console.log('Marked notifications as read:', result.modifiedCount);

    // Get updated notifications
    const updatedNotifications = await Notification.find({ recipient: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      message: 'All notifications marked as read',
      count: result.modifiedCount,
      notifications: updatedNotifications
    });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    next(error);
  }
};

// Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find notification
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this notification' });
    }

    // Delete notification
    await Notification.deleteOne({ _id: id });

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res, next) => {
  try {
    // Count unread notifications
    const count = await Notification.countDocuments({
      recipient: req.userId,
      read: false
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};

// Send email notification
exports.sendEmailNotification = async (req, res, next) => {
  try {
    const { recipientId, subject, message, templateName, templateData } = req.body;

    // If template name is provided, use template
    if (templateName) {
      const result = await notificationService.sendNotificationByTemplate(
        templateName,
        recipientId,
        templateData || {},
        { email: true, sms: false, inApp: true }
      );

      return res.status(200).json({
        message: 'Email notification sent successfully using template',
        result
      });
    }

    // Otherwise, use direct message
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Send email
    await notificationService.sendEmail(
      recipient.email,
      subject,
      `
        <h1>${subject}</h1>
        <p>${message}</p>
        <p>This email was sent from the SkillSwap platform.</p>
      `
    );

    // Create notification record
    const notification = await notificationService.createInAppNotification(
      recipientId,
      'system',
      subject,
      message
    );

    res.status(200).json({
      message: 'Email notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
    next(error);
  }
};

// Send SMS notification
exports.sendSmsNotification = async (req, res, next) => {
  try {
    const { recipientId, message, templateName, templateData } = req.body;

    // If template name is provided, use template
    if (templateName) {
      const result = await notificationService.sendNotificationByTemplate(
        templateName,
        recipientId,
        templateData || {},
        { email: false, sms: true, inApp: true }
      );

      return res.status(200).json({
        message: 'SMS notification sent successfully using template',
        result
      });
    }

    // Otherwise, use direct message
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if recipient has a phone number
    if (!recipient.phone) {
      return res.status(400).json({ message: 'Recipient does not have a phone number' });
    }

    // Send SMS
    await notificationService.sendSMS(recipient.phone, message);

    // Create notification record
    const notification = await notificationService.createInAppNotification(
      recipientId,
      'system',
      'SMS Notification',
      message
    );

    res.status(200).json({
      message: 'SMS notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    next(error);
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const preferences = req.body;

    // Find user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update notification preferences
    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }

    // Update email preferences
    if (preferences.email) {
      if (!user.notificationPreferences.email) {
        user.notificationPreferences.email = {};
      }

      if (preferences.email.enabled !== undefined) {
        user.notificationPreferences.email.enabled = preferences.email.enabled;
      }

      if (preferences.email.types) {
        if (!user.notificationPreferences.email.types) {
          user.notificationPreferences.email.types = {};
        }

        Object.assign(user.notificationPreferences.email.types, preferences.email.types);
      }

      if (preferences.email.frequency) {
        user.notificationPreferences.email.frequency = preferences.email.frequency;
      }
    }

    // Update SMS preferences
    if (preferences.sms) {
      if (!user.notificationPreferences.sms) {
        user.notificationPreferences.sms = {};
      }

      if (preferences.sms.enabled !== undefined) {
        user.notificationPreferences.sms.enabled = preferences.sms.enabled;
      }

      if (preferences.sms.types) {
        if (!user.notificationPreferences.sms.types) {
          user.notificationPreferences.sms.types = {};
        }

        Object.assign(user.notificationPreferences.sms.types, preferences.sms.types);
      }

      if (preferences.sms.frequency) {
        user.notificationPreferences.sms.frequency = preferences.sms.frequency;
      }
    }

    // Update in-app preferences
    if (preferences.inApp) {
      if (!user.notificationPreferences.inApp) {
        user.notificationPreferences.inApp = {};
      }

      if (preferences.inApp.enabled !== undefined) {
        user.notificationPreferences.inApp.enabled = preferences.inApp.enabled;
      }

      if (preferences.inApp.types) {
        if (!user.notificationPreferences.inApp.types) {
          user.notificationPreferences.inApp.types = {};
        }

        Object.assign(user.notificationPreferences.inApp.types, preferences.inApp.types);
      }
    }

    await user.save();

    res.status(200).json({
      message: 'Notification preferences updated successfully',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    next(error);
  }
};

// Get notification templates
exports.getTemplates = async (req, res, next) => {
  try {
    const { type, category, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;

    // Count total templates
    const total = await NotificationTemplate.countDocuments(query);

    // Find templates with pagination
    const templates = await NotificationTemplate.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.status(200).json({
      templates,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error getting notification templates:', error);
    next(error);
  }
};

// Get notification template by ID
exports.getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await NotificationTemplate.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.status(200).json(template);
  } catch (error) {
    console.error('Error getting notification template:', error);
    next(error);
  }
};

// Create notification template
exports.createTemplate = async (req, res, next) => {
  try {
    const { name, description, type, subject, content, variables, category } = req.body;

    // Check if template with same name already exists
    const existingTemplate = await NotificationTemplate.findOne({ name });

    if (existingTemplate) {
      return res.status(400).json({ message: 'Template with this name already exists' });
    }

    // Create template
    const template = new NotificationTemplate({
      name,
      description,
      type,
      subject,
      content,
      variables,
      category,
      isActive: true,
      createdBy: req.userId
    });

    await template.save();

    res.status(201).json({
      message: 'Notification template created successfully',
      template
    });
  } catch (error) {
    console.error('Error creating notification template:', error);
    next(error);
  }
};

// Update notification template
exports.updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, type, subject, content, variables, category, isActive } = req.body;

    // Find template
    const template = await NotificationTemplate.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== template.name) {
      const existingTemplate = await NotificationTemplate.findOne({ name });

      if (existingTemplate) {
        return res.status(400).json({ message: 'Template with this name already exists' });
      }

      template.name = name;
    }

    // Update template fields
    if (description) template.description = description;
    if (type) template.type = type;
    if (subject) template.subject = subject;
    if (content) template.content = content;
    if (variables) template.variables = variables;
    if (category) template.category = category;
    if (isActive !== undefined) template.isActive = isActive;

    template.updatedBy = req.userId;

    await template.save();

    res.status(200).json({
      message: 'Notification template updated successfully',
      template
    });
  } catch (error) {
    console.error('Error updating notification template:', error);
    next(error);
  }
};

// Delete notification template
exports.deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find template
    const template = await NotificationTemplate.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Delete template
    await NotificationTemplate.deleteOne({ _id: id });

    res.status(200).json({ message: 'Notification template deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification template:', error);
    next(error);
  }
};

// Get scheduled notifications
exports.getScheduledNotifications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;

    // Count total scheduled notifications
    const total = await ScheduledNotification.countDocuments(query);

    // Find scheduled notifications with pagination
    const scheduledNotifications = await ScheduledNotification.find(query)
      .populate('template', 'name type category')
      .sort({ scheduledFor: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.status(200).json({
      scheduledNotifications,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    next(error);
  }
};

// Get scheduled notification by ID
exports.getScheduledNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const scheduledNotification = await ScheduledNotification.findById(id)
      .populate('template', 'name type category content subject')
      .populate('recipients', 'name email');

    if (!scheduledNotification) {
      return res.status(404).json({ message: 'Scheduled notification not found' });
    }

    res.status(200).json(scheduledNotification);
  } catch (error) {
    console.error('Error getting scheduled notification:', error);
    next(error);
  }
};

// Create scheduled notification
exports.createScheduledNotification = async (req, res, next) => {
  try {
    const {
      templateId,
      recipients,
      recipientFilter,
      data,
      scheduledFor,
      recurrence,
      channels
    } = req.body;

    // Find template
    const template = await NotificationTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Create scheduled notification
    const scheduledNotification = new ScheduledNotification({
      template: templateId,
      recipients,
      recipientFilter,
      data,
      scheduledFor: new Date(scheduledFor),
      recurrence: recurrence || { pattern: 'once' },
      channels,
      status: 'scheduled',
      createdBy: req.userId
    });

    await scheduledNotification.save();

    // Schedule the notification
    await notificationService.scheduleNotification(scheduledNotification);

    res.status(201).json({
      message: 'Scheduled notification created successfully',
      scheduledNotification
    });
  } catch (error) {
    console.error('Error creating scheduled notification:', error);
    next(error);
  }
};

// Cancel scheduled notification
exports.cancelScheduledNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find scheduled notification
    const scheduledNotification = await ScheduledNotification.findById(id);

    if (!scheduledNotification) {
      return res.status(404).json({ message: 'Scheduled notification not found' });
    }

    // Check if notification can be cancelled
    if (scheduledNotification.status !== 'scheduled') {
      return res.status(400).json({
        message: `Cannot cancel notification with status "${scheduledNotification.status}"`
      });
    }

    // Cancel the notification
    await notificationService.cancelScheduledNotification(id);

    res.status(200).json({ message: 'Scheduled notification cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling scheduled notification:', error);
    next(error);
  }
};
