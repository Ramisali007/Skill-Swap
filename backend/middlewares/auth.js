const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    console.log('Verifying token for request path:', req.path);

    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');

    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    console.log('Token received, verifying...');

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully for user ID:', decoded.userId);

      // Find user by id
      const user = await User.findById(decoded.userId);

      if (!user) {
        console.log('User not found with ID:', decoded.userId);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User found:', user.name, '(', user.email, ')', 'Role:', user.role);

      // Add user to request object
      req.user = user;
      req.userId = user._id;

      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error during authentication' });
  }
};

// Middleware to check if user is verified
exports.isVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ message: 'Please verify your account first' });
  }
  next();
};

// Middleware to check user role
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

// Middleware for client role
exports.isClient = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Access denied. Client role required' });
  }
  next();
};

// Middleware for freelancer role
exports.isFreelancer = (req, res, next) => {
  if (req.user.role !== 'freelancer') {
    return res.status(403).json({ message: 'Access denied. Freelancer role required' });
  }
  next();
};

// Middleware for admin role
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required' });
  }
  next();
};
