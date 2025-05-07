require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap');
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Create a test user directly in the database
const createSimpleUser = async () => {
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    console.log('Generated password hash:', hashedPassword);

    // Create user directly in the database
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'simple@example.com' },
      {
        $set: {
          name: 'Simple User',
          email: 'simple@example.com',
          password: hashedPassword,
          role: 'client',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('User created or updated:', result);

    // Create client profile if needed
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'simple@example.com' });
    
    if (user) {
      const clientExists = await mongoose.connection.db.collection('clients').findOne({ user: user._id });
      
      if (!clientExists) {
        await mongoose.connection.db.collection('clients').insertOne({
          user: user._id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Client profile created');
      } else {
        console.log('Client profile already exists');
      }
    }

    console.log('Simple user setup completed');
  } catch (error) {
    console.error('Error creating simple user:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the function
createSimpleUser();
