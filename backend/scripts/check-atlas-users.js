/**
 * Script to check users in MongoDB Atlas
 * This script connects to MongoDB Atlas and lists all users
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');

// MongoDB Atlas connection string
// Using the connection string from .env file
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

// Check for user named sarim
async function checkForSarim() {
  try {
    const user = await User.findOne({ name: /sarim/i });

    if (user) {
      console.log('Found user named sarim:');
      console.log(`- ID: ${user._id}`);
      console.log(`- Name: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);

      // If it's a client, get client profile
      if (user.role === 'client') {
        const client = await Client.findOne({ user: user._id });
        if (client) {
          console.log('Client profile found:');
          console.log(`- Client ID: ${client._id}`);
          console.log(`- Verification Level: ${client.verificationLevel}`);
          console.log(`- Projects Posted: ${client.projectsPosted}`);
        } else {
          console.log('No client profile found for this user');
        }
      }

      // If it's a freelancer, get freelancer profile
      if (user.role === 'freelancer') {
        const freelancer = await Freelancer.findOne({ user: user._id });
        if (freelancer) {
          console.log('Freelancer profile found:');
          console.log(`- Freelancer ID: ${freelancer._id}`);
          console.log(`- Verification Status: ${freelancer.verificationStatus}`);
          console.log(`- Skills: ${freelancer.skills.length} skills`);
        } else {
          console.log('No freelancer profile found for this user');
        }
      }

      return true;
    } else {
      console.log('No user named sarim found in MongoDB Atlas');
      return false;
    }
  } catch (error) {
    console.error('Error checking for sarim:', error);
    return false;
  }
}

// List all users in the database
async function listAllUsers() {
  try {
    const users = await User.find().select('_id name email role');

    console.log('\nAll users in MongoDB Atlas:');
    if (users.length === 0) {
      console.log('No users found in the database');
    } else {
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }

    return users.length;
  } catch (error) {
    console.error('Error listing users:', error);
    return 0;
  }
}

// Main function
async function main() {
  console.log('Checking MongoDB Atlas for users...');

  // Connect to MongoDB Atlas
  const connected = await connectToAtlas();
  if (!connected) {
    console.error('Failed to connect to MongoDB Atlas. Aborting.');
    return;
  }

  // Check for sarim
  await checkForSarim();

  // List all users
  await listAllUsers();

  // Close connection
  await mongoose.connection.close();
  console.log('\nMongoDB Atlas connection closed');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  mongoose.connection.close();
});
