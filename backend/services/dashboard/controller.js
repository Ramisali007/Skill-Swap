const User = require('../../models/User');
const Client = require('../../models/Client');
const Freelancer = require('../../models/Freelancer');
const Project = require('../../models/Project');
const Bid = require('../../models/Bid');
const Review = require('../../models/Review');
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');

// Get client dashboard data
exports.getClientDashboard = async (req, res, next) => {
  try {
    console.log('Client dashboard request:', req.userId);
    const userId = req.userId; // Use req.userId instead of req.user._id

    // Find client profile
    const client = await Client.findOne({ user: userId });

    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    // Get client's projects
    const projects = await Project.find({ client: client._id });

    // Count projects by status
    const activeProjects = projects.filter(project => project.status === 'open' || project.status === 'in_progress').length;
    const completedProjects = projects.filter(project => project.status === 'completed').length;

    // Get pending bids on client's projects
    const projectIds = projects.map(project => project._id);
    const pendingBids = await Bid.countDocuments({
      project: { $in: projectIds },
      status: 'pending'
    });

    // Calculate total spent on completed projects
    const totalSpent = projects
      .filter(project => project.status === 'completed')
      .reduce((total, project) => total + project.budget, 0);

    // Get recent projects (limit to 5)
    const recentProjects = await Project.find({ client: client._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'assignedFreelancer',
        populate: {
          path: 'user',
          select: 'name'
        }
      });

    // Get recent bids (limit to 5)
    const recentBids = await Bid.find({ project: { $in: projectIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'freelancer',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate('project', 'title');

    // Prepare dashboard data
    const dashboardData = {
      stats: {
        activeProjects,
        completedProjects,
        pendingBids,
        totalSpent
      },
      recentProjects,
      recentBids
    };

    // Emit dashboard update event if Socket.io is available
    if (req.app.get('io')) {
      req.app.get('io').to(`dashboard_${userId}`).emit('dashboard_data_update', {
        userId,
        type: 'client_dashboard',
        data: dashboardData
      });
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
};

// Get freelancer dashboard data
exports.getFreelancerDashboard = async (req, res, next) => {
  try {
    console.log('Freelancer dashboard request:', req.userId);
    const userId = req.userId; // Use req.userId instead of req.user._id

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Get projects where freelancer is assigned
    const assignedProjects = await Project.find({ assignedFreelancer: freelancer._id });

    // Count projects by status
    const activeProjects = assignedProjects.filter(project => project.status === 'in_progress').length;
    const completedProjects = assignedProjects.filter(project => project.status === 'completed').length;

    // Get pending bids by freelancer
    const pendingBids = await Bid.countDocuments({
      freelancer: freelancer._id,
      status: 'pending'
    });

    // Calculate total earned from completed projects
    const totalEarned = assignedProjects
      .filter(project => project.status === 'completed')
      .reduce((total, project) => total + project.budget, 0);

    // Get recent bids by freelancer (limit to 5)
    const recentBids = await Bid.find({ freelancer: freelancer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('project', 'title budget status');

    // Get recent projects (limit to 5)
    const recentProjects = await Project.find({ assignedFreelancer: freelancer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'client',
        populate: {
          path: 'user',
          select: 'name'
        }
      });

    // Get recent reviews for freelancer (limit to 3)
    const recentReviews = await Review.find({ reviewee: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('reviewer', 'name')
      .populate('project', 'title');

    // Prepare dashboard data
    const dashboardData = {
      stats: {
        activeProjects,
        completedProjects,
        pendingBids,
        totalEarned
      },
      recentBids,
      recentProjects,
      recentReviews
    };

    console.log('Freelancer dashboard data:', {
      stats: dashboardData.stats,
      recentBidsCount: recentBids.length,
      recentProjectsCount: recentProjects.length,
      recentReviewsCount: recentReviews.length
    });

    // Emit dashboard update event if Socket.io is available
    if (req.app.get('io')) {
      req.app.get('io').to(`dashboard_${userId}`).emit('dashboard_data_update', {
        userId,
        type: 'freelancer_dashboard',
        data: dashboardData
      });
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
};

// Get admin dashboard data
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Get user counts
    const totalUsers = await User.countDocuments();
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
    });

    // Get project counts
    const totalProjects = await Project.countDocuments();
    const newProjectsLastMonth = await Project.countDocuments({
      createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
    });

    // Get pending verifications
    const pendingVerifications = await Freelancer.countDocuments({
      'verificationDocuments.status': 'pending'
    });

    // Calculate total platform revenue (assuming 10% fee on completed projects)
    const completedProjects = await Project.find({ status: 'completed' });
    const totalRevenue = completedProjects.reduce((total, project) => total + (project.budget * 0.1), 0);

    // Get recent users (limit to 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    // Get recent projects (limit to 5)
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'client',
        populate: {
          path: 'user',
          select: 'name'
        }
      });

    // Get freelancers pending verification (limit to 5)
    const pendingFreelancers = await Freelancer.find({
      'verificationDocuments.status': 'pending'
    })
      .limit(5)
      .populate('user', 'name email');

    // Prepare dashboard data
    const dashboardData = {
      stats: {
        totalUsers,
        newUsersLastMonth,
        totalProjects,
        newProjectsLastMonth,
        pendingVerifications,
        totalRevenue
      },
      recentUsers,
      recentProjects,
      pendingFreelancers
    };

    // Emit dashboard update event if Socket.io is available
    if (req.app.get('io')) {
      req.app.get('io').to(`dashboard_${userId}`).emit('dashboard_data_update', {
        userId,
        type: 'admin_dashboard',
        data: dashboardData
      });
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
};
