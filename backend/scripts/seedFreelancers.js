const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Freelancer = require('../models/Freelancer');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';
    console.log('Connecting to MongoDB:', connectionString);
    await mongoose.connect(connectionString);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Sample freelancer data
const sampleFreelancers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: '$2a$10$XFNxG5fGmJbGaEDL9Ew7/.Mkbs0gOWqz.EAG9qHQJmRgYQcflXJJu', // password123
    role: 'freelancer',
    profileImage: '',
    freelancerProfile: {
      title: 'Web Development Tutor',
      bio: 'Experienced web developer with 5+ years of experience in React and Node.js. I love teaching and helping students master programming concepts.',
      skills: [
        { name: 'JavaScript', level: 'Expert', yearsOfExperience: 5 },
        { name: 'React', level: 'Expert', yearsOfExperience: 4 },
        { name: 'Node.js', level: 'Advanced', yearsOfExperience: 3 }
      ],
      hourlyRate: 35,
      availability: { status: 'Available', hoursPerWeek: 20 },
      categories: ['Web Development', 'Programming', 'Tutoring'],
      averageRating: 4.8,
      completedProjects: 24
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: '$2a$10$XFNxG5fGmJbGaEDL9Ew7/.Mkbs0gOWqz.EAG9qHQJmRgYQcflXJJu', // password123
    role: 'freelancer',
    profileImage: '',
    freelancerProfile: {
      title: 'UI/UX Design Tutor',
      bio: 'Creative designer with a passion for user-centered design. I specialize in teaching UI/UX principles and practical design skills.',
      skills: [
        { name: 'UI Design', level: 'Expert', yearsOfExperience: 6 },
        { name: 'UX Research', level: 'Expert', yearsOfExperience: 5 },
        { name: 'Figma', level: 'Expert', yearsOfExperience: 4 }
      ],
      hourlyRate: 40,
      availability: { status: 'Available', hoursPerWeek: 15 },
      categories: ['UI/UX Design', 'Graphic Design', 'Tutoring'],
      averageRating: 4.9,
      completedProjects: 18
    }
  },
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    password: '$2a$10$XFNxG5fGmJbGaEDL9Ew7/.Mkbs0gOWqz.EAG9qHQJmRgYQcflXJJu', // password123
    role: 'freelancer',
    profileImage: '',
    freelancerProfile: {
      title: 'Data Science Tutor',
      bio: 'Data scientist with expertise in machine learning and statistical analysis. I help students understand complex data concepts in simple terms.',
      skills: [
        { name: 'Python', level: 'Expert', yearsOfExperience: 5 },
        { name: 'Machine Learning', level: 'Advanced', yearsOfExperience: 3 },
        { name: 'Data Analysis', level: 'Expert', yearsOfExperience: 4 }
      ],
      hourlyRate: 45,
      availability: { status: 'Available', hoursPerWeek: 25 },
      categories: ['Data Science', 'Programming', 'Tutoring'],
      averageRating: 4.7,
      completedProjects: 15
    }
  }
];

// Seed freelancers
const seedFreelancers = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Clear existing data
    console.log('Clearing existing freelancer data...');
    // Don't delete all users, just check if our sample users exist
    
    for (const freelancerData of sampleFreelancers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: freelancerData.email });
      
      if (existingUser) {
        console.log(`User ${freelancerData.email} already exists, checking freelancer profile...`);
        
        // Check if freelancer profile exists
        const existingFreelancer = await Freelancer.findOne({ user: existingUser._id });
        
        if (existingFreelancer) {
          console.log(`Freelancer profile for ${freelancerData.email} already exists, skipping...`);
          continue;
        }
        
        // Create freelancer profile
        const newFreelancer = new Freelancer({
          user: existingUser._id,
          ...freelancerData.freelancerProfile
        });
        
        await newFreelancer.save();
        console.log(`Created freelancer profile for existing user ${freelancerData.email}`);
      } else {
        // Create new user
        const newUser = new User({
          name: freelancerData.name,
          email: freelancerData.email,
          password: freelancerData.password,
          role: freelancerData.role,
          profileImage: freelancerData.profileImage,
          isVerified: true
        });
        
        const savedUser = await newUser.save();
        console.log(`Created new user: ${savedUser.email}`);
        
        // Create freelancer profile
        const newFreelancer = new Freelancer({
          user: savedUser._id,
          ...freelancerData.freelancerProfile
        });
        
        await newFreelancer.save();
        console.log(`Created freelancer profile for ${savedUser.email}`);
      }
    }
    
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedFreelancers();
