const nodemailer = require('nodemailer');
const Notification = require('../../models/Notification');
const NotificationTemplate = require('../../models/NotificationTemplate');
const ScheduledNotification = require('../../models/ScheduledNotification');
const User = require('../../models/User');
const Handlebars = require('handlebars');
const cron = require('node-cron');
const mongoose = require('mongoose');

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'your_mailtrap_user',
    pass: process.env.EMAIL_PASSWORD || 'your_mailtrap_password'
  }
});

// Initialize Twilio client (mock for development)
const twilioClient = {
  messages: {
    create: async ({ body, from, to }) => {
      console.log(`[MOCK SMS] From: ${from}, To: ${to}, Message: ${body}`);
      return { sid: 'MOCK_SID_' + Date.now() };
    }
  }
};

// Store active scheduled jobs
const scheduledJobs = new Map();

// Initialize the notification service
const initNotificationService = async () => {
  console.log('Initializing notification service...');
  
  // Load and schedule all active scheduled notifications
  try {
    const scheduledNotifications = await ScheduledNotification.find({
      status: 'scheduled',
      scheduledFor: { $gt: new Date() }
    });
    
    console.log(`Found ${scheduledNotifications.length} scheduled notifications to initialize`);
    
    for (const notification of scheduledNotifications) {
      scheduleNotification(notification);
    }
  } catch (error) {
    console.error('Error initializing scheduled notifications:', error);
  }
};

// Process template with variables
const processTemplate = (template, data) => {
  try {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(data);
  } catch (error) {
    console.error('Error processing template:', error);
    return template;
  }
};

// Send email notification
const sendEmail = async (recipient, subject, content, templateData = {}) => {
  try {
    // Process template if needed
    const processedContent = processTemplate(content, templateData);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@skillswap.com',
      to: recipient,
      subject: processTemplate(subject, templateData),
      html: processedContent
    };
    
    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send SMS notification
const sendSMS = async (recipient, content, templateData = {}) => {
  try {
    // Process template if needed
    const processedContent = processTemplate(content, templateData);
    
    const result = await twilioClient.messages.create({
      body: processedContent,
      from: process.env.TWILIO_PHONE_NUMBER || '+15005550006', // Twilio test number
      to: recipient
    });
    
    console.log('SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// Create in-app notification
const createInAppNotification = async (userId, type, title, message, link = null, relatedId = null, relatedModel = null) => {
  try {
    const notification = new Notification({
      recipient: userId,
      type,
      title,
      message,
      read: false,
      link,
      relatedId,
      relatedModel
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating in-app notification:', error);
    throw error;
  }
};

// Send notification using template
const sendNotificationByTemplate = async (templateName, recipientId, data = {}, channels = { email: true, sms: false, inApp: true }) => {
  try {
    // Find template
    const template = await NotificationTemplate.findOne({ name: templateName, isActive: true });
    
    if (!template) {
      throw new Error(`Template "${templateName}" not found or inactive`);
    }
    
    // Find recipient
    const recipient = await User.findById(recipientId);
    
    if (!recipient) {
      throw new Error(`Recipient with ID "${recipientId}" not found`);
    }
    
    const results = {
      email: null,
      sms: null,
      inApp: null
    };
    
    // Check user preferences
    const preferences = recipient.notificationPreferences || {};
    
    // Send email if enabled
    if (channels.email && template.type === 'email' && 
        preferences.email?.enabled && 
        preferences.email?.types?.[template.category]) {
      results.email = await sendEmail(
        recipient.email,
        template.subject,
        template.content,
        { ...data, recipientName: recipient.name }
      );
    }
    
    // Send SMS if enabled
    if (channels.sms && template.type === 'sms' && 
        preferences.sms?.enabled && 
        preferences.sms?.types?.[template.category] && 
        recipient.phone) {
      results.sms = await sendSMS(
        recipient.phone,
        template.content,
        { ...data, recipientName: recipient.name }
      );
    }
    
    // Create in-app notification if enabled
    if (channels.inApp && 
        preferences.inApp?.enabled && 
        preferences.inApp?.types?.[template.category]) {
      const title = template.subject || template.name;
      const message = processTemplate(template.content, { ...data, recipientName: recipient.name });
      
      results.inApp = await createInAppNotification(
        recipientId,
        template.category,
        title,
        message,
        data.link || null,
        data.relatedId || null,
        data.relatedModel || null
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error sending notification by template:', error);
    throw error;
  }
};

// Schedule a notification
const scheduleNotification = async (scheduledNotification) => {
  try {
    const { _id, scheduledFor, recurrence } = scheduledNotification;
    
    // For one-time notifications
    if (recurrence.pattern === 'once') {
      const now = new Date();
      const delay = scheduledFor.getTime() - now.getTime();
      
      if (delay <= 0) {
        // Execute immediately if scheduled time has passed
        await executeScheduledNotification(scheduledNotification);
      } else {
        // Schedule for future execution
        const timeoutId = setTimeout(async () => {
          await executeScheduledNotification(scheduledNotification);
        }, delay);
        
        scheduledJobs.set(_id.toString(), { type: 'timeout', id: timeoutId });
      }
    } else {
      // For recurring notifications
      let cronExpression;
      
      if (recurrence.cronExpression) {
        cronExpression = recurrence.cronExpression;
      } else {
        // Generate cron expression based on pattern
        switch (recurrence.pattern) {
          case 'daily':
            cronExpression = `0 ${scheduledFor.getHours()} ${scheduledFor.getMinutes()} * * *`;
            break;
          case 'weekly':
            cronExpression = `0 ${scheduledFor.getHours()} ${scheduledFor.getMinutes()} * * ${scheduledFor.getDay()}`;
            break;
          case 'monthly':
            cronExpression = `0 ${scheduledFor.getHours()} ${scheduledFor.getMinutes()} ${scheduledFor.getDate()} * *`;
            break;
          default:
            throw new Error(`Unsupported recurrence pattern: ${recurrence.pattern}`);
        }
      }
      
      // Schedule cron job
      const job = cron.schedule(cronExpression, async () => {
        await executeScheduledNotification(scheduledNotification);
      });
      
      scheduledJobs.set(_id.toString(), { type: 'cron', job });
    }
    
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    
    // Update notification status to failed
    await ScheduledNotification.findByIdAndUpdate(scheduledNotification._id, {
      status: 'failed',
      'result.errors': [error.message]
    });
    
    return false;
  }
};

// Execute a scheduled notification
const executeScheduledNotification = async (scheduledNotification) => {
  try {
    // Update status to processing
    await ScheduledNotification.findByIdAndUpdate(scheduledNotification._id, {
      status: 'processing'
    });
    
    const { template: templateId, recipients, recipientFilter, data, channels } = scheduledNotification;
    
    // Find template
    const template = await NotificationTemplate.findById(templateId);
    
    if (!template || !template.isActive) {
      throw new Error(`Template not found or inactive`);
    }
    
    // Determine recipients
    let targetRecipients = [];
    
    if (recipients && recipients.length > 0) {
      // Use explicit recipients
      targetRecipients = recipients;
    } else if (recipientFilter) {
      // Use filter to find recipients
      const query = {};
      
      if (recipientFilter.roles && recipientFilter.roles.length > 0) {
        query.role = { $in: recipientFilter.roles };
      }
      
      if (recipientFilter.lastActive) {
        query.lastLogin = { $gte: recipientFilter.lastActive };
      }
      
      if (recipientFilter.customQuery) {
        Object.assign(query, recipientFilter.customQuery);
      }
      
      const users = await User.find(query).select('_id');
      targetRecipients = users.map(user => user._id);
    }
    
    // Send notifications
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };
    
    for (const recipientId of targetRecipients) {
      try {
        await sendNotificationByTemplate(
          template.name,
          recipientId,
          data,
          channels
        );
        
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Error sending to ${recipientId}: ${error.message}`);
      }
    }
    
    // Update notification status
    await ScheduledNotification.findByIdAndUpdate(scheduledNotification._id, {
      status: 'completed',
      result: results
    });
    
    return results;
  } catch (error) {
    console.error('Error executing scheduled notification:', error);
    
    // Update notification status to failed
    await ScheduledNotification.findByIdAndUpdate(scheduledNotification._id, {
      status: 'failed',
      'result.errors': [error.message]
    });
    
    throw error;
  }
};

// Cancel a scheduled notification
const cancelScheduledNotification = async (notificationId) => {
  try {
    const job = scheduledJobs.get(notificationId);
    
    if (job) {
      if (job.type === 'timeout') {
        clearTimeout(job.id);
      } else if (job.type === 'cron') {
        job.job.stop();
      }
      
      scheduledJobs.delete(notificationId);
    }
    
    await ScheduledNotification.findByIdAndUpdate(notificationId, {
      status: 'cancelled'
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling scheduled notification:', error);
    throw error;
  }
};

module.exports = {
  initNotificationService,
  sendEmail,
  sendSMS,
  createInAppNotification,
  sendNotificationByTemplate,
  scheduleNotification,
  executeScheduledNotification,
  cancelScheduledNotification,
  processTemplate
};
