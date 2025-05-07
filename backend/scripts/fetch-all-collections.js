/**
 * Script to fetch all collections from MongoDB Atlas
 * This script properly loads all models and fetches data from each collection
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

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
    const users = await User.find().select('-password');
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

// Fetch all freelancer profiles
async function fetchFreelancers() {
  try {
    const freelancers = await Freelancer.find().populate('user', 'name email _id role');
    console.log('\n=== FREELANCER PROFILES ===');
    console.log(`Total freelancer profiles: ${freelancers.length}`);

    freelancers.forEach(freelancer => {
      console.log(`- Freelancer: ${freelancer.user ? freelancer.user.name : 'Unknown'}`);
      console.log(`  Freelancer ID: ${freelancer._id}`);
      console.log(`  User ID: ${freelancer.user ? freelancer.user._id : 'Unknown'}`);
      console.log(`  Verification Status: ${freelancer.verificationStatus}`);
      console.log(`  Hourly Rate: $${freelancer.hourlyRate}`);
      console.log(`  Skills: ${freelancer.skills ? freelancer.skills.length : 0} skills`);
      console.log(`  Average Rating: ${freelancer.averageRating}`);
      console.log(`  Completed Projects: ${freelancer.completedProjects}`);
      console.log(`  Ongoing Projects: ${freelancer.ongoingProjects}`);
      console.log(`  Total Earned: $${freelancer.totalEarned}`);
      console.log(`  Bids: ${freelancer.bids ? freelancer.bids.length : 0} bids`);
      console.log('  ---');
    });

    return freelancers;
  } catch (error) {
    console.error('Error fetching freelancer profiles:', error);
    return [];
  }
}

// Fetch all projects
async function fetchProjects() {
  try {
    const projects = await Project.find().populate('client', 'name email');
    console.log('\n=== PROJECTS ===');
    console.log(`Total projects: ${projects.length}`);

    if (projects.length > 0) {
      projects.forEach(project => {
        console.log(`- Project: ${project.title}`);
        console.log(`  Project ID: ${project._id}`);
        console.log(`  Client: ${project.client ? project.client.name : 'Unknown'}`);
        console.log(`  Status: ${project.status}`);
        console.log(`  Budget: $${project.budget}`);
        console.log(`  Category: ${project.category}`);
        console.log(`  Created: ${project.createdAt}`);
        console.log('  ---');
      });
    } else {
      console.log('No projects found');
    }

    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Main function
async function main() {
  console.log('Fetching all collections from MongoDB Atlas...');

  // Connect to MongoDB Atlas
  const connected = await connectToAtlas();
  if (!connected) {
    console.error('Failed to connect to MongoDB Atlas. Aborting.');
    return;
  }

  // Fetch all collections
  await fetchUsers();
  await fetchClients();
  await fetchFreelancers();
  await fetchProjects();

  // Close connection
  await mongoose.connection.close();
  console.log('\nMongoDB Atlas connection closed');
  console.log('Data fetching completed!');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  mongoose.connection.close();
});
