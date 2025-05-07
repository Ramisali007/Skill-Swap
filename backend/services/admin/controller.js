const User = require('../../models/User');
const Freelancer = require('../../models/Freelancer');
const Client = require('../../models/Client');
const Project = require('../../models/Project');
const Bid = require('../../models/Bid');
const Review = require('../../models/Review');
const Notification = require('../../models/Notification');
const bcrypt = require('bcryptjs');

// Get pending freelancer verifications
exports.getPendingFreelancers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Find freelancers with pending verification documents
    const freelancers = await Freelancer.find({
      'verificationDocuments.status': 'pending'
    })
      .populate({
        path: 'user',
        select: 'name email isVerified'
      })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Count total pending freelancers
    const total = await Freelancer.countDocuments({
      'verificationDocuments.status': 'pending'
    });

    res.status(200).json({
      freelancers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get all freelancers for verification
exports.getFreelancersForVerification = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status } = req.query;

    // Build query
    const query = {};

    // Filter by status if provided
    if (status) {
      query.verificationStatus = status;
    }

    // Find all freelancers
    const freelancers = await Freelancer.find(query)
      .populate({
        path: 'user',
        select: 'name email isVerified'
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Count total freelancers
    const total = await Freelancer.countDocuments(query);

    res.status(200).json({
      freelancers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get freelancer by ID
exports.getFreelancerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find freelancer with all details
    const freelancer = await Freelancer.findById(id)
      .populate({
        path: 'user',
        select: 'name email isVerified'
      });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    res.status(200).json({
      freelancer
    });
  } catch (error) {
    next(error);
  }
};

// Verify document
exports.verifyDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    const { status, notes } = req.body;

    // Find freelancer
    const freelancer = await Freelancer.findById(id);

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Find document
    const document = freelancer.verificationDocuments.id(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Update document status and notes
    document.status = status;
    if (notes) {
      document.notes = notes;
    }

    await freelancer.save();

    // Create notification for freelancer
    const notification = new Notification({
      recipient: freelancer.user,
      type: 'verification',
      title: `Document ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your ${document.documentType || 'document'} has been ${status === 'approved' ? 'approved' : 'rejected'}.${notes ? ` Note: ${notes}` : ''}`,
      link: '/freelancer/profile',
      relatedId: freelancer._id,
      relatedModel: 'Freelancer'
    });

    await notification.save();

    res.status(200).json({
      message: `Document ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      document
    });
  } catch (error) {
    next(error);
  }
};

// Verify freelancer
exports.verifyFreelancer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, verificationLevel, verificationNotes, documentIds } = req.body;

    // Find freelancer
    const freelancer = await Freelancer.findById(id).populate('user');

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Update verification status based on action
    if (action) {
      freelancer.verificationStatus = action === 'approve' ? 'approved' :
                                     action === 'reject' ? 'rejected' : 'pending';
    } else {
      // Default to approved if no action specified
      freelancer.verificationStatus = 'approved';
    }

    // Update verification level
    if (verificationLevel) {
      freelancer.verificationLevel = verificationLevel;
    }

    // Update verification notes
    if (verificationNotes) {
      freelancer.verificationNotes = verificationNotes;
    }

    // Update document status
    if (documentIds && documentIds.length > 0) {
      documentIds.forEach(docId => {
        const document = freelancer.verificationDocuments.id(docId);
        if (document) {
          document.status = freelancer.verificationStatus === 'approved' ? 'approved' : 'rejected';
        }
      });
    } else {
      // If no specific documents provided, update all pending documents
      freelancer.verificationDocuments.forEach(doc => {
        if (doc.status === 'pending') {
          doc.status = freelancer.verificationStatus === 'approved' ? 'approved' : 'rejected';
        }
      });
    }

    await freelancer.save();

    // Create notification for freelancer
    const notification = new Notification({
      recipient: freelancer.user._id,
      type: 'verification',
      title: freelancer.verificationStatus === 'approved' ? 'Verification Approved' : 'Verification Rejected',
      message: freelancer.verificationStatus === 'approved'
        ? `Your verification has been approved. Your account is now ${freelancer.verificationLevel || 'Basic'} verified.`
        : 'Your verification has been rejected. Please contact support for more information.',
      link: '/profile',
      relatedId: freelancer._id,
      relatedModel: 'Freelancer'
    });

    await notification.save();

    res.status(200).json({
      message: `Freelancer ${freelancer.verificationStatus === 'approved' ? 'verified' : 'rejected'} successfully`,
      freelancer
    });
  } catch (error) {
    next(error);
  }
};

// Reject freelancer verification
exports.rejectFreelancer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, documentIds } = req.body;

    // Find freelancer
    const freelancer = await Freelancer.findById(id).populate('user');

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Update document status
    if (documentIds && documentIds.length > 0) {
      documentIds.forEach(docId => {
        const document = freelancer.verificationDocuments.id(docId);
        if (document) {
          document.status = 'rejected';
        }
      });
    } else {
      // If no specific documents provided, reject all pending documents
      freelancer.verificationDocuments.forEach(doc => {
        if (doc.status === 'pending') {
          doc.status = 'rejected';
        }
      });
    }

    // Update verification status
    freelancer.verificationStatus = 'rejected';

    await freelancer.save();

    // Create notification for freelancer
    const notification = new Notification({
      recipient: freelancer.user._id,
      type: 'verification',
      title: 'Verification Rejected',
      message: reason || 'Your verification documents have been rejected. Please submit new documents.',
      link: '/profile/verification',
      relatedId: freelancer._id,
      relatedModel: 'Freelancer'
    });

    await notification.save();

    res.status(200).json({
      message: 'Freelancer verification rejected',
      freelancer
    });
  } catch (error) {
    next(error);
  }
};

// Bulk verify freelancers
exports.bulkVerifyFreelancers = async (req, res, next) => {
  try {
    const { freelancerIds, action } = req.body;

    if (!freelancerIds || !Array.isArray(freelancerIds) || freelancerIds.length === 0) {
      return res.status(400).json({ message: 'No freelancer IDs provided' });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject"' });
    }

    // Update verification status for all freelancers
    const verificationStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update all freelancers
    const result = await Freelancer.updateMany(
      { _id: { $in: freelancerIds } },
      { $set: { verificationStatus } }
    );

    // Create notifications for all freelancers
    const freelancers = await Freelancer.find({ _id: { $in: freelancerIds } }).populate('user');

    const notifications = freelancers.map(freelancer => ({
      recipient: freelancer.user._id,
      type: 'verification',
      title: action === 'approve' ? 'Verification Approved' : 'Verification Rejected',
      message: action === 'approve'
        ? 'Your verification has been approved. You can now access all freelancer features.'
        : 'Your verification has been rejected. Please contact support for more information.',
      link: '/profile/verification',
      relatedId: freelancer._id,
      relatedModel: 'Freelancer'
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({
      message: `${result.modifiedCount} freelancers ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Create a new user (admin only)
exports.createUser = async (req, res, next) => {
  try {
    console.log('Create user request body:', req.body);
    const { name, email, password, role, phone, country } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already in use:', email);
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Validate role
    if (!['client', 'freelancer', 'admin'].includes(role.toLowerCase())) {
      console.log('Invalid role:', role);
      return res.status(400).json({ message: 'Invalid role. Must be client, freelancer, or admin' });
    }

    // Create new user - don't hash password here, let the User model's pre-save hook handle it
    const user = new User({
      name,
      email,
      password, // The User model will hash this in its pre-save hook
      role: role.toLowerCase(), // Ensure role is lowercase
      phone,
      address: {
        country
      },
      isVerified: true, // Admin-created users are automatically verified
      accountStatus: 'active'
    });

    console.log('Saving user:', { name, email, role: role.toLowerCase() });
    await user.save();
    console.log('User saved with ID:', user._id);

    // Create role-specific profile
    if (role.toLowerCase() === 'client') {
      const client = new Client({
        user: user._id
      });
      await client.save();
      console.log('Client profile created');
    } else if (role.toLowerCase() === 'freelancer') {
      const freelancer = new Freelancer({
        user: user._id,
        verificationStatus: 'approved' // Admin-created freelancers are automatically approved
      });
      await freelancer.save();
      console.log('Freelancer profile created');
    }

    // Create welcome notification
    const notification = new Notification({
      recipient: user._id,
      type: 'system',
      title: 'Welcome to SkillSwap',
      message: 'Your account has been created by an administrator. Welcome to the platform!',
      link: '/profile',
      relatedId: user._id,
      relatedModel: 'User'
    });

    await notification.save();
    console.log('Welcome notification created');

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(error);
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    // Build query
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total users
    const total = await User.countDocuments(query);

    // Find users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get role-specific profile
    let profile = null;
    if (user.role === 'client') {
      profile = await Client.findOne({ user: user._id });
    } else if (user.role === 'freelancer') {
      profile = await Freelancer.findOne({ user: user._id });
    }

    res.status(200).json({
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, country, status } = req.body;

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (status) user.accountStatus = status;

    // Update address if country is provided
    if (country) {
      if (!user.address) user.address = {};
      user.address.country = country;
    }

    await user.save();

    // Create notification for user
    const notification = new Notification({
      recipient: user._id,
      type: 'system',
      title: 'Profile Updated',
      message: 'Your profile information has been updated by an administrator.',
      link: '/profile',
      relatedId: user._id,
      relatedModel: 'User'
    });

    await notification.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deactivating admin accounts
    if (user.role === 'admin' && isActive === false) {
      return res.status(403).json({ message: 'Cannot deactivate admin accounts' });
    }

    // Update user status
    user.isActive = isActive;
    await user.save();

    // Create notification for user
    const notification = new Notification({
      recipient: user._id,
      type: 'system',
      title: isActive ? 'Account Activated' : 'Account Deactivated',
      message: isActive
        ? 'Your account has been activated. You can now use all platform features.'
        : 'Your account has been deactivated. Please contact support for more information.',
      link: '/profile',
      relatedId: user._id,
      relatedModel: 'User'
    });

    await notification.save();

    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    // Delete role-specific profile
    if (user.role === 'client') {
      await Client.deleteOne({ user: user._id });
    } else if (user.role === 'freelancer') {
      await Freelancer.deleteOne({ user: user._id });
    }

    // Delete user's notifications
    await Notification.deleteMany({ recipient: user._id });

    // Delete user
    await User.deleteOne({ _id: id });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all projects
exports.getAllProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total projects
    const total = await Project.countDocuments(query);

    // Find projects with pagination
    const projects = await Project.find(query)
      .populate({
        path: 'client',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate({
        path: 'assignedFreelancer',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get project by ID
exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find project
    const project = await Project.findById(id)
      .populate({
        path: 'client',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate({
        path: 'assignedFreelancer',
        select: 'user skills',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate({
        path: 'bids',
        populate: {
          path: 'freelancer',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name'
          }
        }
      });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

// Update project status
exports.updateProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Find project
    const project = await Project.findById(id)
      .populate({
        path: 'client',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate({
        path: 'assignedFreelancer',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update project status
    project.status = status;
    await project.save();

    // Create notifications for client and freelancer
    const clientNotification = new Notification({
      recipient: project.client.user._id,
      type: 'project',
      title: 'Project Status Updated',
      message: `Your project "${project.title}" status has been updated to ${status} by an admin${reason ? `: ${reason}` : ''}`,
      link: `/projects/${project._id}`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await clientNotification.save();

    if (project.assignedFreelancer) {
      const freelancerNotification = new Notification({
        recipient: project.assignedFreelancer.user._id,
        type: 'project',
        title: 'Project Status Updated',
        message: `Project "${project.title}" status has been updated to ${status} by an admin${reason ? `: ${reason}` : ''}`,
        link: `/projects/${project._id}`,
        relatedId: project._id,
        relatedModel: 'Project'
      });

      await freelancerNotification.save();
    }

    res.status(200).json({
      message: 'Project status updated successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// Delete project (admin only)
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get client and freelancer IDs for notifications
    let clientId = null;
    let freelancerId = null;

    if (project.client) {
      const client = await Client.findById(project.client).populate('user');
      if (client && client.user) {
        clientId = client.user._id;
      }
    }

    if (project.assignedFreelancer) {
      const freelancer = await Freelancer.findById(project.assignedFreelancer).populate('user');
      if (freelancer && freelancer.user) {
        freelancerId = freelancer.user._id;
      }
    }

    // Delete all bids associated with the project
    await Bid.deleteMany({ project: project._id });

    // Delete all notifications related to this project
    await Notification.deleteMany({ relatedId: project._id, relatedModel: 'Project' });

    // Delete the project
    await Project.deleteOne({ _id: project._id });

    // Create notifications for client and freelancer
    if (clientId) {
      const clientNotification = new Notification({
        recipient: clientId,
        type: 'system',
        title: 'Project Deleted',
        message: `Your project "${project.title}" has been deleted by an administrator.`,
        link: '/client/projects',
        relatedModel: 'System'
      });
      await clientNotification.save();
    }

    if (freelancerId) {
      const freelancerNotification = new Notification({
        recipient: freelancerId,
        type: 'system',
        title: 'Project Deleted',
        message: `Project "${project.title}" has been deleted by an administrator.`,
        link: '/freelancer/projects',
        relatedModel: 'System'
      });
      await freelancerNotification.save();
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res, next) => {
  try {
    // Get user counts by role
    const totalUsers = await User.countDocuments();
    const clientCount = await User.countDocuments({ role: 'client' });
    const freelancerCount = await User.countDocuments({ role: 'freelancer' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Get user registration trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          clients: {
            $sum: {
              $cond: [{ $eq: ['$role', 'client'] }, 1, 0]
            }
          },
          freelancers: {
            $sum: {
              $cond: [{ $eq: ['$role', 'freelancer'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Get verification statistics
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // Get freelancer verification levels
    const basicFreelancers = await Freelancer.countDocuments({ verificationLevel: 'Basic' });
    const verifiedFreelancers = await Freelancer.countDocuments({ verificationLevel: 'Verified' });
    const premiumFreelancers = await Freelancer.countDocuments({ verificationLevel: 'Premium' });

    res.status(200).json({
      totalUsers,
      roleCounts: {
        clients: clientCount,
        freelancers: freelancerCount,
        admins: adminCount
      },
      verificationStats: {
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        verificationRate: (verifiedUsers / totalUsers) * 100
      },
      freelancerVerificationLevels: {
        basic: basicFreelancers,
        verified: verifiedFreelancers,
        premium: premiumFreelancers
      },
      registrationTrends: userTrends
    });
  } catch (error) {
    next(error);
  }
};

// Get project analytics
exports.getProjectAnalytics = async (req, res, next) => {
  try {
    // Get project counts by status
    const totalProjects = await Project.countDocuments();
    const openProjects = await Project.countDocuments({ status: 'open' });
    const inProgressProjects = await Project.countDocuments({ status: 'in_progress' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const cancelledProjects = await Project.countDocuments({ status: 'cancelled' });

    // Get project creation trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const projectTrends = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Get average project duration (completed projects)
    const completedProjectsData = await Project.find({
      status: 'completed',
      createdAt: { $exists: true },
      updatedAt: { $exists: true }
    });

    let totalDuration = 0;
    completedProjectsData.forEach(project => {
      const duration = project.updatedAt - project.createdAt;
      totalDuration += duration;
    });

    const averageDuration = completedProjectsData.length > 0
      ? totalDuration / completedProjectsData.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Get top project categories
    const projectCategories = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          averageBudget: { $avg: '$budget' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      totalProjects,
      statusCounts: {
        open: openProjects,
        inProgress: inProgressProjects,
        completed: completedProjects,
        cancelled: cancelledProjects
      },
      projectTrends,
      averageProjectDuration: averageDuration,
      topCategories: projectCategories
    });
  } catch (error) {
    next(error);
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    // Get total project value
    const projectValueResult = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          averageBudget: { $avg: '$budget' },
          minBudget: { $min: '$budget' },
          maxBudget: { $max: '$budget' }
        }
      }
    ]);

    const projectValue = projectValueResult[0] || {
      totalBudget: 0,
      averageBudget: 0,
      minBudget: 0,
      maxBudget: 0
    };

    // Get revenue by project status
    const revenueByStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          totalBudget: { $sum: '$budget' },
          count: { $sum: 1 },
          averageBudget: { $avg: '$budget' }
        }
      }
    ]);

    // Get revenue trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueTrends = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalBudget: { $sum: '$budget' },
          completedBudget: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$budget', 0]
            }
          },
          projectCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Get revenue by category
    const revenueByCategory = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          totalBudget: { $sum: '$budget' },
          count: { $sum: 1 },
          averageBudget: { $avg: '$budget' }
        }
      },
      {
        $sort: { totalBudget: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      projectValue,
      revenueByStatus,
      revenueTrends,
      revenueByCategory
    });
  } catch (error) {
    next(error);
  }
};

// Get skills analytics
exports.getSkillsAnalytics = async (req, res, next) => {
  try {
    const { timeframe = 'all', limit = 10 } = req.query;

    // Set date filter based on timeframe
    let dateFilter = {};
    if (timeframe !== 'all') {
      const startDate = new Date();

      if (timeframe === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (timeframe === 'quarter') {
        startDate.setMonth(startDate.getMonth() - 3);
      } else if (timeframe === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Get top freelancer skills with growth trend
    const freelancerSkills = await Freelancer.aggregate([
      { $match: dateFilter },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills.name',
          count: { $sum: 1 },
          experienceYears: { $avg: '$skills.yearsOfExperience' },
          skillLevels: { $push: '$skills.level' }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          experienceYears: 1,
          beginnerCount: {
            $size: {
              $filter: {
                input: '$skillLevels',
                as: 'level',
                cond: { $eq: ['$$level', 'Beginner'] }
              }
            }
          },
          intermediateCount: {
            $size: {
              $filter: {
                input: '$skillLevels',
                as: 'level',
                cond: { $eq: ['$$level', 'Intermediate'] }
              }
            }
          },
          advancedCount: {
            $size: {
              $filter: {
                input: '$skillLevels',
                as: 'level',
                cond: { $eq: ['$$level', 'Advanced'] }
              }
            }
          },
          expertCount: {
            $size: {
              $filter: {
                input: '$skillLevels',
                as: 'level',
                cond: { $eq: ['$$level', 'Expert'] }
              }
            }
          },
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Get skill growth over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const skillGrowthTrend = await Freelancer.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      { $unwind: '$skills' },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            skill: '$skills.name'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      },
      {
        $group: {
          _id: '$_id.skill',
          trend: {
            $push: {
              month: '$_id.month',
              year: '$_id.year',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      { $sort: { totalCount: -1 } },
      { $limit: 5 }
    ]);

    // Get top project skills with demand metrics
    const projectSkills = await Project.aggregate([
      { $match: dateFilter },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          averageBudget: { $avg: '$budget' },
          projects: { $push: { id: '$_id', status: '$status', budget: '$budget' } }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          totalBudget: 1,
          averageBudget: 1,
          completedProjects: {
            $size: {
              $filter: {
                input: '$projects',
                as: 'project',
                cond: { $eq: ['$$project.status', 'completed'] }
              }
            }
          },
          highBudgetProjects: {
            $size: {
              $filter: {
                input: '$projects',
                as: 'project',
                cond: { $gte: ['$$project.budget', 1000] }
              }
            }
          },
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Get skill demand vs supply analysis
    const skillDemandSupply = [];

    // Process the top skills to calculate demand vs supply
    const topSkillNames = new Set(projectSkills.map(skill => skill.name));
    const freelancerSkillMap = new Map(freelancerSkills.map(skill => [skill.name, skill]));

    for (const projectSkill of projectSkills) {
      const skillName = projectSkill.name;
      const freelancerSkill = freelancerSkillMap.get(skillName);

      skillDemandSupply.push({
        name: skillName,
        demand: projectSkill.count,
        supply: freelancerSkill ? freelancerSkill.count : 0,
        demandGrowth: projectSkill.count / (projectSkill.completedProjects || 1), // Ratio of current to completed
        averageRate: projectSkill.averageBudget,
        demandSupplyRatio: projectSkill.count / (freelancerSkill ? freelancerSkill.count : 1),
        marketValue: projectSkill.totalBudget
      });
    }

    // Calculate skill growth forecast
    const skillForecast = skillGrowthTrend.map(skill => {
      const trend = skill.trend;
      const name = skill._id;

      // Simple linear regression for forecasting
      const n = trend.length;
      if (n < 2) {
        return {
          name,
          trend,
          forecast: null
        };
      }

      // Convert month/year to numeric x values (months since start)
      const baseDate = new Date(trend[0].year, trend[0].month - 1, 1);
      const points = trend.map(point => {
        const date = new Date(point.year, point.month - 1, 1);
        const monthsDiff = (date.getFullYear() - baseDate.getFullYear()) * 12 + date.getMonth() - baseDate.getMonth();
        return {
          x: monthsDiff,
          y: point.count
        };
      });

      // Calculate linear regression
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (const point of points) {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumX2 += point.x * point.x;
      }

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Generate forecast for next 3 months
      const forecast = [];
      const lastX = points[points.length - 1].x;

      for (let i = 1; i <= 3; i++) {
        const forecastX = lastX + i;
        const forecastY = Math.max(0, Math.round(intercept + slope * forecastX));

        const forecastDate = new Date(baseDate);
        forecastDate.setMonth(baseDate.getMonth() + forecastX);

        forecast.push({
          month: forecastDate.getMonth() + 1,
          year: forecastDate.getFullYear(),
          count: forecastY
        });
      }

      return {
        name,
        trend,
        forecast,
        growthRate: slope > 0 ? (slope / (points[0].y || 1)) * 100 : 0
      };
    });

    // Get skills by project category
    const skillsByCategory = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          skills: { $push: '$skills' }
        }
      }
    ]);

    // Process skills by category
    const processedSkillsByCategory = [];

    for (const category of skillsByCategory) {
      // Flatten skills array
      const flatSkills = category.skills.flat();

      // Count occurrences of each skill
      const skillCounts = {};
      flatSkills.forEach(skill => {
        if (!skillCounts[skill]) {
          skillCounts[skill] = 0;
        }
        skillCounts[skill]++;
      });

      // Convert to array and sort
      const sortedSkills = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      processedSkillsByCategory.push({
        category: category._id,
        topSkills: sortedSkills
      });
    }

    // Return the analytics data
    res.status(200).json({
      freelancerSkills,
      projectSkills,
      skillDemandSupply,
      skillGrowthTrend,
      skillForecast,
      skillsByCategory: processedSkillsByCategory,
      metadata: {
        timeframe,
        dateRange: {
          start: timeframe !== 'all' ? new Date(dateFilter.createdAt.$gte) : null,
          end: new Date()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user growth analytics
exports.getUserGrowthAnalytics = async (req, res, next) => {
  try {
    const { timeframe = 'year', interval = 'month' } = req.query;

    // Set date filter based on timeframe
    let startDate = new Date();
    if (timeframe === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeframe === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (timeframe === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (timeframe === 'all') {
      startDate = new Date(0); // Beginning of time
    }

    // Set group by interval
    let groupByInterval;
    if (interval === 'day') {
      groupByInterval = {
        day: { $dayOfMonth: '$createdAt' },
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' }
      };
    } else if (interval === 'week') {
      groupByInterval = {
        week: { $week: '$createdAt' },
        year: { $year: '$createdAt' }
      };
    } else {
      // Default to month
      groupByInterval = {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' }
      };
    }

    // Get user growth by role
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            ...groupByInterval,
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
          '_id.week': 1
        }
      }
    ]);

    // Process data for chart display
    const processedData = {
      labels: [],
      datasets: {
        client: [],
        freelancer: [],
        admin: []
      },
      totalUsers: {
        client: 0,
        freelancer: 0,
        admin: 0
      }
    };

    // Get total users by role
    const totalUsers = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    totalUsers.forEach(item => {
      if (item._id === 'client' || item._id === 'freelancer' || item._id === 'admin') {
        processedData.totalUsers[item._id] = item.count;
      }
    });

    // Process user growth data
    const timePoints = new Map();

    userGrowth.forEach(item => {
      const role = item._id.role;
      if (role !== 'client' && role !== 'freelancer' && role !== 'admin') return;

      let timeKey;
      if (interval === 'day') {
        timeKey = `${item._id.year}-${item._id.month}-${item._id.day}`;
      } else if (interval === 'week') {
        timeKey = `${item._id.year}-W${item._id.week}`;
      } else {
        timeKey = `${item._id.year}-${item._id.month}`;
      }

      if (!timePoints.has(timeKey)) {
        timePoints.set(timeKey, {
          timeKey,
          client: 0,
          freelancer: 0,
          admin: 0
        });
      }

      const point = timePoints.get(timeKey);
      point[role] = item.count;
    });

    // Sort time points
    const sortedTimePoints = Array.from(timePoints.values()).sort((a, b) => {
      return a.timeKey.localeCompare(b.timeKey);
    });

    // Format for chart display
    sortedTimePoints.forEach(point => {
      processedData.labels.push(point.timeKey);
      processedData.datasets.client.push(point.client);
      processedData.datasets.freelancer.push(point.freelancer);
      processedData.datasets.admin.push(point.admin);
    });

    // Calculate growth rates
    const growthRates = {
      client: calculateGrowthRate(processedData.datasets.client),
      freelancer: calculateGrowthRate(processedData.datasets.freelancer),
      admin: calculateGrowthRate(processedData.datasets.admin)
    };

    // Calculate user retention
    const retentionRates = await calculateRetentionRates();

    // Calculate user forecast
    const forecast = {
      client: forecastNextPeriods(processedData.datasets.client, 3),
      freelancer: forecastNextPeriods(processedData.datasets.freelancer, 3),
      admin: forecastNextPeriods(processedData.datasets.admin, 3)
    };

    res.status(200).json({
      userGrowth: processedData,
      totalUsers: processedData.totalUsers,
      growthRates,
      retentionRates,
      forecast,
      metadata: {
        timeframe,
        interval,
        startDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate growth rate
function calculateGrowthRate(data) {
  if (!data || data.length < 2) return 0;

  const firstValue = data[0] || 0;
  const lastValue = data[data.length - 1] || 0;

  if (firstValue === 0) return 100; // If starting from 0, growth rate is 100%

  return ((lastValue - firstValue) / firstValue) * 100;
}

// Helper function to forecast next periods using simple moving average
function forecastNextPeriods(data, periods = 3) {
  if (!data || data.length < 3) {
    return Array(periods).fill(0);
  }

  // Use last 3 periods for simple moving average
  const lastPeriods = data.slice(-3);
  const avg = lastPeriods.reduce((sum, val) => sum + val, 0) / lastPeriods.length;

  // Apply simple growth factor based on last two periods
  const lastValue = data[data.length - 1] || 0;
  const secondLastValue = data[data.length - 2] || 0;

  let growthFactor = 1;
  if (secondLastValue > 0) {
    growthFactor = lastValue / secondLastValue;
  }

  // Cap growth factor to reasonable range
  growthFactor = Math.max(0.8, Math.min(growthFactor, 1.5));

  // Generate forecast
  const forecast = [];
  let currentValue = lastValue;

  for (let i = 0; i < periods; i++) {
    currentValue = Math.round(currentValue * growthFactor);
    forecast.push(currentValue);
  }

  return forecast;
}

// Helper function to calculate retention rates
async function calculateRetentionRates() {
  // This would typically involve analyzing user activity over time
  // For this implementation, we'll return placeholder data
  return {
    overall: 78, // 78% retention rate
    client: 82,
    freelancer: 75,
    admin: 95
  };
}

// Get transaction analytics
exports.getTransactionAnalytics = async (req, res, next) => {
  try {
    const { timeframe = 'year', interval = 'month' } = req.query;

    // Set date filter based on timeframe
    let startDate = new Date();
    if (timeframe === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeframe === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (timeframe === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (timeframe === 'all') {
      startDate = new Date(0); // Beginning of time
    }

    // Set group by interval
    let groupByInterval;
    if (interval === 'day') {
      groupByInterval = {
        day: { $dayOfMonth: '$createdAt' },
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' }
      };
    } else if (interval === 'week') {
      groupByInterval = {
        week: { $week: '$createdAt' },
        year: { $year: '$createdAt' }
      };
    } else {
      // Default to month
      groupByInterval = {
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' }
      };
    }

    // Get project transactions
    const projectTransactions = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupByInterval,
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          avgBudget: { $avg: '$budget' },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          completedBudget: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$budget', 0]
            }
          }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
          '_id.week': 1
        }
      }
    ]);

    // Process data for chart display
    const processedData = {
      labels: [],
      datasets: {
        projectCount: [],
        totalBudget: [],
        avgBudget: [],
        completedCount: [],
        completedBudget: []
      },
      totals: {
        projectCount: 0,
        totalBudget: 0,
        completedCount: 0,
        completedBudget: 0
      }
    };

    // Get overall totals
    const totals = await Project.aggregate([
      {
        $group: {
          _id: null,
          projectCount: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          completedBudget: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$budget', 0]
            }
          }
        }
      }
    ]);

    if (totals.length > 0) {
      processedData.totals = {
        projectCount: totals[0].projectCount,
        totalBudget: totals[0].totalBudget,
        completedCount: totals[0].completedCount,
        completedBudget: totals[0].completedBudget
      };
    }

    // Process transaction data
    projectTransactions.forEach(item => {
      let timeKey;
      if (interval === 'day') {
        timeKey = `${item._id.year}-${item._id.month}-${item._id.day}`;
      } else if (interval === 'week') {
        timeKey = `${item._id.year}-W${item._id.week}`;
      } else {
        timeKey = `${item._id.year}-${item._id.month}`;
      }

      processedData.labels.push(timeKey);
      processedData.datasets.projectCount.push(item.count);
      processedData.datasets.totalBudget.push(item.totalBudget);
      processedData.datasets.avgBudget.push(item.avgBudget);
      processedData.datasets.completedCount.push(item.completedCount);
      processedData.datasets.completedBudget.push(item.completedBudget);
    });

    // Calculate revenue forecast
    const revenueForecast = forecastNextPeriods(processedData.datasets.totalBudget, 3);

    // Calculate completion rate
    const completionRate = processedData.totals.projectCount > 0
      ? (processedData.totals.completedCount / processedData.totals.projectCount) * 100
      : 0;

    // Calculate average project duration
    const avgProjectDuration = await calculateAverageProjectDuration();

    res.status(200).json({
      transactions: processedData,
      totals: processedData.totals,
      revenueForecast,
      completionRate,
      avgProjectDuration,
      metadata: {
        timeframe,
        interval,
        startDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate average project duration
async function calculateAverageProjectDuration() {
  try {
    const result = await Project.aggregate([
      {
        $match: {
          status: 'completed',
          startDate: { $exists: true },
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$completedAt', '$startDate'] },
              1000 * 60 * 60 * 24 // Convert ms to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    return result.length > 0 ? result[0].avgDuration : 0;
  } catch (error) {
    console.error('Error calculating average project duration:', error);
    return 0;
  }
}

// Get user documents
exports.getUserDocuments = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get documents based on user role
    if (user.role === 'freelancer') {
      const freelancer = await Freelancer.findOne({ user: userId });

      if (!freelancer) {
        return res.status(404).json({ message: 'Freelancer profile not found' });
      }

      res.status(200).json({
        documents: freelancer.verificationDocuments
      });
    } else {
      res.status(200).json({
        message: 'No documents available for this user role',
        documents: []
      });
    }
  } catch (error) {
    next(error);
  }
};
