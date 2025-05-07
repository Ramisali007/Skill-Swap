const User = require('../../models/User');
const Client = require('../../models/Client');
const Freelancer = require('../../models/Freelancer');
const Project = require('../../models/Project');
const Bid = require('../../models/Bid');
const Review = require('../../models/Review');

// Get admin analytics
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    // Get basic stats
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    
    // Calculate new users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Calculate new projects in the last 30 days
    const newProjects = await Project.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Calculate total earnings (assuming 10% platform fee on completed projects)
    const completedProjectsData = await Project.find({ status: 'completed' });
    const totalEarnings = completedProjectsData.reduce((total, project) => total + project.budget, 0);
    const platformFees = totalEarnings * 0.1;
    
    // Get user growth data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowthData = [];
    for (let i = 0; i < 6; i++) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      
      const freelancers = await User.countDocuments({
        role: 'freelancer',
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const clients = await User.countDocuments({
        role: 'client',
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      userGrowthData.unshift({
        date: startDate,
        freelancers,
        clients
      });
    }
    
    // Get project growth data (last 6 months)
    const projectGrowthData = [];
    for (let i = 0; i < 6; i++) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      
      const posted = await Project.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const completed = await Project.countDocuments({
        status: 'completed',
        updatedAt: { $gte: startDate, $lte: endDate }
      });
      
      projectGrowthData.unshift({
        date: startDate,
        posted,
        completed
      });
    }
    
    // Get revenue data (last 6 months)
    const revenueData = [];
    for (let i = 0; i < 6; i++) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      
      const completedProjectsInMonth = await Project.find({
        status: 'completed',
        updatedAt: { $gte: startDate, $lte: endDate }
      });
      
      const revenue = completedProjectsInMonth.reduce((total, project) => total + (project.budget * 0.1), 0);
      
      revenueData.unshift({
        date: startDate,
        revenue
      });
    }
    
    // Get category data
    const categoryData = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          totalBudget: 1,
          _id: 0
        }
      }
    ]);
    
    res.status(200).json({
      stats: {
        totalUsers,
        newUsers,
        totalProjects,
        newProjects,
        totalEarnings,
        platformFees
      },
      userGrowthData,
      projectGrowthData,
      revenueData,
      categoryData
    });
  } catch (error) {
    next(error);
  }
};
