require('dotenv').config();
const connectDB = require('./config/db');

// Test database connection
const testConnection = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Database connection test successful!');
    
    // Exit process
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('Database connection test failed:', error);
    process.exit(1);
  }
};

// Run the test
testConnection();
