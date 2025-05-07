const express = require('express');
const router = express.Router();
const reviewController = require('./controller');
const { verifyToken, isClient, isFreelancer, isVerified } = require('../../middlewares/auth');

// Create a review
router.post('/', verifyToken, isVerified, reviewController.createReview);

// Get all reviews for a user
router.get('/user/:userId', reviewController.getUserReviews);

// Get all reviews for a project
router.get('/project/:projectId', reviewController.getProjectReviews);

// Get review by ID
router.get('/:id', reviewController.getReviewById);

// Update review
router.put('/:id', verifyToken, isClient, reviewController.updateReview);

// Delete review
router.delete('/:id', verifyToken, isClient, reviewController.deleteReview);

// Add response to review
router.post('/:id/response', verifyToken, isFreelancer, reviewController.addResponse);

// Get review statistics for a user
router.get('/stats/:userId', reviewController.getReviewStatistics);

module.exports = router;
