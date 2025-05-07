const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  bio: {
    type: String,
    trim: true
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  completedProjects: {
    type: Number,
    default: 0
  },
  activeProjects: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  projectsPosted: {
    type: Number,
    default: 0
  },
  preferredCategories: [{
    type: String,
    trim: true
  }],
  paymentMethods: [{
    type: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer'],
      required: true
    },
    details: {
      type: Object
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  taxInformation: {
    taxId: String,
    taxType: String,
    companyRegistrationNumber: String
  },
  verificationLevel: {
    type: String,
    enum: ['Basic', 'Verified', 'Premium'],
    default: 'Basic'
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

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
