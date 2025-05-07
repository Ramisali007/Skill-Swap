const Bid = require('../../models/Bid');
const Project = require('../../models/Project');
const Freelancer = require('../../models/Freelancer');
const Client = require('../../models/Client');
const Notification = require('../../models/Notification');
const User = require('../../models/User');

// Submit a bid
exports.submitBid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, deliveryTime, proposal } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if project is open for bidding
    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Project is not open for bidding' });
    }

    // Find freelancer
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Check if freelancer has already bid on this project
    const existingBid = await Bid.findOne({
      project: project._id,
      freelancer: freelancer._id
    });

    if (existingBid) {
      return res.status(400).json({ message: 'You have already bid on this project' });
    }

    // Create new bid
    const bid = new Bid({
      project: project._id,
      freelancer: freelancer._id,
      amount,
      deliveryTime,
      proposal,
      status: 'pending'
    });

    await bid.save();

    // Add bid to project
    project.bids.push(bid._id);
    await project.save();

    // Add bid to freelancer
    freelancer.bids.push(bid._id);
    await freelancer.save();

    // Notify client
    const client = await Client.findById(project.client).populate('user');

    const notification = new Notification({
      recipient: client.user._id,
      type: 'bid',
      title: 'New Bid Received',
      message: `You have received a new bid on your project: ${project.title}`,
      link: `/projects/${project._id}/bids`,
      relatedId: bid._id,
      relatedModel: 'Bid'
    });

    await notification.save();

    res.status(201).json({
      message: 'Bid submitted successfully',
      bid
    });
  } catch (error) {
    next(error);
  }
};

// Get all bids for a project
exports.getProjectBids = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sort = 'createdAt', order = 'desc' } = req.query;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Determine sort order
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Find bids
    const bids = await Bid.find({ project: project._id })
      .populate({
        path: 'freelancer',
        select: 'user skills averageRating completedProjects',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort(sortOptions);

    res.status(200).json({ bids });
  } catch (error) {
    next(error);
  }
};

// Get bid by ID
exports.getBidById = async (req, res, next) => {
  try {
    const { id, bidId } = req.params;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find bid
    const bid = await Bid.findOne({
      _id: bidId,
      project: project._id
    }).populate({
      path: 'freelancer',
      select: 'user skills averageRating completedProjects',
      populate: {
        path: 'user',
        select: 'name'
      }
    });

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check authorization
    if (req.user.role === 'freelancer') {
      const freelancer = await Freelancer.findOne({ user: req.userId });

      if (!freelancer || !bid.freelancer._id.equals(freelancer._id)) {
        return res.status(403).json({ message: 'You are not authorized to view this bid' });
      }
    } else if (req.user.role === 'client') {
      const client = await Client.findOne({ user: req.userId });

      if (!client || !project.client.equals(client._id)) {
        return res.status(403).json({ message: 'You are not authorized to view this bid' });
      }
    }

    res.status(200).json({ bid });
  } catch (error) {
    next(error);
  }
};

// Update bid
exports.updateBid = async (req, res, next) => {
  try {
    const { id, bidId } = req.params;
    const { amount, deliveryTime, proposal } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if project is still open
    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Project is no longer open for bidding' });
    }

    // Find bid
    const bid = await Bid.findOne({
      _id: bidId,
      project: project._id
    });

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if user is the bid owner
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer || !bid.freelancer.equals(freelancer._id)) {
      return res.status(403).json({ message: 'You are not authorized to update this bid' });
    }

    // Check if bid can be updated
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update a bid that is not pending' });
    }

    // Update bid fields
    if (amount) bid.amount = amount;
    if (deliveryTime) bid.deliveryTime = deliveryTime;
    if (proposal) bid.proposal = proposal;

    await bid.save();

    // Notify client
    const client = await Client.findById(project.client).populate('user');

    const notification = new Notification({
      recipient: client.user._id,
      type: 'bid',
      title: 'Bid Updated',
      message: `A bid on your project "${project.title}" has been updated`,
      link: `/projects/${project._id}/bids/${bid._id}`,
      relatedId: bid._id,
      relatedModel: 'Bid'
    });

    await notification.save();

    res.status(200).json({
      message: 'Bid updated successfully',
      bid
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw bid
exports.withdrawBid = async (req, res, next) => {
  try {
    const { id, bidId } = req.params;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find bid
    const bid = await Bid.findOne({
      _id: bidId,
      project: project._id
    });

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if user is the bid owner
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer || !bid.freelancer.equals(freelancer._id)) {
      return res.status(403).json({ message: 'You are not authorized to withdraw this bid' });
    }

    // Check if bid can be withdrawn
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw a bid that is not pending' });
    }

    // Update bid status
    bid.status = 'withdrawn';
    await bid.save();

    // Remove bid from project
    await Project.updateOne(
      { _id: project._id },
      { $pull: { bids: bid._id } }
    );

    // Notify client
    const client = await Client.findById(project.client).populate('user');

    const notification = new Notification({
      recipient: client.user._id,
      type: 'bid',
      title: 'Bid Withdrawn',
      message: `A bid on your project "${project.title}" has been withdrawn`,
      link: `/projects/${project._id}/bids`,
      relatedId: bid._id,
      relatedModel: 'Bid'
    });

    await notification.save();

    res.status(200).json({ message: 'Bid withdrawn successfully' });
  } catch (error) {
    next(error);
  }
};

// Create counter offer
exports.createCounterOffer = async (req, res, next) => {
  try {
    const { id, bidId } = req.params;
    const { amount, deliveryTime, message } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project owner
    const client = await Client.findOne({ user: req.userId });

    if (!client || !project.client.equals(client._id)) {
      return res.status(403).json({ message: 'You are not authorized to create a counter offer for this project' });
    }

    // Find bid
    const bid = await Bid.findOne({
      _id: bidId,
      project: project._id
    });

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if bid is pending
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot create counter offer for a bid that is not pending' });
    }

    // Create counter offer
    bid.counterOffer = {
      amount,
      deliveryTime,
      message,
      status: 'pending'
    };

    await bid.save();

    // Notify freelancer
    const freelancer = await Freelancer.findById(bid.freelancer).populate('user');

    const notification = new Notification({
      recipient: freelancer.user._id,
      type: 'bid',
      title: 'Counter Offer Received',
      message: `You have received a counter offer for your bid on project: ${project.title}`,
      link: `/projects/${project._id}/bids/${bid._id}`,
      relatedId: bid._id,
      relatedModel: 'Bid'
    });

    await notification.save();

    res.status(200).json({
      message: 'Counter offer created successfully',
      bid
    });
  } catch (error) {
    next(error);
  }
};

// Respond to counter offer
exports.respondToCounterOffer = async (req, res, next) => {
  try {
    const { id, bidId } = req.params;
    const { response } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find bid
    const bid = await Bid.findOne({
      _id: bidId,
      project: project._id
    });

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if user is the bid owner
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer || !bid.freelancer.equals(freelancer._id)) {
      return res.status(403).json({ message: 'You are not authorized to respond to this counter offer' });
    }

    // Check if there is a pending counter offer
    if (!bid.counterOffer || bid.counterOffer.status !== 'pending') {
      return res.status(400).json({ message: 'No pending counter offer found' });
    }

    // Update counter offer status
    if (response === 'accept') {
      bid.counterOffer.status = 'accepted';
      bid.amount = bid.counterOffer.amount;
      bid.deliveryTime = bid.counterOffer.deliveryTime;
    } else if (response === 'reject') {
      bid.counterOffer.status = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid response. Must be "accept" or "reject"' });
    }

    await bid.save();

    // Notify client
    const client = await Client.findById(project.client).populate('user');

    const notification = new Notification({
      recipient: client.user._id,
      type: 'bid',
      title: 'Counter Offer Response',
      message: `Your counter offer for project "${project.title}" has been ${bid.counterOffer.status}`,
      link: `/projects/${project._id}/bids/${bid._id}`,
      relatedId: bid._id,
      relatedModel: 'Bid'
    });

    await notification.save();

    res.status(200).json({
      message: `Counter offer ${bid.counterOffer.status} successfully`,
      bid
    });
  } catch (error) {
    next(error);
  }
};

// Accept a bid
exports.acceptBid = async (req, res, next) => {
  try {
    const { id, bidId } = req.params;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project owner
    const client = await Client.findOne({ user: req.userId });

    if (!client || !project.client.equals(client._id)) {
      return res.status(403).json({ message: 'You are not authorized to accept bids for this project' });
    }

    // Check if project is open
    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Project is not open for bidding' });
    }

    // Find bid
    const bid = await Bid.findOne({
      _id: bidId,
      project: project._id
    }).populate('freelancer');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Check if bid is pending
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot accept a bid that is not pending' });
    }

    // Update bid status
    bid.status = 'accepted';
    await bid.save();

    // Update other bids as rejected
    await Bid.updateMany(
      { project: project._id, _id: { $ne: bidId } },
      { status: 'rejected' }
    );

    // Update project status and assign freelancer
    project.status = 'in_progress';
    project.assignedFreelancer = bid.freelancer._id;
    await project.save();

    // Notify freelancer
    const freelancer = await Freelancer.findById(bid.freelancer._id).populate('user');

    const notification = new Notification({
      recipient: freelancer.user._id,
      type: 'bid',
      title: 'Bid Accepted',
      message: `Your bid on project "${project.title}" has been accepted! You can now start working on the project.`,
      link: `/freelancer/projects/${project._id}`,
      relatedId: bid._id,
      relatedModel: 'Bid'
    });

    await notification.save();

    // Create a notification for the client as well
    const clientNotification = new Notification({
      recipient: client.user._id,
      type: 'project',
      title: 'Project Started',
      message: `You have accepted a bid for your project "${project.title}". The project is now in progress.`,
      link: `/client/projects/${project._id}`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await clientNotification.save();

    res.status(200).json({
      message: 'Bid accepted successfully',
      bid,
      project
    });
  } catch (error) {
    console.error('Error accepting bid:', error);
    next(error);
  }
};

// Get freelancer's bids
exports.getFreelancerBids = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Find freelancer
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Build query
    const query = { freelancer: freelancer._id };

    if (status) {
      query.status = status;
    }

    // Count total documents
    const total = await Bid.countDocuments(query);

    // Find bids with pagination
    const bids = await Bid.find(query)
      .populate({
        path: 'project',
        select: 'title description budget deadline status client',
        populate: {
          path: 'client',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name'
          }
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Log bids to check if counter offers are included
    console.log('Freelancer bids with counter offers:',
      bids.map(bid => ({
        id: bid._id,
        project: bid.project ? bid.project.title : 'Unknown',
        amount: bid.amount,
        status: bid.status,
        counterOffer: bid.counterOffer
      }))
    );

    res.status(200).json({
      bids,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get bid statistics
exports.getBidStatistics = async (req, res, next) => {
  try {
    // Check authorization
    if (req.user.role === 'freelancer') {
      const freelancer = await Freelancer.findOne({ user: req.userId });

      if (!freelancer) {
        return res.status(404).json({ message: 'Freelancer profile not found' });
      }

      // Get freelancer bid statistics
      const totalBids = await Bid.countDocuments({ freelancer: freelancer._id });
      const acceptedBids = await Bid.countDocuments({ freelancer: freelancer._id, status: 'accepted' });
      const pendingBids = await Bid.countDocuments({ freelancer: freelancer._id, status: 'pending' });
      const rejectedBids = await Bid.countDocuments({ freelancer: freelancer._id, status: 'rejected' });
      const withdrawnBids = await Bid.countDocuments({ freelancer: freelancer._id, status: 'withdrawn' });

      // Calculate average bid amount
      const bids = await Bid.find({ freelancer: freelancer._id });
      const totalAmount = bids.reduce((sum, bid) => sum + bid.amount, 0);
      const averageBidAmount = totalAmount / (bids.length || 1);

      // Calculate success rate
      const successRate = (acceptedBids / (totalBids || 1)) * 100;

      res.status(200).json({
        totalBids,
        acceptedBids,
        pendingBids,
        rejectedBids,
        withdrawnBids,
        averageBidAmount,
        successRate
      });
    } else if (req.user.role === 'client') {
      const client = await Client.findOne({ user: req.userId });

      if (!client) {
        return res.status(404).json({ message: 'Client profile not found' });
      }

      // Get projects by client
      const projects = await Project.find({ client: client._id });
      const projectIds = projects.map(project => project._id);

      // Get bid statistics for client's projects
      const totalBids = await Bid.countDocuments({ project: { $in: projectIds } });
      const averageBidsPerProject = totalBids / (projects.length || 1);

      // Calculate average bid amount per project
      const projectBidStats = await Promise.all(
        projects.map(async (project) => {
          const bids = await Bid.find({ project: project._id });
          const totalAmount = bids.reduce((sum, bid) => sum + bid.amount, 0);
          const averageAmount = totalAmount / (bids.length || 1);

          return {
            projectId: project._id,
            title: project.title,
            bidCount: bids.length,
            averageBidAmount: averageAmount
          };
        })
      );

      res.status(200).json({
        totalProjects: projects.length,
        totalBids,
        averageBidsPerProject,
        projectBidStats
      });
    } else if (req.user.role === 'admin') {
      // Get platform-wide bid statistics
      const totalBids = await Bid.countDocuments();
      const acceptedBids = await Bid.countDocuments({ status: 'accepted' });
      const pendingBids = await Bid.countDocuments({ status: 'pending' });

      // Calculate average bid amount
      const bids = await Bid.find();
      const totalAmount = bids.reduce((sum, bid) => sum + bid.amount, 0);
      const averageBidAmount = totalAmount / (bids.length || 1);

      // Get top categories by bid count
      const projects = await Project.find();
      const categoryBidCounts = {};

      for (const project of projects) {
        const bidCount = await Bid.countDocuments({ project: project._id });

        if (!categoryBidCounts[project.category]) {
          categoryBidCounts[project.category] = 0;
        }

        categoryBidCounts[project.category] += bidCount;
      }

      const topCategories = Object.entries(categoryBidCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      res.status(200).json({
        totalBids,
        acceptedBids,
        pendingBids,
        averageBidAmount,
        topCategories
      });
    }
  } catch (error) {
    next(error);
  }
};
