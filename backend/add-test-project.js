require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Client = require('./models/Client');
const Freelancer = require('./models/Freelancer');
const Project = require('./models/Project');
const Bid = require('./models/Bid');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = 'mongodb+srv://ramis:ramis123A@cluster0.xwqqn.mongodb.net/skillswap-ass4';
    console.log('Connecting to MongoDB:', mongoURI);
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return false;
  }
};

const createTestProject = async () => {
  try {
    // Find a client
    const client = await Client.findOne();
    if (!client) {
      console.error('No client found');
      return;
    }
    console.log('Found client:', client._id);

    // Find a freelancer
    const freelancer = await Freelancer.findOne();
    if (!freelancer) {
      console.error('No freelancer found');
      return;
    }
    console.log('Found freelancer:', freelancer._id);

    // Create a test project
    const project = new Project({
      title: 'Test Dashboard Project',
      description: 'This is a test project for the freelancer dashboard',
      client: client._id,
      category: 'Web Development',
      skills: ['JavaScript', 'React', 'Node.js'],
      budget: 1000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'in_progress',
      assignedFreelancer: freelancer._id,
      progress: 50,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await project.save();
    console.log('Created test project:', project._id);

    // Create a test bid
    const bid = new Bid({
      project: project._id,
      freelancer: freelancer._id,
      amount: 950,
      deliveryTime: 25,
      proposal: 'I can complete this project efficiently and with high quality.',
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await bid.save();
    console.log('Created test bid:', bid._id);

    // Update project with bid
    project.bids.push(bid._id);
    await project.save();
    console.log('Updated project with bid');

    // Update client with project
    client.projects.push(project._id);
    client.activeProjects += 1;
    await client.save();
    console.log('Updated client with project');

    // Update freelancer stats
    freelancer.ongoingProjects += 1;
    await freelancer.save();
    console.log('Updated freelancer stats');

    console.log('Test data created successfully');
  } catch (error) {
    console.error('Error creating test data:', error);
  }
};

const run = async () => {
  const connected = await connectDB();
  if (connected) {
    await createTestProject();
    console.log('Done!');
    process.exit(0);
  } else {
    console.error('Failed to connect to database');
    process.exit(1);
  }
};

run();
