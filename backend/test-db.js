require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');

    try {
      // Count users
      const userCount = await User.countDocuments();
      console.log(`Total users in database: ${userCount}`);

      // List all users
      const users = await User.find({}).select('name email role isVerified');
      console.log('Users in database:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}), Role: ${user.role}, Verified: ${user.isVerified}`);
      });
    } catch (error) {
      console.error('Error querying database:', error);
    } finally {
      // Close connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
