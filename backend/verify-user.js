require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

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

// Verify a specific user by email
const verifyUser = async (email) => {
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log('Found user:', user.email);
    console.log('Current verification status:', user.isVerified);
    
    // Update verification status
    user.isVerified = true;
    user.verificationToken = undefined; // Clear verification token
    
    await user.save();
    
    console.log('User verification status updated to:', user.isVerified);
    console.log('User has been verified successfully!');
    
  } catch (error) {
    console.error('Error verifying user:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the function with the specific email
verifyUser('ramisali.k786@gmail.com');
