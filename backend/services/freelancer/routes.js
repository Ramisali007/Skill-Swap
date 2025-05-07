const express = require('express');
const router = express.Router();
const freelancerController = require('./controller');
const { verifyToken, isFreelancer, isVerified } = require('../../middlewares/auth');
const { upload, setUploadType } = require('../../middlewares/upload');

// Middleware to check freelancer role
router.use(verifyToken, isFreelancer);

// Get freelancer profile
router.get('/profile', freelancerController.getFreelancerProfile);

// Update freelancer profile
router.put('/profile', freelancerController.updateFreelancerProfile);

// Upload profile image
router.post(
  '/profile/image',
  setUploadType('profile'),
  upload.single('image'),
  freelancerController.uploadProfileImage
);

// Skills management
router.get('/skills', freelancerController.getSkills);
router.post('/skills', freelancerController.addSkill);
router.put('/skills/:id', freelancerController.updateSkill);
router.delete('/skills/:id', freelancerController.deleteSkill);

// Portfolio management
router.get('/portfolio', freelancerController.getPortfolio);
router.post('/portfolio', freelancerController.addPortfolioItem);
router.put('/portfolio/:id', freelancerController.updatePortfolioItem);
router.delete('/portfolio/:id', freelancerController.deletePortfolioItem);
router.post(
  '/portfolio/:id/image',
  setUploadType('portfolio'),
  upload.single('image'),
  freelancerController.uploadPortfolioImage
);

// Education management
router.get('/education', freelancerController.getEducation);
router.post('/education', freelancerController.addEducation);
router.put('/education/:id', freelancerController.updateEducation);
router.delete('/education/:id', freelancerController.deleteEducation);

// Work experience management
router.get('/experience', freelancerController.getWorkExperience);
router.post('/experience', freelancerController.addWorkExperience);
router.put('/experience/:id', freelancerController.updateWorkExperience);
router.delete('/experience/:id', freelancerController.deleteWorkExperience);

// Languages management
router.get('/languages', freelancerController.getLanguages);
router.post('/languages', freelancerController.addLanguage);
router.put('/languages/:id', freelancerController.updateLanguage);
router.delete('/languages/:id', freelancerController.deleteLanguage);

// Certifications management
router.get('/certifications', freelancerController.getCertifications);
router.post('/certifications', freelancerController.addCertification);
router.put('/certifications/:id', freelancerController.updateCertification);
router.delete('/certifications/:id', freelancerController.deleteCertification);

// Get profile completeness
router.get('/profile/completeness', freelancerController.getProfileCompleteness);

module.exports = router;
