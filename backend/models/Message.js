const mongoose = require('mongoose');
const crypto = require('crypto');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    type: String // Hashed metadata
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  readStatus: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash metadata before saving
messageSchema.pre('save', function(next) {
  if (this.isModified('metadata') && this.metadata) {
    // Hash the metadata using SHA-256
    const hash = crypto.createHash('sha256');
    hash.update(this.metadata);
    this.metadata = hash.digest('hex');
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
