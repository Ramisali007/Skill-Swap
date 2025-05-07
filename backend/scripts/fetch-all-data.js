/**
 * Script to fetch all data from MongoDB Atlas
 * This script connects to MongoDB Atlas and fetches all collections and their data
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

// MongoDB Atlas connection string from .env
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
async function fetchAllUsers() {
  try {
    const users = await User.find().select('-password');
    console.log('\n=== USERS ===');
    console.log(`Total users: ${users.length}`);

    if (users.length > 0) {
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Verified: ${user.isVerified}`);
        console.log('  ---');
      });
    } else {
      console.log('No users found');
    }

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Fetch all client profiles
async function fetchAllClients() {
  try {
    const clients = await Client.find().populate('user', 'name email _id role');
    console.log('\n=== CLIENT PROFILES ===');
    console.log(`Total client profiles: ${clients.length}`);

    if (clients.length > 0) {
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
        console.log(`  Projects: ${client.projects.length} projects`);
        console.log('  ---');
      });
    } else {
      console.log('No client profiles found');
    }

    return clients;
  } catch (error) {
    console.error('Error fetching client profiles:', error);
    return [];
  }
}

// Fetch all freelancer profiles
async function fetchAllFreelancers() {
  try {
    const freelancers = await Freelancer.find().populate('user', 'name email _id role');
    console.log('\n=== FREELANCER PROFILES ===');
    console.log(`Total freelancer profiles: ${freelancers.length}`);

    if (freelancers.length > 0) {
      freelancers.forEach(freelancer => {
        console.log(`- Freelancer: ${freelancer.user ? freelancer.user.name : 'Unknown'}`);
        console.log(`  Freelancer ID: ${freelancer._id}`);
        console.log(`  User ID: ${freelancer.user ? freelancer.user._id : 'Unknown'}`);
        console.log(`  Verification Status: ${freelancer.verificationStatus}`);
        console.log(`  Hourly Rate: $${freelancer.hourlyRate}`);
        console.log(`  Skills: ${freelancer.skills.length} skills`);
        console.log(`  Average Rating: ${freelancer.averageRating}`);
        console.log(`  Completed Projects: ${freelancer.completedProjects}`);
        console.log(`  Ongoing Projects: ${freelancer.ongoingProjects}`);
        console.log(`  Total Earned: $${freelancer.totalEarned}`);
        console.log(`  Bids: ${freelancer.bids.length} bids`);
        console.log('  ---');
      });
    } else {
      console.log('No freelancer profiles found');
    }

    return freelancers;
  } catch (error) {
    console.error('Error fetching freelancer profiles:', error);
    return [];
  }
}

// Fetch all projects
async function fetchAllProjects() {
  try {
    const projects = await Project.find()
      .populate('client', 'name email')
      .populate('assignedFreelancer', 'name email');

    console.log('\n=== PROJECTS ===');
    console.log(`Total projects: ${projects.length}`);

    if (projects.length > 0) {
      projects.forEach(project => {
        console.log(`- Project: ${project.title}`);
        console.log(`  Project ID: ${project._id}`);
        console.log(`  Client: ${project.client ? project.client.name : 'Unknown'}`);
        console.log(`  Description: ${project.description ? project.description.substring(0, 50) + '...' : 'None'}`);
        console.log(`  Status: ${project.status}`);
        console.log(`  Budget: $${project.budget}`);
        console.log(`  Category: ${project.category}`);
        console.log(`  Created: ${project.createdAt}`);
        console.log(`  Deadline: ${project.deadline}`);
        console.log(`  Assigned Freelancer: ${project.assignedFreelancer ? project.assignedFreelancer.name : 'None'}`);
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

// Fetch all bids
async function fetchAllBids() {
  try {
    const bids = await Bid.find()
      .populate('freelancer', 'name email')
      .populate('project', 'title');

    console.log('\n=== BIDS ===');
    console.log(`Total bids: ${bids.length}`);

    if (bids.length > 0) {
      bids.forEach(bid => {
        console.log(`- Bid ID: ${bid._id}`);
        console.log(`  Freelancer: ${bid.freelancer ? bid.freelancer.name : 'Unknown'}`);
        console.log(`  Project: ${bid.project ? bid.project.title : 'Unknown'}`);
        console.log(`  Amount: $${bid.amount}`);
        console.log(`  Status: ${bid.status}`);
        console.log(`  Created: ${bid.createdAt}`);
        console.log('  ---');
      });
    } else {
      console.log('No bids found');
    }

    return bids;
  } catch (error) {
    console.error('Error fetching bids:', error);
    return [];
  }
}

// Fetch all conversations and messages
async function fetchAllMessages() {
  try {
    const conversations = await Conversation.find()
      .populate('participants', 'name email');

    console.log('\n=== CONVERSATIONS ===');
    console.log(`Total conversations: ${conversations.length}`);

    if (conversations.length > 0) {
      for (const conversation of conversations) {
        console.log(`- Conversation ID: ${conversation._id}`);
        console.log(`  Participants: ${conversation.participants.map(p => p.name).join(', ')}`);

        // Fetch messages for this conversation
        const messages = await Message.find({ conversation: conversation._id })
          .populate('sender', 'name email');

        console.log(`  Messages: ${messages.length} messages`);
        if (messages.length > 0) {
          console.log('  Recent messages:');
          messages.slice(-3).forEach(message => {
            console.log(`    - From: ${message.sender ? message.sender.name : 'Unknown'}`);
            console.log(`      Content: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`);
            console.log(`      Sent: ${message.createdAt}`);
          });
        }
        console.log('  ---');
      }
    } else {
      console.log('No conversations found');
    }

    return conversations;
  } catch (error) {
    console.error('Error fetching conversations and messages:', error);
    return [];
  }
}

// Fetch all notifications
async function fetchAllNotifications() {
  try {
    const notifications = await Notification.find()
      .populate('recipient', 'name email');

    console.log('\n=== NOTIFICATIONS ===');
    console.log(`Total notifications: ${notifications.length}`);

    if (notifications.length > 0) {
      notifications.forEach(notification => {
        console.log(`- Notification ID: ${notification._id}`);
        console.log(`  Recipient: ${notification.recipient ? notification.recipient.name : 'Unknown'}`);
        console.log(`  Type: ${notification.type}`);
        console.log(`  Message: ${notification.message}`);
        console.log(`  Read: ${notification.read}`);
        console.log(`  Created: ${notification.createdAt}`);
        console.log('  ---');
      });
    } else {
      console.log('No notifications found');
    }

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Main function
async function main() {
  console.log('Fetching all data from MongoDB Atlas...');

  // Connect to MongoDB Atlas
  const connected = await connectToAtlas();
  if (!connected) {
    console.error('Failed to connect to MongoDB Atlas. Aborting.');
    return;
  }

  // Fetch all data
  await fetchAllUsers();
  await fetchAllClients();
  await fetchAllFreelancers();
  await fetchAllProjects();
  await fetchAllBids();
  await fetchAllMessages();
  await fetchAllNotifications();

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
