const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  budget: {
    type: Number,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],
  assignedFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer'
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    dueDate: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'approved'],
      default: 'pending'
    },
    completedAt: Date,
    approvedAt: Date
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  submissions: [{
    description: {
      type: String,
      required: true
    },
    attachments: [{
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    clientFeedback: String,
    approvedAt: Date,
    rejectedAt: Date
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeTracked: {
    type: Number,
    default: 0,
    min: 0
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

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
