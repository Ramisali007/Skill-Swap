const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'inApp'],
    required: true
  },
  subject: {
    type: String,
    required: function() {
      return this.type === 'email';
    }
  },
  content: {
    type: String,
    required: true
  },
  variables: [{
    name: String,
    description: String
  }],
  category: {
    type: String,
    enum: ['project', 'bid', 'message', 'payment', 'review', 'verification', 'system', 'marketing'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const NotificationTemplate = mongoose.model('NotificationTemplate', notificationTemplateSchema);

module.exports = NotificationTemplate;
