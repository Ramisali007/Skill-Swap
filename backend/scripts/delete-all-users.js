/**
 * Script to delete all clients and freelancers from the database
 * This will remove all client profiles, freelancer profiles, and user accounts
 * except for admin users
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

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

// Delete all client profiles
async function deleteAllClients() {
  try {
    const result = await Client.deleteMany({});
    console.log(`Deleted ${result.deletedCount} client profiles`);
    return true;
  } catch (error) {
    console.error('Error deleting client profiles:', error);
    return false;
  }
}

// Delete all freelancer profiles
async function deleteAllFreelancers() {
  try {
    const result = await Freelancer.deleteMany({});
    console.log(`Deleted ${result.deletedCount} freelancer profiles`);
    return true;
  } catch (error) {
    console.error('Error deleting freelancer profiles:', error);
    return false;
  }
}

// Delete all user accounts except admins
async function deleteAllNonAdminUsers() {
  try {
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`Deleted ${result.deletedCount} user accounts (excluding admins)`);
    return true;
  } catch (error) {
    console.error('Error deleting user accounts:', error);
    return false;
  }
}

// Main function to delete all users
async function deleteAllUsers() {
  console.log('Starting deletion process...');
  
  // Connect to database
  const dbConnected = await connectToDatabase();
  if (!dbConnected) {
    console.error('Database connection failed. Aborting deletion.');
    return;
  }
  
  // Delete client profiles
  await deleteAllClients();
  
  // Delete freelancer profiles
  await deleteAllFreelancers();
  
  // Delete user accounts (except admins)
  await deleteAllNonAdminUsers();
  
  // Close database connection
  await mongoose.connection.close();
  console.log('Database connection closed');
  console.log('Deletion process completed successfully!');
}

// Run the deletion process
deleteAllUsers().catch(error => {
  console.error('Unhandled error during deletion:', error);
  mongoose.connection.close();
});
