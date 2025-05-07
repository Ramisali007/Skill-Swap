const User = require('../../models/User');
const Client = require('../../models/Client');
const Freelancer = require('../../models/Freelancer');
const Project = require('../../models/Project');
const Bid = require('../../models/Bid');
const Review = require('../../models/Review');

// Get client analytics
exports.getClientAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Parse date range from query parameters
    let startDate, endDate;

    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    } else {
      // Default to last 30 days if no date range provided
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    // Find client profile
    const client = await Client.findOne({ user: userId });

    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    // Get client's projects with date filtering
    const projectQuery = {
      client: client._id,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // Get projects based on query
    const projects = await Project.find(projectQuery);

    // Count projects by status
    const totalProjects = projects.length;
    const activeProjects = projects.filter(project => project.status === 'open' || project.status === 'in_progress').length;
    const completedProjects = projects.filter(project => project.status === 'completed').length;
    const cancelledProjects = projects.filter(project => project.status === 'cancelled').length;

    // Calculate total spent on completed projects
    const totalSpent = projects
      .filter(project => project.status === 'completed')
      .reduce((total, project) => total + project.budget, 0);

    // Calculate average project cost
    const averageProjectCost = completedProjects > 0
      ? totalSpent / completedProjects
      : 0;

    // Calculate average completion time (in days)
    const completedProjectsWithDates = projects.filter(project =>
      project.status === 'completed' && project.createdAt && project.updatedAt
    );

    let totalDays = 0;
    completedProjectsWithDates.forEach(project => {
      const createdDate = new Date(project.createdAt);
      const completedDate = new Date(project.updatedAt);
      const days = Math.round((completedDate - createdDate) / (1000 * 60 * 60 * 24));
      totalDays += days;
    });

    const averageCompletionTime = completedProjectsWithDates.length > 0
      ? totalDays / completedProjectsWithDates.length
      : 0;

    // Get top categories
    const categoryCounts = {};
    const categorySpending = {};

    projects.forEach(project => {
      if (project.category) {
        categoryCounts[project.category] = (categoryCounts[project.category] || 0) + 1;
        if (project.status === 'completed') {
          categorySpending[project.category] = (categorySpending[project.category] || 0) + project.budget;
        }
      }
    });

    const topCategories = Object.keys(categoryCounts).map(name => ({
      name,
      count: categoryCounts[name],
      spent: categorySpending[name] || 0
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Calculate monthly spending based on date range
    const monthlySpending = [];
    const now = new Date();

    // Determine the number of months to show based on date range
    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                      (endDate.getMonth() - startDate.getMonth()) + 1;
    const numMonths = Math.min(12, Math.max(1, monthDiff));

    // Initialize monthly spending for the selected period
    for (let i = 0; i < numMonths; i++) {
      const targetDate = new Date(endDate);
      targetDate.setMonth(endDate.getMonth() - i);
      const monthName = targetDate.toLocaleString('default', { month: 'short' });
      const year = targetDate.getFullYear();
      monthlySpending.unshift({
        month: `${monthName} ${year !== now.getFullYear() ? year : ''}`.trim(),
        amount: 0,
        year: year,
        monthIndex: targetDate.getMonth()
      });
    }

    // Calculate spending for each month
    projects.forEach(project => {
      if (project.status === 'completed' && project.updatedAt) {
        const completedDate = new Date(project.updatedAt);

        // Find the matching month in our array
        const monthIndex = monthlySpending.findIndex(item =>
          item.year === completedDate.getFullYear() &&
          item.monthIndex === completedDate.getMonth()
        );

        if (monthIndex >= 0) {
          monthlySpending[monthIndex].amount += project.budget;
        }
      }
    });

    // Clean up monthly spending data by removing internal properties
    const cleanMonthlySpending = monthlySpending.map(({ month, amount }) => ({ month, amount }));

    res.status(200).json({
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      totalProjects,
      activeProjects,
      completedProjects,
      cancelledProjects,
      totalSpent,
      averageProjectCost,
      averageCompletionTime,
      topCategories,
      monthlySpending: cleanMonthlySpending
    });
  } catch (error) {
    next(error);
  }
};

// Get freelancer analytics
exports.getFreelancerAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Parse date range from query parameters
    let startDate, endDate;

    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    } else {
      // Default to last 30 days if no date range provided
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Get projects where freelancer is assigned with date filtering
    const projectQuery = {
      assignedFreelancer: freelancer._id,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // Get projects based on query
    const projects = await Project.find(projectQuery);

    // Count projects by status
    const totalProjects = projects.length;
    const activeProjects = projects.filter(project => project.status === 'in_progress').length;
    const completedProjects = projects.filter(project => project.status === 'completed').length;

    // Calculate total earnings from completed projects
    const totalEarnings = projects
      .filter(project => project.status === 'completed')
      .reduce((total, project) => total + project.budget, 0);

    // Calculate pending earnings from in-progress projects
    const pendingEarnings = projects
      .filter(project => project.status === 'in_progress')
      .reduce((total, project) => total + project.budget, 0);

    // Get freelancer's average rating
    const reviews = await Review.find({ reviewee: userId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const reviewCount = reviews.length;

    // Calculate bid success rate
    const bids = await Bid.find({ freelancer: freelancer._id });
    const acceptedBids = bids.filter(bid => bid.status === 'accepted').length;
    const bidSuccessRate = bids.length > 0 ? (acceptedBids / bids.length) * 100 : 0;

    // Calculate average project value
    const averageProjectValue = completedProjects > 0 ? totalEarnings / completedProjects : 0;

    // Get top categories
    const categoryCounts = {};
    const categoryEarnings = {};

    projects.forEach(project => {
      if (project.category) {
        categoryCounts[project.category] = (categoryCounts[project.category] || 0) + 1;
        if (project.status === 'completed') {
          categoryEarnings[project.category] = (categoryEarnings[project.category] || 0) + project.budget;
        }
      }
    });

    const topCategories = Object.keys(categoryCounts).map(name => ({
      name,
      count: categoryCounts[name],
      earnings: categoryEarnings[name] || 0
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Calculate monthly earnings based on date range
    const monthlyEarnings = [];
    const now = new Date();

    // Determine the number of months to show based on date range
    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                      (endDate.getMonth() - startDate.getMonth()) + 1;
    const numMonths = Math.min(12, Math.max(1, monthDiff));

    // Initialize monthly earnings for the selected period
    for (let i = 0; i < numMonths; i++) {
      const targetDate = new Date(endDate);
      targetDate.setMonth(endDate.getMonth() - i);
      const monthName = targetDate.toLocaleString('default', { month: 'short' });
      const year = targetDate.getFullYear();
      monthlyEarnings.unshift({
        month: `${monthName} ${year !== now.getFullYear() ? year : ''}`.trim(),
        amount: 0,
        year: year,
        monthIndex: targetDate.getMonth()
      });
    }

    // Calculate earnings for each month
    projects.forEach(project => {
      if (project.status === 'completed' && project.updatedAt) {
        const completedDate = new Date(project.updatedAt);

        // Find the matching month in our array
        const monthIndex = monthlyEarnings.findIndex(item =>
          item.year === completedDate.getFullYear() &&
          item.monthIndex === completedDate.getMonth()
        );

        if (monthIndex >= 0) {
          monthlyEarnings[monthIndex].amount += project.budget;
        }
      }
    });

    // Get recent reviews
    const recentReviews = await Review.find({ reviewee: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({
        path: 'reviewer',
        select: 'name'
      })
      .populate({
        path: 'project',
        select: 'title'
      });

    // Format recent reviews
    const formattedReviews = recentReviews.map(review => ({
      id: review._id,
      client: review.reviewer ? review.reviewer.name : 'Anonymous',
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt
    }));

    // Clean up monthly earnings data by removing internal properties
    const cleanMonthlyEarnings = monthlyEarnings.map(({ month, amount }) => ({ month, amount }));

    res.status(200).json({
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      totalProjects,
      activeProjects,
      completedProjects,
      totalEarnings,
      pendingEarnings,
      averageRating,
      reviewCount,
      bidSuccessRate,
      averageProjectValue,
      topCategories,
      monthlyEarnings: cleanMonthlyEarnings,
      recentReviews: formattedReviews
    });
  } catch (error) {
    next(error);
  }
};
