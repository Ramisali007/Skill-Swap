const express = require('express');
const router = express.Router();
const dashboardController = require('./controller');
const { verifyToken, isClient, isFreelancer, isAdmin } = require('../../middlewares/auth');

// Client dashboard data
router.get('/client', verifyToken, isClient, dashboardController.getClientDashboard);

// Freelancer dashboard data
router.get('/freelancer', verifyToken, isFreelancer, dashboardController.getFreelancerDashboard);

// Admin dashboard data
router.get('/admin', verifyToken, isAdmin, dashboardController.getAdminDashboard);

module.exports = router;
