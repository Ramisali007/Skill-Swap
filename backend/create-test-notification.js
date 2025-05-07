require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB:', process.env.MONGO_URI || 'mongodb+srv://ramis:ramis123A@cluster0.xwqqn.mongodb.net/skillswap-ass4');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://ramis:ramis123A@cluster0.xwqqn.mongodb.net/skillswap-ass4');
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return false;
  }
};

const createTestNotifications = async () => {
  try {
    // Find all users
    const users = await User.find();
    
    if (users.length === 0) {
      console.error('No users found');
      return;
    }
    
    console.log(`Found ${users.length} users`);
    
    // Create test notifications for each user
    for (const user of users) {
      console.log(`Creating notifications for user: ${user.name} (${user.email})`);
      
      // Create different types of notifications
      const notificationTypes = [
        {
          type: 'system',
          title: 'Welcome to SkillSwap',
          message: 'Thank you for joining SkillSwap! We\'re excited to have you on board.',
          link: '/profile'
        },
        {
          type: 'project',
          title: 'New Project Available',
          message: 'A new project matching your skills has been posted. Check it out!',
          link: '/freelancer/browse-projects'
        },
        {
          type: 'message',
          title: 'New Message',
          message: 'You have received a new message from the SkillSwap team.',
          link: '/messages'
        },
        {
          type: 'verification',
          title: 'Account Verified',
          message: 'Your account has been successfully verified. You now have full access to all features.',
          link: '/profile'
        }
      ];
      
      // Create notifications
      for (const notifData of notificationTypes) {
        const notification = new Notification({
          recipient: user._id,
          type: notifData.type,
          title: notifData.title,
          message: notifData.message,
          link: notifData.link,
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await notification.save();
        console.log(`Created ${notifData.type} notification for ${user.name}`);
      }
    }
    
    console.log('Test notifications created successfully');
  } catch (error) {
    console.error('Error creating test notifications:', error);
  }
};

const run = async () => {
  const connected = await connectDB();
  if (connected) {
    await createTestNotifications();
    console.log('Done!');
    process.exit(0);
  } else {
    console.error('Failed to connect to database');
    process.exit(1);
  }
};

run();
