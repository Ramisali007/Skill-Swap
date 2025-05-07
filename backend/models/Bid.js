const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  deliveryTime: {
    type: Number,
    required: true
  },
  proposal: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  counterOffer: {
    amount: Number,
    deliveryTime: Number,
    message: String,
    status: {
      type: String,
      enum: ['none', 'pending', 'accepted', 'rejected'],
      default: 'none'
    }
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

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;
