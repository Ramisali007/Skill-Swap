const express = require('express');
const router = express.Router();
const adminController = require('./controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth');

// Middleware to check admin role
router.use(verifyToken, isAdmin);

// Freelancer verification
router.get('/freelancers/pending', adminController.getPendingFreelancers);
router.get('/freelancers/verification', adminController.getFreelancersForVerification);
router.get('/freelancers/:id', adminController.getFreelancerById);
router.put('/freelancers/:id/verify', adminController.verifyFreelancer);
router.put('/freelancers/:id/reject', adminController.rejectFreelancer);
router.put('/freelancers/:id/documents/:documentId', adminController.verifyDocument);
router.put('/freelancers/bulk-verify', adminController.bulkVerifyFreelancers);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Project management
router.get('/projects', adminController.getAllProjects);
router.get('/projects/:id', adminController.getProjectById);
router.put('/projects/:id/status', adminController.updateProjectStatus);
router.delete('/projects/:id', adminController.deleteProject);

// Platform analytics
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/projects', adminController.getProjectAnalytics);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/skills', adminController.getSkillsAnalytics);
router.get('/analytics/user-growth', adminController.getUserGrowthAnalytics);
router.get('/analytics/transactions', adminController.getTransactionAnalytics);

// Document management
router.get('/documents/:userId', adminController.getUserDocuments);

module.exports = router;
