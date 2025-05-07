const express = require('express');
const router = express.Router();
const analyticsController = require('./controller');
const adminAnalyticsController = require('./admin-controller');
const { verifyToken, isClient, isFreelancer, isAdmin } = require('../../middlewares/auth');

// Client analytics
router.get('/client', verifyToken, isClient, analyticsController.getClientAnalytics);

// Freelancer analytics
router.get('/freelancer', verifyToken, isFreelancer, analyticsController.getFreelancerAnalytics);

// Admin analytics
router.get('/admin', verifyToken, isAdmin, adminAnalyticsController.getAdminAnalytics);

module.exports = router;
