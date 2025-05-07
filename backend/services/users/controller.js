const User = require('../../models/User');
const Client = require('../../models/Client');
const Freelancer = require('../../models/Freelancer');

// For debugging
console.log('Models loaded:', {
  User: !!User,
  Client: !!Client,
  Freelancer: !!Freelancer
});

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Getting user profile for ID: ${id}, requested by: ${req.userId}`);

    // Find user
    const user = await User.findById(id).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

    if (!user) {
      console.log(`User with ID ${id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Found user: ${user.name} (${user.role})`);

    // Get role-specific profile
    let profile = null;
    if (user.role === 'client') {
      profile = await Client.findOne({ user: user._id }).select('-user');
      console.log('Found client profile');
    } else if (user.role === 'freelancer') {
      profile = await Freelancer.findOne({ user: user._id }).select('-user -verificationDocuments');
      console.log('Found freelancer profile');
    }

    res.status(200).json({
      user,
      profile
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    next(error);
  }
};

// Search and filter freelancers
// Check if a user exists
exports.checkUserExists = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Checking if user with ID ${id} exists`);

    // Find user
    const user = await User.findById(id).select('_id name');

    if (!user) {
      console.log(`User with ID ${id} not found`);
      return res.status(404).json({
        exists: false,
        message: 'User not found'
      });
    }

    console.log(`User with ID ${id} exists: ${user.name}`);
    return res.status(200).json({
      exists: true,
      user: {
        id: user._id,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error in checkUserExists:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        exists: false,
        message: 'Invalid user ID format'
      });
    }
    next(error);
  }
};

exports.searchFreelancers = async (req, res, next) => {
  try {
    console.log('Searching freelancers with query:', req.query);
    console.log('Request headers:', req.headers);
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);

    // Add CORS headers specifically for this endpoint
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Check if models are available
    if (!User || !Freelancer) {
      console.error('Models not properly loaded');
      return res.status(500).json({
        message: 'Server configuration error. Models not properly loaded.'
      });
    }

    const {
      keyword,
      skills,
      minHourlyRate,
      maxHourlyRate,
      availability,
      minRating,
      category,
      page = 1,
      limit = 10,
      sort = 'rating',
      order = 'desc'
    } = req.query;

    try {
      // Find users with role 'freelancer'
      const userQuery = { role: 'freelancer' };

      // Keyword search across name
      if (keyword) {
        userQuery.name = { $regex: keyword, $options: 'i' };
      }

      console.log('User query:', JSON.stringify(userQuery));

      // Find all matching users first
      const users = await User.find(userQuery)
        .select('_id name email profileImage')
        .lean();

      console.log(`Found ${users.length} matching users`);

      // Return empty results if no users found
      if (users.length === 0) {
        return res.status(200).json({
          freelancers: [],
          totalPages: 0,
          currentPage: Number(page),
          total: 0
        });
      }

      const userIds = users.map(user => user._id);

      // Build query for freelancers
      const query = {};

      if (userIds.length > 0) {
        query.user = { $in: userIds };
      }

      // Skills filter
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        // Use a more flexible query for skills
        query.$or = [
          { 'skills.name': { $in: skillsArray.map(skill => new RegExp(skill, 'i')) } }
        ];
      }

      // Hourly rate filter
      if (minHourlyRate || maxHourlyRate) {
        query.hourlyRate = {};
        if (minHourlyRate) query.hourlyRate.$gte = Number(minHourlyRate);
        if (maxHourlyRate) query.hourlyRate.$lte = Number(maxHourlyRate);
      }

      // Availability filter
      if (availability) {
        query['availability.status'] = availability;
      }

      // Category filter
      if (category) {
        const categoryArray = Array.isArray(category) ? category : [category];
        query.categories = { $in: categoryArray };
      }

      // Rating filter
      if (minRating) {
        query.averageRating = { $gte: Number(minRating) };
      }

      console.log('Freelancer query:', JSON.stringify(query));

      // Count total matching freelancers
      const total = await Freelancer.countDocuments(query);
      console.log(`Found ${total} matching freelancers`);

      // Determine sort options
      const sortOptions = {};
      if (sort === 'hourlyRate') {
        sortOptions.hourlyRate = order === 'asc' ? 1 : -1;
      } else if (sort === 'rating') {
        sortOptions.averageRating = order === 'asc' ? 1 : -1;
      } else if (sort === 'completedProjects') {
        sortOptions.completedProjects = order === 'asc' ? 1 : -1;
      } else {
        // Default to sorting by creation date
        sortOptions.createdAt = order === 'asc' ? 1 : -1;
      }

      // Find freelancers with pagination
      const freelancers = await Freelancer.find(query)
        .populate({
          path: 'user',
          select: 'name email profileImage'
        })
        .sort(sortOptions)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean();

      console.log(`Returning ${freelancers.length} freelancers for page ${page}`);

      // Handle case where user exists but no freelancer profile
      if (freelancers.length === 0) {
        return res.status(200).json({
          freelancers: [],
          totalPages: 0,
          currentPage: Number(page),
          total: 0
        });
      }

      // Format the response
      const formattedFreelancers = freelancers.map(freelancer => {
        // Check if user is populated
        if (!freelancer.user) {
          console.warn('Freelancer without user reference found:', freelancer._id);
          return null;
        }

        return {
          id: freelancer._id,
          userId: freelancer.user._id,
          name: freelancer.user.name,
          profileImage: freelancer.user.profileImage,
          title: freelancer.title || 'Tutor',
          bio: freelancer.bio || '',
          skills: freelancer.skills || [],
          hourlyRate: freelancer.hourlyRate || 0,
          availability: freelancer.availability || { status: 'Available' },
          categories: freelancer.categories || [],
          averageRating: freelancer.averageRating || 0,
          completedProjects: freelancer.completedProjects || 0
        };
      }).filter(Boolean); // Remove any null entries

      res.status(200).json({
        freelancers: formattedFreelancers,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        total
      });
    } catch (dbError) {
      console.error('Database error in searchFreelancers:', dbError);
      return res.status(500).json({
        message: 'Database error while searching freelancers',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Error searching freelancers:', error);
    res.status(500).json({
      message: 'An unexpected error occurred while searching freelancers',
      error: error.message
    });
  }
};
