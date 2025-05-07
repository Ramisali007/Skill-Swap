/**
 * Test script for admin password change functionality
 *
 * This script tests the ability for an admin user to change their password
 * by using the /api/auth/change-password endpoint.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5001';
const ADMIN_EMAIL = 'admin@skillswap.com';
const ADMIN_PASSWORD = 'admin123';
const NEW_PASSWORD = 'newadmin123';

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/skillswap');
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Create admin user if it doesn't exist
async function ensureAdminExists() {
  try {
    // Check if admin user exists
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (!adminUser) {
      console.log('Admin user not found. Creating new admin user...');

      // Create new admin user
      adminUser = new User({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        isVerified: true
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');

      // Reset password to known value for testing using bcrypt directly
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log('Admin password reset to test value');

      // Verify the password was set correctly
      const isMatch = await bcrypt.compare(ADMIN_PASSWORD, adminUser.password);
      console.log('Password verification:', isMatch ? 'SUCCESS' : 'FAILED');
    }

    return adminUser;
  } catch (error) {
    console.error('Error ensuring admin exists:', error);
    return null;
  }
}

// Login as admin
async function loginAsAdmin() {
  try {
    // Wait a moment for the password hash to be properly saved
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Attempting to login with:', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    console.log('Admin login successful');
    return response.data.token;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);

    // Check if the server is running
    try {
      await axios.get(`${API_URL}/api/health`);
    } catch (err) {
      console.error('API server may not be running. Please start the server first.');
    }

    return null;
  }
}

// Change admin password
async function changeAdminPassword(token) {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/change-password`,
      {
        currentPassword: ADMIN_PASSWORD,
        newPassword: NEW_PASSWORD
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Password change response:', response.data);
    return true;
  } catch (error) {
    console.error('Password change failed:', error.response?.data || error.message);
    return false;
  }
}

// Verify new password works
async function verifyNewPassword() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: NEW_PASSWORD
    });

    console.log('Login with new password successful');
    return true;
  } catch (error) {
    console.error('Login with new password failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test function
async function testAdminPasswordChange() {
  console.log('Starting admin password change test...');

  // Connect to database
  const dbConnected = await connectToDatabase();
  if (!dbConnected) {
    console.error('Database connection failed. Aborting test.');
    return;
  }

  // Ensure admin user exists
  const adminUser = await ensureAdminExists();
  if (!adminUser) {
    console.error('Failed to ensure admin user exists. Aborting test.');
    await mongoose.connection.close();
    return;
  }

  // Login as admin
  const token = await loginAsAdmin();
  if (!token) {
    console.error('Admin login failed. Aborting test.');
    await mongoose.connection.close();
    return;
  }

  // Change admin password
  const passwordChanged = await changeAdminPassword(token);
  if (!passwordChanged) {
    console.error('Password change failed. Aborting test.');
    await mongoose.connection.close();
    return;
  }

  // Verify new password works
  const newPasswordWorks = await verifyNewPassword();
  if (!newPasswordWorks) {
    console.error('New password verification failed.');
  } else {
    console.log('Admin password change test completed successfully!');
  }

  // Close database connection
  await mongoose.connection.close();
  console.log('Database connection closed');
}

// Run the test
testAdminPasswordChange().catch(error => {
  console.error('Unhandled error during test:', error);
  mongoose.connection.close();
});
