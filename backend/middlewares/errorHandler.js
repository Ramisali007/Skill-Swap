// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ message: 'Validation Error', errors });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      message: `Duplicate value for ${field}. This ${field} is already in use.` 
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  // Default server error
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = errorHandler;
