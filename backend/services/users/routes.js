const express = require('express');
const router = express.Router();
const usersController = require('./controller');
const { verifyToken } = require('../../middlewares/auth');

// Handle OPTIONS requests for CORS preflight
router.options('/freelancers/search', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.sendStatus(200);
});

// Search freelancers (public)
router.get('/freelancers/search', usersController.searchFreelancers);

// Check if a user exists (public endpoint)
router.get('/exists/:id', usersController.checkUserExists);

// Get user by ID
router.get('/:id', verifyToken, usersController.getUserById);

module.exports = router;
