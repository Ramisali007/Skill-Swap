require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap');
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Test password comparison
const testPasswordComparison = async () => {
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    // Find test user
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.error('Test user not found');
      process.exit(1);
    }

    console.log('Found user:', user.email);
    
    // Test password comparison using the model method
    console.log('Testing password comparison using model method...');
    const isMatchModel = await user.comparePassword('password123');
    console.log('Model method result:', isMatchModel);
    
    // Test password comparison directly with bcrypt
    console.log('Testing password comparison directly with bcrypt...');
    const isMatchDirect = await bcrypt.compare('password123', user.password);
    console.log('Direct bcrypt result:', isMatchDirect);
    
    // Log the stored password hash for inspection
    console.log('Stored password hash:', user.password);
    
    // Create a new hash for comparison
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash('password123', salt);
    console.log('New hash for same password:', newHash);
    
  } catch (error) {
    console.error('Error testing password comparison:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the function
testPasswordComparison();
