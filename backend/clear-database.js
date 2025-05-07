require('dotenv').config();
const mongoose = require('mongoose');

// Get all model names from the database
const getCollectionNames = async () => {
  return mongoose.connection.db.collections()
    .then(collections => collections.map(collection => collection.collectionName));
};

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

// Clear all collections in the database
const clearDatabase = async () => {
  try {
    // Connect to MongoDB Atlas
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB Atlas');
      process.exit(1);
    }

    // Get all collection names
    const collections = await getCollectionNames();
    console.log('Collections found:', collections);

    // Delete all documents from each collection
    for (const collectionName of collections) {
      // Skip system collections
      if (collectionName.startsWith('system.')) {
        console.log(`Skipping system collection: ${collectionName}`);
        continue;
      }

      console.log(`Clearing collection: ${collectionName}`);
      const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
      console.log(`Deleted ${result.deletedCount} documents from ${collectionName}`);
    }

    console.log('All collections have been cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
};

// Run the script
clearDatabase();
