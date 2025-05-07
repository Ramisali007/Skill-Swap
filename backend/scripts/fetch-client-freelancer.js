/**
 * Simple script to fetch client and freelancer data from MongoDB Atlas
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

// Fetch client and freelancer users
async function fetchClientFreelancerUsers() {
  try {
    // Fetch client users
    const clientUsers = await User.find({ role: 'client' }).select('-password');
    console.log('\n=== CLIENT USERS ===');
    console.log(`Total client users: ${clientUsers.length}`);
    
    clientUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Verified: ${user.isVerified}`);
      console.log('  ---');
    });
    
    // Fetch freelancer users
    const freelancerUsers = await User.find({ role: 'freelancer' }).select('-password');
    console.log('\n=== FREELANCER USERS ===');
    console.log(`Total freelancer users: ${freelancerUsers.length}`);
    
    freelancerUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Verified: ${user.isVerified}`);
      console.log('  ---');
    });
    
    return { clientUsers, freelancerUsers };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { clientUsers: [], freelancerUsers: [] };
  }
}

// Main function
async function main() {
  console.log('Fetching client and freelancer data from MongoDB Atlas...');
  
  // Connect to MongoDB Atlas
  const connected = await connectToAtlas();
  if (!connected) {
    console.error('Failed to connect to MongoDB Atlas. Aborting.');
    return;
  }
  
  // Fetch client and freelancer users
  await fetchClientFreelancerUsers();
  
  // Close connection
  await mongoose.connection.close();
  console.log('\nMongoDB Atlas connection closed');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  mongoose.connection.close();
});
