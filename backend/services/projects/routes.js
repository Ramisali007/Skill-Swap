const express = require('express');
const router = express.Router();
const projectController = require('./controller');
const { verifyToken, isClient, isFreelancer, isVerified } = require('../../middlewares/auth');
const { upload, setUploadType } = require('../../middlewares/upload');

// Get all projects (public)
router.get('/', projectController.getAllProjects);

// Get project by ID (public)
router.get('/:id', projectController.getProjectById);

// Client routes (protected)
router.post('/', verifyToken, isVerified, isClient, projectController.createProject);
router.put('/:id', verifyToken, isClient, projectController.updateProject);
router.delete('/:id', verifyToken, isClient, projectController.deleteProject);

// Project attachments
router.post(
  '/:id/attachments',
  verifyToken,
  isVerified,
  setUploadType('project'),
  upload.array('files', 5),
  projectController.uploadAttachments
);

// Project milestones
router.post('/:id/milestones', verifyToken, isClient, projectController.addMilestone);
router.put('/:id/milestones/:milestoneId', verifyToken, projectController.updateMilestone);

// Project assignment
router.post('/:id/assign', verifyToken, isClient, projectController.assignFreelancer);

// Project status
router.put('/:id/status', verifyToken, projectController.updateProjectStatus);

// Project progress
router.put('/:id/progress', verifyToken, isFreelancer, projectController.updateProgress);

// Project time tracking
router.put('/:id/time-tracking', verifyToken, isFreelancer, projectController.updateTimeTracking);

// Project milestones
router.post('/:id/milestones', verifyToken, isFreelancer, projectController.addMilestone);
router.put('/:id/milestones/:milestoneId', verifyToken, isFreelancer, projectController.updateMilestone);

// Work submission
router.post(
  '/:id/submissions',
  verifyToken,
  isFreelancer,
  setUploadType('submission'),
  upload.array('files', 5),
  projectController.submitWork
);

// Get client projects
router.get('/client/my-projects', verifyToken, isClient, projectController.getClientProjects);

// Get freelancer projects
router.get('/freelancer/my-projects', verifyToken, isFreelancer, projectController.getFreelancerProjects);

// Search and filter projects
router.get('/search/filter', projectController.searchProjects);

module.exports = router;
