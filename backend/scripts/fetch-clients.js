/**
 * Script to fetch client profiles from MongoDB Atlas
 */

const mongoose = require('mongoose');
const Client = require('../models/Client');
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

// Fetch all client profiles
async function fetchClients() {
  try {
    const clients = await Client.find().populate('user', 'name email _id role');
    console.log('\n=== CLIENT PROFILES ===');
    console.log(`Total client profiles: ${clients.length}`);

    clients.forEach(client => {
      console.log(`- Client: ${client.user ? client.user.name : 'Unknown'}`);
      console.log(`  Client ID: ${client._id}`);
      console.log(`  User ID: ${client.user ? client.user._id : 'Unknown'}`);
      console.log(`  Verification Level: ${client.verificationLevel}`);
      console.log(`  Projects Posted: ${client.projectsPosted}`);
      console.log(`  Completed Projects: ${client.completedProjects}`);
      console.log(`  Active Projects: ${client.activeProjects}`);
      console.log(`  Total Spent: $${client.totalSpent}`);
      console.log(`  Rating: ${client.rating}`);
      console.log(`  Projects: ${client.projects ? client.projects.length : 0} projects`);
      console.log('  ---');
    });

    return clients;
  } catch (error) {
    console.error('Error fetching client profiles:', error);
    return [];
  }
}

// Main function
async function main() {
  console.log('Fetching client profiles from MongoDB Atlas...');

  // Connect to MongoDB Atlas
  const connected = await connectToAtlas();
  if (!connected) {
    console.error('Failed to connect to MongoDB Atlas. Aborting.');
    return;
  }

  // Fetch client profiles
  await fetchClients();

  // Close connection
  await mongoose.connection.close();
  console.log('\nMongoDB Atlas connection closed');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  mongoose.connection.close();
});
