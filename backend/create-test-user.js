require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Client = require('./models/Client');
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

// Create a test user
const createTestUser = async () => {
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists. Updating password...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Update user
      existingUser.password = hashedPassword;
      existingUser.isVerified = true; // Make sure the user is verified
      await existingUser.save();
      
      console.log('Test user password updated successfully');
      console.log('User details:', {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        isVerified: existingUser.isVerified
      });
    } else {
      // Create new test user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'client',
        isVerified: true
      });
      
      const savedUser = await user.save();
      console.log('Test user created successfully');
      
      // Create client profile
      const client = new Client({
        user: savedUser._id
      });
      await client.save();
      console.log('Client profile created successfully');
      
      console.log('User details:', {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        isVerified: savedUser.isVerified
      });
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the function
createTestUser();
