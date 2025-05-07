require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB Atlas:', connectionString);
    
    await mongoose.connect(connectionString);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Connect to MongoDB Atlas
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB Atlas');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@skillswap.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@skillswap.com');
      console.log('Admin details:', {
        id: existingAdmin._id,
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role,
        isVerified: existingAdmin.isVerified
      });
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@skillswap.com',
      password: 'admin123', // This will be hashed by the pre-save hook in the User model
      role: 'admin',
      isVerified: true, // Admin is automatically verified
      phone: '+1234567890',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'Admin Country'
      },
      profileImage: '',
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: '',
        website: ''
      },
      lastLogin: new Date()
    });

    // Save admin user
    const savedAdmin = await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Admin details:', {
      id: savedAdmin._id,
      name: savedAdmin.name,
      email: savedAdmin.email,
      role: savedAdmin.role,
      isVerified: savedAdmin.isVerified
    });
    console.log('Login credentials:');
    console.log('Email: admin@skillswap.com');
    console.log('Password: admin123');

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(1);
  }
};

// Run the script
createAdminUser();
