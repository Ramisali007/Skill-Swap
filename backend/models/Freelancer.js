const mongoose = require('mongoose');

// Log that the Freelancer model is being loaded
console.log('Loading Freelancer model...');

const freelancerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true
  },
  skills: [{
    name: {
      type: String,
      trim: true
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    yearsOfExperience: {
      type: Number,
      default: 0
    }
  }],
  languages: [{
    name: {
      type: String,
      trim: true
    },
    proficiency: {
      type: String,
      enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
      default: 'Fluent'
    }
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String
  }],
  workExperience: [{
    company: String,
    position: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String
  }],
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
    projectUrl: String,
    technologies: [String],
    completionDate: Date
  }],
  bio: {
    type: String,
    trim: true
  },
  hourlyRate: {
    type: Number,
    default: 0
  },
  availability: {
    status: {
      type: String,
      enum: ['Available', 'Limited', 'Unavailable'],
      default: 'Available'
    },
    hoursPerWeek: {
      type: Number,
      default: 40
    },
    availableFrom: Date
  },
  categories: [{
    type: String,
    trim: true
  }],
  verificationLevel: {
    type: String,
    enum: ['Basic', 'Verified', 'Premium'],
    default: 'Basic'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationNotes: {
    type: String,
    trim: true
  },
  verificationDocuments: [{
    documentType: {
      type: String,
      enum: [
        'id', 'passport', 'driver_license', 'national_id',
        'certificate', 'diploma', 'resume', 'cv',
        'portfolio', 'work_sample', 'photo', 'other'
      ]
    },
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  certifications: [{
    name: String,
    issuer: String,
    dateObtained: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  ratings: {
    communication: { type: Number, default: 0 },
    qualityOfWork: { type: Number, default: 0 },
    expertise: { type: Number, default: 0 },
    professionalism: { type: Number, default: 0 },
    hireAgainRate: { type: Number, default: 0 }
  },
  completedProjects: {
    type: Number,
    default: 0
  },
  ongoingProjects: {
    type: Number,
    default: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  paymentDetails: {
    paypalEmail: String,
    bankAccount: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      swiftCode: String,
      routingNumber: String
    },
    preferredCurrency: {
      type: String,
      default: 'USD'
    }
  },
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Freelancer = mongoose.model('Freelancer', freelancerSchema);

module.exports = Freelancer;
