const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
