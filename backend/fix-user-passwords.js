require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB Atlas:', connectionString);
    
    await mongoose.connect(connectionString);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

// Fix user passwords in the database
const fixUserPasswords = async () => {
  try {
    // Connect to MongoDB Atlas
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB Atlas');
      process.exit(1);
    }
    
    // Get the users collection
    const usersCollection = mongoose.connection.db.collection('users');
    
    // Find all users
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users in the database`);
    
    // Generate a new password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    console.log('Generated new password hash:', hashedPassword);
    
    // Update all users with the new password hash
    const updateResult = await usersCollection.updateMany(
      {}, // Update all users
      { $set: { 
          password: hashedPassword,
          isVerified: true // Ensure all users are verified
        } 
      }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} users with new password hash`);
    console.log('All users can now log in with password: password123');
    
    // List all users
    console.log('\nUsers in the database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}), Role: ${user.role}, Verified: ${user.isVerified}`);
    });
    
  } catch (error) {
    console.error('Error fixing user passwords:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
};

// Run the function
fixUserPasswords();
