/**
 * Script to fetch users from MongoDB Atlas
 */

const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://ramis:ramis123A@cluster0.xwqqn.mongodb.net/skillswap-ass4';

// Connect to MongoDB Atlas
async function connectToAtlas() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    return true;
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    return false;
  }
}

// Fetch all users
async function fetchUsers() {
  try {
    const users = await User.find().select('_id name email role isVerified');
    console.log('\n=== USERS ===');
    console.log(`Total users: ${users.length}`);
    
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Verified: ${user.isVerified}`);
      console.log('  ---');
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Main function
async function main() {
  console.log('Fetching users from MongoDB Atlas...');
  
  // Connect to MongoDB Atlas
  const connected = await connectToAtlas();
  if (!connected) {
    console.error('Failed to connect to MongoDB Atlas. Aborting.');
    return;
  }
  
  // Fetch users
  await fetchUsers();
  
  // Close connection
  await mongoose.connection.close();
  console.log('\nMongoDB Atlas connection closed');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  mongoose.connection.close();
});
