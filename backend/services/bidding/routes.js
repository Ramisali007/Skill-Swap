const express = require('express');
const router = express.Router();
const biddingController = require('./controller');
const { verifyToken, isFreelancer, isClient, isVerified } = require('../../middlewares/auth');

// Submit a bid
router.post('/:id/bids', verifyToken, isVerified, isFreelancer, biddingController.submitBid);

// Get all bids for a project
router.get('/:id/bids', biddingController.getProjectBids);

// Get bid by ID
router.get('/:id/bids/:bidId', verifyToken, biddingController.getBidById);

// Update bid
router.put('/:id/bids/:bidId', verifyToken, isFreelancer, biddingController.updateBid);

// Withdraw bid
router.delete('/:id/bids/:bidId', verifyToken, isFreelancer, biddingController.withdrawBid);

// Counter offer
router.post('/:id/bids/:bidId/counter-offer', verifyToken, isClient, biddingController.createCounterOffer);

// Respond to counter offer
router.put('/:id/bids/:bidId/counter-offer', verifyToken, isFreelancer, biddingController.respondToCounterOffer);

// Accept bid
router.put('/:id/bids/:bidId/accept', verifyToken, isClient, biddingController.acceptBid);

// Get freelancer's bids
router.get('/freelancer/my-bids', verifyToken, isFreelancer, biddingController.getFreelancerBids);

// Get bid statistics
router.get('/stats/bid-analytics', verifyToken, biddingController.getBidStatistics);

module.exports = router;
