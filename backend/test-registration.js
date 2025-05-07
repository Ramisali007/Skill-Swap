require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Client = require('./models/Client');
const crypto = require('crypto');

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

// Test user registration
const testRegistration = async () => {
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    // Generate a unique email to avoid duplicate key errors
    const timestamp = Date.now();
    const testUser = {
      name: 'Test User',
      email: `testuser${timestamp}@example.com`,
      password: 'password123',
      role: 'client',
      phone: '1234567890',
      verificationToken: crypto.randomBytes(32).toString('hex'),
      isVerified: false
    };

    console.log('Attempting to create test user:', testUser.email);

    // Create user
    const user = new User(testUser);
    const savedUser = await user.save();
    console.log('User created successfully:', savedUser._id);

    // Create client profile
    const client = new Client({
      user: savedUser._id
    });
    await client.save();
    console.log('Client profile created successfully');

    // Verify user was saved
    const foundUser = await User.findOne({ email: testUser.email });
    console.log('User found in database:', foundUser ? 'Yes' : 'No');
    
    if (foundUser) {
      console.log('User details:', {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        isVerified: foundUser.isVerified
      });
    }

    // Clean up test data
    await User.deleteOne({ email: testUser.email });
    await Client.deleteOne({ user: savedUser._id });
    console.log('Test data cleaned up');

    console.log('Registration test completed successfully!');
  } catch (error) {
    console.error('Registration test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the test
testRegistration();
