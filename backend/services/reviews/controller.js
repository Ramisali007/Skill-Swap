const Review = require('../../models/Review');
const Project = require('../../models/Project');
const User = require('../../models/User');
const Freelancer = require('../../models/Freelancer');
const Client = require('../../models/Client');
const Notification = require('../../models/Notification');

// Create a review
exports.createReview = async (req, res, next) => {
  try {
    const { projectId, revieweeId, rating, comment } = req.body;
    
    // Find project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if project is completed
    if (project.status !== 'completed') {
      return res.status(400).json({ message: 'Cannot review a project that is not completed' });
    }
    
    // Find reviewee
    const reviewee = await User.findById(revieweeId);
    
    if (!reviewee) {
      return res.status(404).json({ message: 'Reviewee not found' });
    }
    
    // Check if user is authorized to review
    const reviewer = await User.findById(req.userId);
    
    if (reviewer.role === 'client') {
      const client = await Client.findOne({ user: req.userId });
      
      // Client can only review the freelancer assigned to their project
      if (!client || !project.client.equals(client._id)) {
        return res.status(403).json({ message: 'You are not authorized to review this project' });
      }
      
      // Check if reviewee is the freelancer
      const freelancer = await Freelancer.findById(project.assignedFreelancer);
      
      if (!freelancer || !freelancer.user.equals(revieweeId)) {
        return res.status(403).json({ message: 'You can only review the freelancer assigned to this project' });
      }
    } else if (reviewer.role === 'freelancer') {
      const freelancer = await Freelancer.findOne({ user: req.userId });
      
      // Freelancer can only review the client of their project
      if (!freelancer || !project.assignedFreelancer.equals(freelancer._id)) {
        return res.status(403).json({ message: 'You are not authorized to review this project' });
      }
      
      // Check if reviewee is the client
      const client = await Client.findById(project.client);
      
      if (!client || !client.user.equals(revieweeId)) {
        return res.status(403).json({ message: 'You can only review the client of this project' });
      }
    } else {
      return res.status(403).json({ message: 'Only clients and freelancers can create reviews' });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      project: projectId,
      reviewer: req.userId,
      reviewee: revieweeId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this user for this project' });
    }
    
    // Create new review
    const review = new Review({
      project: projectId,
      reviewer: req.userId,
      reviewee: revieweeId,
      rating,
      comment
    });
    
    await review.save();
    
    // Update freelancer's average rating if reviewee is a freelancer
    if (reviewee.role === 'freelancer') {
      const freelancer = await Freelancer.findOne({ user: revieweeId });
      
      if (freelancer) {
        // Get all reviews for this freelancer
        const reviews = await Review.find({ reviewee: revieweeId });
        
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        // Update freelancer's average rating
        freelancer.averageRating = averageRating;
        await freelancer.save();
      }
    }
    
    // Create notification for reviewee
    const notification = new Notification({
      recipient: revieweeId,
      type: 'review',
      title: 'New Review Received',
      message: `You have received a new review for project: ${project.title}`,
      link: `/reviews/${review._id}`,
      relatedId: review._id,
      relatedModel: 'Review'
    });
    
    await notification.save();
    
    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews for a user
exports.getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Determine sort order
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Count total reviews
    const total = await Review.countDocuments({ reviewee: userId });
    
    // Find reviews with pagination
    const reviews = await Review.find({ reviewee: userId })
      .populate({
        path: 'reviewer',
        select: 'name'
      })
      .populate({
        path: 'project',
        select: 'title'
      })
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.status(200).json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews for a project
exports.getProjectReviews = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Find project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Find reviews
    const reviews = await Review.find({ project: projectId })
      .populate({
        path: 'reviewer',
        select: 'name'
      })
      .populate({
        path: 'reviewee',
        select: 'name'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};

// Get review by ID
exports.getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find review
    const review = await Review.findById(id)
      .populate({
        path: 'reviewer',
        select: 'name'
      })
      .populate({
        path: 'reviewee',
        select: 'name'
      })
      .populate({
        path: 'project',
        select: 'title'
      });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.status(200).json({ review });
  } catch (error) {
    next(error);
  }
};

// Update review
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the reviewer
    if (review.reviewer.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this review' });
    }
    
    // Check if review was created within the last 7 days (can only update recent reviews)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (review.createdAt < sevenDaysAgo) {
      return res.status(400).json({ message: 'Reviews can only be updated within 7 days of creation' });
    }
    
    // Update review fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    
    await review.save();
    
    // Update freelancer's average rating if reviewee is a freelancer
    const reviewee = await User.findById(review.reviewee);
    
    if (reviewee && reviewee.role === 'freelancer') {
      const freelancer = await Freelancer.findOne({ user: review.reviewee });
      
      if (freelancer) {
        // Get all reviews for this freelancer
        const reviews = await Review.find({ reviewee: review.reviewee });
        
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        // Update freelancer's average rating
        freelancer.averageRating = averageRating;
        await freelancer.save();
      }
    }
    
    // Create notification for reviewee
    const notification = new Notification({
      recipient: review.reviewee,
      type: 'review',
      title: 'Review Updated',
      message: 'A review about you has been updated',
      link: `/reviews/${review._id}`,
      relatedId: review._id,
      relatedModel: 'Review'
    });
    
    await notification.save();
    
    res.status(200).json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

// Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the reviewer
    if (review.reviewer.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }
    
    // Check if review was created within the last 7 days (can only delete recent reviews)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (review.createdAt < sevenDaysAgo) {
      return res.status(400).json({ message: 'Reviews can only be deleted within 7 days of creation' });
    }
    
    // Delete review
    await Review.deleteOne({ _id: id });
    
    // Update freelancer's average rating if reviewee is a freelancer
    const reviewee = await User.findById(review.reviewee);
    
    if (reviewee && reviewee.role === 'freelancer') {
      const freelancer = await Freelancer.findOne({ user: review.reviewee });
      
      if (freelancer) {
        // Get all reviews for this freelancer
        const reviews = await Review.find({ reviewee: review.reviewee });
        
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        // Update freelancer's average rating
        freelancer.averageRating = averageRating;
        await freelancer.save();
      }
    }
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Add response to review
exports.addResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the reviewee
    if (review.reviewee.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to respond to this review' });
    }
    
    // Check if response already exists
    if (review.response && review.response.comment) {
      return res.status(400).json({ message: 'You have already responded to this review' });
    }
    
    // Add response
    review.response = {
      comment,
      createdAt: Date.now()
    };
    
    await review.save();
    
    // Create notification for reviewer
    const notification = new Notification({
      recipient: review.reviewer,
      type: 'review',
      title: 'Review Response',
      message: 'Someone has responded to your review',
      link: `/reviews/${review._id}`,
      relatedId: review._id,
      relatedModel: 'Review'
    });
    
    await notification.save();
    
    res.status(200).json({
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

// Get review statistics for a user
exports.getReviewStatistics = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all reviews for this user
    const reviews = await Review.find({ reviewee: userId });
    
    // Calculate statistics
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    // Count reviews by rating
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    reviews.forEach(review => {
      ratingCounts[review.rating]++;
    });
    
    // Calculate percentage for each rating
    const ratingPercentages = {};
    for (const rating in ratingCounts) {
      ratingPercentages[rating] = totalReviews > 0 ? (ratingCounts[rating] / totalReviews) * 100 : 0;
    }
    
    res.status(200).json({
      totalReviews,
      averageRating,
      ratingCounts,
      ratingPercentages
    });
  } catch (error) {
    next(error);
  }
};
