/**
 * Simple script to fetch data from MongoDB Atlas
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');
const Project = require('../models/Project');

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

// Fetch all collections
async function fetchAllData() {
  try {
    // Fetch users
    const users = await User.find().select('-password');
    console.log('\n=== USERS ===');
    console.log(JSON.stringify(users, null, 2));
    
    // Fetch clients
    const clients = await Client.find().populate('user', 'name email _id role');
    console.log('\n=== CLIENTS ===');
    console.log(JSON.stringify(clients, null, 2));
    
    // Fetch freelancers
    const freelancers = await Freelancer.find().populate('user', 'name email _id role');
    console.log('\n=== FREELANCERS ===');
    console.log(JSON.stringify(freelancers, null, 2));
    
    // Fetch projects
    const projects = await Project.find().populate('client', 'name email');
    console.log('\n=== PROJECTS ===');
    console.log(JSON.stringify(projects, null, 2));
    
    return { users, clients, freelancers, projects };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {};
  }
}

// Main function
async function main() {
  console.log('Fetching data from MongoDB Atlas...');
  
  // Connect to MongoDB Atlas
  const connected = await connectToAtlas();
  if (!connected) {
    console.error('Failed to connect to MongoDB Atlas. Aborting.');
    return;
  }
  
  // Fetch all data
  await fetchAllData();
  
  // Close connection
  await mongoose.connection.close();
  console.log('\nMongoDB Atlas connection closed');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  mongoose.connection.close();
});
