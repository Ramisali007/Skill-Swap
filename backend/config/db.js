const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';
    console.log('Connecting to MongoDB:', connectionString);

    // Connect without deprecated options
    const conn = await mongoose.connect(connectionString);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Retry logic can be added here
    process.exit(1); // Exit with failure
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Handle application termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
