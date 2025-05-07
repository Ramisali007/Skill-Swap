const mongoose = require('mongoose');
const crypto = require('crypto');

const contractSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true
  },
  terms: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  signatures: {
    client: {
      signed: {
        type: Boolean,
        default: false
      },
      date: Date
    },
    freelancer: {
      signed: {
        type: Boolean,
        default: false
      },
      date: Date
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'completed', 'terminated'],
    default: 'draft'
  },
  hash: {
    type: String
  },
  versions: [{
    terms: String,
    amount: Number,
    startDate: Date,
    endDate: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    hash: String
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

// Generate hash for contract terms
contractSchema.pre('save', function(next) {
  if (this.isModified('terms')) {
    // Create a hash of the contract terms using SHA-256
    const hash = crypto.createHash('sha256');
    hash.update(this.terms);
    this.hash = hash.digest('hex');
    
    // Add to versions if this is a modification
    if (!this.isNew) {
      this.versions.push({
        terms: this.terms,
        amount: this.amount,
        startDate: this.startDate,
        endDate: this.endDate,
        hash: this.hash
      });
    }
  }
  next();
});

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
