const express = require('express');
const router = express.Router();
const authController = require('./controller');
const { verifyToken } = require('../../middlewares/auth');

// User registration routes
router.post('/signup', authController.signup);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Authentication routes
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.getCurrentUser);

// Password management
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', verifyToken, authController.changePassword);

// Profile management
router.put('/update-profile', verifyToken, authController.updateProfile);

module.exports = router;
