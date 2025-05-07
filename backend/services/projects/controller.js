const Project = require('../../models/Project');
const Client = require('../../models/Client');
const Freelancer = require('../../models/Freelancer');
const Bid = require('../../models/Bid');
const Notification = require('../../models/Notification');
const User = require('../../models/User');

// Get all projects
exports.getAllProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'open' } = req.query;

    // Build query
    const query = { status };

    // Count total documents
    const total = await Project.countDocuments(query);

    // Find projects with pagination
    const projects = await Project.find(query)
      .populate('client', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

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

    const project = await Project.findById(id)
      .populate('client', 'name')
      .populate('assignedFreelancer')
      .populate({
        path: 'bids',
        populate: {
          path: 'freelancer',
          select: 'user skills averageRating',
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

// Create a new project
exports.createProject = async (req, res, next) => {
  try {
    const { title, description, category, skills, budget, deadline } = req.body;

    // Find client
    const client = await Client.findOne({ user: req.userId });

    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    // Create new project
    const project = new Project({
      title,
      description,
      client: client._id,
      category,
      skills,
      budget,
      deadline,
      status: 'open'
    });

    await project.save();

    // Update client's projects array and increment projectsPosted counter
    client.projects.push(project._id);
    client.projectsPosted = (client.projectsPosted || 0) + 1;
    await client.save();

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// Update project
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, skills, budget, deadline } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project owner
    const client = await Client.findOne({ user: req.userId });

    if (!client || !project.client.equals(client._id)) {
      return res.status(403).json({ message: 'You are not authorized to update this project' });
    }

    // Check if project can be updated
    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Cannot update a project that is not open' });
    }

    // Update project fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (skills) project.skills = skills;
    if (budget) project.budget = budget;
    if (deadline) project.deadline = deadline;

    await project.save();

    res.status(200).json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project owner
    const client = await Client.findOne({ user: req.userId });

    if (!client || !project.client.equals(client._id)) {
      return res.status(403).json({ message: 'You are not authorized to delete this project' });
    }

    // Check if project can be deleted
    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Cannot delete a project that is not open' });
    }

    // Remove project from client's projects array
    await Client.updateOne(
      { _id: client._id },
      { $pull: { projects: project._id } }
    );

    // Delete all bids associated with the project
    await Bid.deleteMany({ project: project._id });

    // Delete the project
    await Project.deleteOne({ _id: project._id });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Upload project attachments
exports.uploadAttachments = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is authorized
    const client = await Client.findOne({ user: req.userId });

    if (!client || !project.client.equals(client._id)) {
      return res.status(403).json({ message: 'You are not authorized to upload attachments to this project' });
    }

    // Process uploaded files
    const attachments = req.files.map(file => ({
      name: file.originalname,
      url: file.path,
      uploadedAt: Date.now()
    }));

    // Add attachments to project
    project.attachments.push(...attachments);
    await project.save();

    res.status(200).json({
      message: 'Attachments uploaded successfully',
      attachments: project.attachments
    });
  } catch (error) {
    next(error);
  }
};

// Add milestone to project
exports.addMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, amount } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project owner
    const client = await Client.findOne({ user: req.userId });

    if (!client || !project.client.equals(client._id)) {
      return res.status(403).json({ message: 'You are not authorized to add milestones to this project' });
    }

    // Create new milestone
    const milestone = {
      title,
      description,
      dueDate,
      amount,
      status: 'pending'
    };

    // Add milestone to project
    project.milestones.push(milestone);
    await project.save();

    // Notify assigned freelancer if exists
    if (project.assignedFreelancer) {
      const freelancer = await Freelancer.findById(project.assignedFreelancer).populate('user');

      if (freelancer && freelancer.user) {
        const notification = new Notification({
          recipient: freelancer.user._id,
          type: 'project',
          title: 'New Milestone Added',
          message: `A new milestone has been added to project: ${project.title}`,
          link: `/projects/${project._id}`,
          relatedId: project._id,
          relatedModel: 'Project'
        });

        await notification.save();
      }
    }

    res.status(201).json({
      message: 'Milestone added successfully',
      milestone: project.milestones[project.milestones.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// Update milestone
exports.updateMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const { status, completedAt } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find milestone
    const milestone = project.milestones.id(milestoneId);

    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Check authorization based on role and action
    if (req.user.role === 'client') {
      const client = await Client.findOne({ user: req.userId });

      if (!client || !project.client.equals(client._id)) {
        return res.status(403).json({ message: 'You are not authorized to update this milestone' });
      }

      // Client can only approve completed milestones
      if (status === 'approved' && milestone.status === 'completed') {
        milestone.status = status;
        milestone.approvedAt = Date.now();
      } else {
        return res.status(400).json({ message: 'Clients can only approve completed milestones' });
      }
    } else if (req.user.role === 'freelancer') {
      const freelancer = await Freelancer.findOne({ user: req.userId });

      if (!freelancer || !project.assignedFreelancer.equals(freelancer._id)) {
        return res.status(403).json({ message: 'You are not authorized to update this milestone' });
      }

      // Freelancer can only mark milestones as in_progress or completed
      if (['in_progress', 'completed'].includes(status) && milestone.status !== 'approved') {
        milestone.status = status;

        if (status === 'completed') {
          milestone.completedAt = completedAt || Date.now();
        }
      } else {
        return res.status(400).json({ message: 'Freelancers can only mark milestones as in progress or completed' });
      }
    }

    await project.save();

    // Update project progress
    const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
    const totalMilestones = project.milestones.length;

    if (totalMilestones > 0) {
      project.progress = Math.round((completedMilestones / totalMilestones) * 100);
      await project.save();
    }

    // Create notification
    let notificationRecipient;
    let notificationMessage;

    if (req.user.role === 'client') {
      const freelancer = await Freelancer.findById(project.assignedFreelancer).populate('user');
      notificationRecipient = freelancer.user._id;
      notificationMessage = `Milestone "${milestone.title}" has been approved in project: ${project.title}`;
    } else {
      const client = await Client.findById(project.client).populate('user');
      notificationRecipient = client.user._id;
      notificationMessage = `Milestone "${milestone.title}" has been marked as ${status} in project: ${project.title}`;
    }

    const notification = new Notification({
      recipient: notificationRecipient,
      type: 'project',
      title: 'Milestone Update',
      message: notificationMessage,
      link: `/projects/${project._id}`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await notification.save();

    res.status(200).json({
      message: 'Milestone updated successfully',
      milestone
    });
  } catch (error) {
    next(error);
  }
};

// Assign freelancer to project
exports.assignFreelancer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { freelancerId, bidId } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project owner
    const client = await Client.findOne({ user: req.userId });

    if (!client || !project.client.equals(client._id)) {
      return res.status(403).json({ message: 'You are not authorized to assign freelancers to this project' });
    }

    // Check if project is open
    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Cannot assign freelancer to a project that is not open' });
    }

    // Find freelancer
    const freelancer = await Freelancer.findById(freelancerId);

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Find bid
    const bid = await Bid.findById(bidId);

    if (!bid || !bid.project.equals(project._id) || !bid.freelancer.equals(freelancer._id)) {
      return res.status(404).json({ message: 'Bid not found or does not match project and freelancer' });
    }

    // Update bid status
    bid.status = 'accepted';
    await bid.save();

    // Update other bids as rejected
    await Bid.updateMany(
      { project: project._id, _id: { $ne: bidId } },
      { status: 'rejected' }
    );

    // Assign freelancer to project
    project.assignedFreelancer = freelancer._id;
    project.status = 'in_progress';
    await project.save();

    // Create notification for freelancer
    const freelancerUser = await User.findById(freelancer.user);

    const notification = new Notification({
      recipient: freelancerUser._id,
      type: 'project',
      title: 'Project Assigned',
      message: `You have been assigned to the project: ${project.title}`,
      link: `/projects/${project._id}`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await notification.save();

    res.status(200).json({
      message: 'Freelancer assigned successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// Update project status
exports.updateProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization based on role and action
    if (req.user.role === 'client') {
      const client = await Client.findOne({ user: req.userId });

      if (!client || !project.client.equals(client._id)) {
        return res.status(403).json({ message: 'You are not authorized to update this project status' });
      }

      // Client can cancel an open project or mark a project as completed
      if ((status === 'cancelled' && project.status === 'open') ||
          (status === 'completed' && project.status === 'in_progress')) {
        project.status = status;
      } else {
        return res.status(400).json({ message: 'Invalid status transition for client' });
      }
    } else if (req.user.role === 'freelancer') {
      const freelancer = await Freelancer.findOne({ user: req.userId });

      if (!freelancer || !project.assignedFreelancer || !project.assignedFreelancer.equals(freelancer._id)) {
        return res.status(403).json({ message: 'You are not authorized to update this project status' });
      }

      // Freelancer can only mark a project as completed
      if (status === 'completed' && project.status === 'in_progress') {
        project.status = status;
      } else {
        return res.status(400).json({ message: 'Invalid status transition for freelancer' });
      }
    }

    await project.save();

    // Create notification
    let notificationRecipient;
    let notificationMessage;

    if (req.user.role === 'client') {
      if (project.assignedFreelancer) {
        const freelancer = await Freelancer.findById(project.assignedFreelancer).populate('user');
        notificationRecipient = freelancer.user._id;
        notificationMessage = `Project "${project.title}" has been marked as ${status} by the client`;
      }
    } else {
      const client = await Client.findById(project.client).populate('user');
      notificationRecipient = client.user._id;
      notificationMessage = `Project "${project.title}" has been marked as ${status} by the freelancer`;
    }

    if (notificationRecipient) {
      const notification = new Notification({
        recipient: notificationRecipient,
        type: 'project',
        title: 'Project Status Update',
        message: notificationMessage,
        link: `/projects/${project._id}`,
        relatedId: project._id,
        relatedModel: 'Project'
      });

      await notification.save();
    }

    // Emit dashboard updates for both client and freelancer
    if (req.app.get('io')) {
      // Get client user ID
      const clientData = await Client.findById(project.client).populate('user');
      if (clientData && clientData.user) {
        req.app.get('io').to(`dashboard_${clientData.user._id}`).emit('dashboard_data_update', {
          userId: clientData.user._id,
          type: 'client_dashboard',
          action: 'project_status_update',
          status: status
        });
      }

      // Get freelancer user ID if assigned
      if (project.assignedFreelancer) {
        const freelancerData = await Freelancer.findById(project.assignedFreelancer).populate('user');
        if (freelancerData && freelancerData.user) {
          req.app.get('io').to(`dashboard_${freelancerData.user._id}`).emit('dashboard_data_update', {
            userId: freelancerData.user._id,
            type: 'freelancer_dashboard',
            action: 'project_status_update',
            status: status
          });
        }
      }
    }

    res.status(200).json({
      message: 'Project status updated successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// Update project progress
exports.updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the assigned freelancer
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer || !project.assignedFreelancer || !project.assignedFreelancer.equals(freelancer._id)) {
      return res.status(403).json({ message: 'You are not authorized to update this project progress' });
    }

    // Check if project is in progress
    if (project.status !== 'in_progress') {
      return res.status(400).json({ message: 'Cannot update progress for a project that is not in progress' });
    }

    // Update progress
    project.progress = Math.min(Math.max(0, progress), 100); // Ensure progress is between 0 and 100
    await project.save();

    // Notify client
    const client = await Client.findById(project.client).populate('user');

    const notification = new Notification({
      recipient: client.user._id,
      type: 'project',
      title: 'Project Progress Update',
      message: `Project "${project.title}" progress has been updated to ${project.progress}%`,
      link: `/projects/${project._id}`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await notification.save();

    res.status(200).json({
      message: 'Project progress updated successfully',
      progress: project.progress
    });
  } catch (error) {
    next(error);
  }
};

// Update project time tracking
exports.updateTimeTracking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timeTracked } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the assigned freelancer
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer || !project.assignedFreelancer || !project.assignedFreelancer.equals(freelancer._id)) {
      return res.status(403).json({ message: 'You are not authorized to update time tracking for this project' });
    }

    // Check if project is in progress or completed
    if (project.status !== 'in_progress' && project.status !== 'completed') {
      return res.status(400).json({ message: 'Cannot update time tracking for a project that is not in progress or completed' });
    }

    // Update time tracked
    project.timeTracked = Math.max(0, timeTracked); // Ensure time tracked is not negative
    await project.save();

    // Format time for notification
    const hours = Math.floor(timeTracked / 3600);
    const minutes = Math.floor((timeTracked % 3600) / 60);
    const formattedTime = `${hours}h ${minutes}m`;

    // Notify client
    const client = await Client.findById(project.client).populate('user');

    const notification = new Notification({
      recipient: client.user._id,
      type: 'project',
      title: 'Project Time Tracking Update',
      message: `Time tracked for project "${project.title}" has been updated to ${formattedTime}`,
      link: `/projects/${project._id}`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await notification.save();

    res.status(200).json({
      message: 'Project time tracking updated successfully',
      timeTracked: project.timeTracked
    });
  } catch (error) {
    next(error);
  }
};

// Add milestone to project
exports.addMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, amount } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the assigned freelancer
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer || !project.assignedFreelancer || !project.assignedFreelancer.equals(freelancer._id)) {
      return res.status(403).json({ message: 'You are not authorized to add milestones to this project' });
    }

    // Check if project is in progress
    if (project.status !== 'in_progress') {
      return res.status(400).json({ message: 'Cannot add milestones to a project that is not in progress' });
    }

    // Create new milestone
    const newMilestone = {
      title,
      description,
      dueDate,
      amount: parseFloat(amount),
      status: 'pending'
    };

    // Add milestone to project
    project.milestones.push(newMilestone);
    await project.save();

    // Get the newly added milestone
    const milestone = project.milestones[project.milestones.length - 1];

    // Notify client
    const client = await Client.findById(project.client).populate('user');

    const notification = new Notification({
      recipient: client.user._id,
      type: 'project',
      title: 'New Project Milestone',
      message: `A new milestone "${title}" has been added to project "${project.title}"`,
      link: `/projects/${project._id}`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await notification.save();

    res.status(201).json({
      message: 'Milestone added successfully',
      milestone
    });
  } catch (error) {
    next(error);
  }
};

// Update milestone status
exports.updateMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const { status } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the assigned freelancer
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer || !project.assignedFreelancer || !project.assignedFreelancer.equals(freelancer._id)) {
      return res.status(403).json({ message: 'You are not authorized to update milestones for this project' });
    }

    // Check if project is in progress
    if (project.status !== 'in_progress') {
      return res.status(400).json({ message: 'Cannot update milestones for a project that is not in progress' });
    }

    // Find milestone
    const milestone = project.milestones.id(milestoneId);

    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Update milestone status
    milestone.status = status;

    // If milestone is completed, set completedAt date
    if (status === 'completed') {
      milestone.completedAt = new Date();
    }

    await project.save();

    // Notify client
    const client = await Client.findById(project.client).populate('user');

    const notification = new Notification({
      recipient: client.user._id,
      type: 'project',
      title: 'Milestone Status Update',
      message: `Milestone "${milestone.title}" for project "${project.title}" has been marked as ${status}`,
      link: `/projects/${project._id}`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await notification.save();

    // Check if all milestones are completed
    const allMilestonesCompleted = project.milestones.every(m => m.status === 'completed');

    // If all milestones are completed, update project progress to 100%
    if (allMilestonesCompleted) {
      project.progress = 100;
      await project.save();
    }

    res.status(200).json({
      message: 'Milestone updated successfully',
      milestone
    });
  } catch (error) {
    next(error);
  }
};

// Submit work for a project
exports.submitWork = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    // Find project
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the assigned freelancer
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer || !project.assignedFreelancer || !project.assignedFreelancer.equals(freelancer._id)) {
      return res.status(403).json({ message: 'You are not authorized to submit work for this project' });
    }

    // Check if project is in progress
    if (project.status !== 'in_progress') {
      return res.status(400).json({ message: 'Cannot submit work for a project that is not in progress' });
    }

    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      name: file.originalname,
      url: file.path,
      uploadedAt: Date.now()
    })) : [];

    // Create submission
    const submission = {
      description,
      attachments,
      submittedBy: freelancer._id,
      submittedAt: Date.now(),
      status: 'pending'
    };

    // Add submission to project
    if (!project.submissions) {
      project.submissions = [];
    }

    project.submissions.push(submission);

    // Update project progress to 100% when work is submitted
    project.progress = 100;

    // Change project status to completed when work is submitted
    project.status = 'completed';

    await project.save();

    // Notify client
    const client = await Client.findById(project.client).populate('user');

    const notification = new Notification({
      recipient: client.user._id,
      type: 'project',
      title: 'Project Completed',
      message: `Freelancer has completed and submitted work for your project: ${project.title}. The project status has been updated to completed.`,
      link: `/client/projects/${project._id}`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await notification.save();

    // Get the newly created submission
    const newSubmission = project.submissions[project.submissions.length - 1];

    // Emit socket event for real-time updates
    if (req.app.get('io')) {
      // Emit to project room
      req.app.get('io').to(id).emit('work_submission', {
        projectId: id,
        submissionId: newSubmission._id,
        type: 'new_submission',
        projectStatus: 'completed'
      });

      // Emit to client dashboard
      const clientUser = await User.findById(client.user);
      if (clientUser) {
        req.app.get('io').to(`dashboard_${clientUser._id}`).emit('dashboard_data_update', {
          userId: clientUser._id,
          type: 'client_dashboard',
          action: 'work_submission',
          projectStatus: 'completed',
          projectId: id
        });

        // Also emit to freelancer dashboard
        const freelancerUser = await User.findById(freelancer.user);
        if (freelancerUser) {
          req.app.get('io').to(`dashboard_${freelancerUser._id}`).emit('dashboard_data_update', {
            userId: freelancerUser._id,
            type: 'freelancer_dashboard',
            action: 'work_submission',
            projectStatus: 'completed',
            projectId: id
          });
        }
      }
    }

    res.status(201).json({
      message: 'Work submitted successfully',
      submission: newSubmission
    });
  } catch (error) {
    console.error('Error submitting work:', error);
    next(error);
  }
};

// Get client projects
exports.getClientProjects = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Find client
    const client = await Client.findOne({ user: req.userId });

    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    // Build query
    const query = { client: client._id };

    if (status) {
      query.status = status;
    }

    // Count total documents
    const total = await Project.countDocuments(query);

    // Find projects with pagination
    const projects = await Project.find(query)
      .populate('assignedFreelancer')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

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

// Get freelancer projects
exports.getFreelancerProjects = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Find freelancer
    const freelancer = await Freelancer.findOne({ user: req.userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Build query
    const query = { assignedFreelancer: freelancer._id };

    if (status) {
      query.status = status;
    }

    // Count total documents
    const total = await Project.countDocuments(query);

    // Find projects with pagination
    const projects = await Project.find(query)
      .populate('client', 'user')
      .populate({
        path: 'client',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

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

// Search and filter projects
exports.searchProjects = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      minBudget,
      maxBudget,
      skills,
      status = 'open',
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { status };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = minBudget;
      if (maxBudget) query.budget.$lte = maxBudget;
    }

    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.skills = { $in: skillsArray };
    }

    // Count total documents
    const total = await Project.countDocuments(query);

    // Determine sort order
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Find projects with pagination
    const projects = await Project.find(query)
      .populate({
        path: 'client',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

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
