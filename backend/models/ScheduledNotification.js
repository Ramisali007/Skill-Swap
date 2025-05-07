const mongoose = require('mongoose');

const scheduledNotificationSchema = new mongoose.Schema({
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationTemplate',
    required: true
  },
  recipients: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    validate: {
      validator: function(recipients) {
        return recipients && recipients.length > 0;
      },
      message: 'At least one recipient is required'
    }
  },
  recipientFilter: {
    roles: [String],
    skills: [String],
    lastActive: Date,
    customQuery: Object
  },
  data: {
    type: Object,
    default: {}
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  recurrence: {
    pattern: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly', 'custom'],
      default: 'once'
    },
    cronExpression: String,
    endDate: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  channels: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  result: {
    sent: Number,
    failed: Number,
    errors: [String]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const ScheduledNotification = mongoose.model('ScheduledNotification', scheduledNotificationSchema);

module.exports = ScheduledNotification;
