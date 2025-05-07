const User = require('../../models/User');
const Freelancer = require('../../models/Freelancer');
const fs = require('fs');
const path = require('path');

// Get freelancer profile
exports.getFreelancerProfile = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Find user
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Combine user and freelancer data
    const profileData = {
      ...user.toObject(),
      ...freelancer.toObject(),
      userId: user._id,
      freelancerId: freelancer._id
    };

    res.status(200).json({ profile: profileData });
  } catch (error) {
    next(error);
  }
};

// Update freelancer profile
exports.updateFreelancerProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const {
      name,
      phone,
      address,
      socialLinks,
      title,
      bio,
      hourlyRate,
      availability,
      categories,
      paymentDetails
    } = req.body;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Update user data
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (socialLinks) user.socialLinks = socialLinks;

    await user.save();

    // Update freelancer data
    if (title) freelancer.title = title;
    if (bio) freelancer.bio = bio;
    if (hourlyRate) freelancer.hourlyRate = hourlyRate;
    if (availability) freelancer.availability = availability;
    if (categories) freelancer.categories = categories;
    if (paymentDetails) freelancer.paymentDetails = paymentDetails;

    await freelancer.save();

    // Calculate profile completeness
    const completeness = calculateProfileCompleteness(user, freelancer);

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: {
        ...user.toObject(),
        ...freelancer.toObject(),
        userId: user._id,
        freelancerId: freelancer._id
      },
      completeness
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile image if exists
    if (user.profileImage && user.profileImage !== '') {
      const oldImagePath = path.join(__dirname, '../../../uploads/profile', path.basename(user.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update profile image
    user.profileImage = `/uploads/profile/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    next(error);
  }
};

// Get skills
exports.getSkills = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    res.status(200).json({ skills: freelancer.skills });
  } catch (error) {
    next(error);
  }
};

// Add skill
exports.addSkill = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, level, yearsOfExperience } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Check if skill already exists
    const skillExists = freelancer.skills.some(skill => skill.name.toLowerCase() === name.toLowerCase());

    if (skillExists) {
      return res.status(400).json({ message: 'Skill already exists' });
    }

    // Add new skill
    const newSkill = {
      name,
      level: level || 'Intermediate',
      yearsOfExperience: yearsOfExperience || 0
    };

    freelancer.skills.push(newSkill);
    await freelancer.save();

    res.status(201).json({
      message: 'Skill added successfully',
      skill: freelancer.skills[freelancer.skills.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// Update skill
exports.updateSkill = async (req, res, next) => {
  try {
    const userId = req.userId;
    const skillId = req.params.id;
    const { name, level, yearsOfExperience } = req.body;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find skill
    const skillIndex = freelancer.skills.findIndex(skill => skill._id.toString() === skillId);

    if (skillIndex === -1) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Update skill
    if (name) freelancer.skills[skillIndex].name = name;
    if (level) freelancer.skills[skillIndex].level = level;
    if (yearsOfExperience !== undefined) freelancer.skills[skillIndex].yearsOfExperience = yearsOfExperience;

    await freelancer.save();

    res.status(200).json({
      message: 'Skill updated successfully',
      skill: freelancer.skills[skillIndex]
    });
  } catch (error) {
    next(error);
  }
};

// Delete skill
exports.deleteSkill = async (req, res, next) => {
  try {
    const userId = req.userId;
    const skillId = req.params.id;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find skill
    const skillIndex = freelancer.skills.findIndex(skill => skill._id.toString() === skillId);

    if (skillIndex === -1) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Remove skill
    freelancer.skills.splice(skillIndex, 1);
    await freelancer.save();

    res.status(200).json({
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get portfolio
exports.getPortfolio = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    res.status(200).json({ portfolio: freelancer.portfolio });
  } catch (error) {
    next(error);
  }
};

// Add portfolio item
exports.addPortfolioItem = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { title, description, imageUrl, projectUrl, technologies, completionDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Add new portfolio item
    const newPortfolioItem = {
      title,
      description,
      imageUrl: imageUrl || '',
      projectUrl: projectUrl || '',
      technologies: technologies || [],
      completionDate: completionDate || null
    };

    freelancer.portfolio.push(newPortfolioItem);
    await freelancer.save();

    res.status(201).json({
      message: 'Portfolio item added successfully',
      portfolioItem: freelancer.portfolio[freelancer.portfolio.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// Update portfolio item
exports.updatePortfolioItem = async (req, res, next) => {
  try {
    const userId = req.userId;
    const portfolioItemId = req.params.id;
    const { title, description, imageUrl, projectUrl, technologies, completionDate } = req.body;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find portfolio item
    const itemIndex = freelancer.portfolio.findIndex(item => item._id.toString() === portfolioItemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Update portfolio item
    if (title) freelancer.portfolio[itemIndex].title = title;
    if (description) freelancer.portfolio[itemIndex].description = description;
    if (imageUrl !== undefined) freelancer.portfolio[itemIndex].imageUrl = imageUrl;
    if (projectUrl !== undefined) freelancer.portfolio[itemIndex].projectUrl = projectUrl;
    if (technologies) freelancer.portfolio[itemIndex].technologies = technologies;
    if (completionDate !== undefined) freelancer.portfolio[itemIndex].completionDate = completionDate;

    await freelancer.save();

    res.status(200).json({
      message: 'Portfolio item updated successfully',
      portfolioItem: freelancer.portfolio[itemIndex]
    });
  } catch (error) {
    next(error);
  }
};

// Delete portfolio item
exports.deletePortfolioItem = async (req, res, next) => {
  try {
    const userId = req.userId;
    const portfolioItemId = req.params.id;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find portfolio item
    const itemIndex = freelancer.portfolio.findIndex(item => item._id.toString() === portfolioItemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Remove portfolio item
    freelancer.portfolio.splice(itemIndex, 1);
    await freelancer.save();

    res.status(200).json({
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Upload portfolio image
exports.uploadPortfolioImage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const portfolioItemId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find portfolio item
    const itemIndex = freelancer.portfolio.findIndex(item => item._id.toString() === portfolioItemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Delete old image if exists
    if (freelancer.portfolio[itemIndex].imageUrl && freelancer.portfolio[itemIndex].imageUrl !== '') {
      const oldImagePath = path.join(__dirname, '../../../uploads/portfolio', path.basename(freelancer.portfolio[itemIndex].imageUrl));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update image URL
    freelancer.portfolio[itemIndex].imageUrl = `/uploads/portfolio/${req.file.filename}`;
    await freelancer.save();

    res.status(200).json({
      message: 'Portfolio image uploaded successfully',
      imageUrl: freelancer.portfolio[itemIndex].imageUrl
    });
  } catch (error) {
    next(error);
  }
};

// Get education
exports.getEducation = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    res.status(200).json({ education: freelancer.education });
  } catch (error) {
    next(error);
  }
};

// Add education
exports.addEducation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { institution, degree, fieldOfStudy, from, to, current, description } = req.body;

    if (!institution || !degree) {
      return res.status(400).json({ message: 'Institution and degree are required' });
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Add new education
    const newEducation = {
      institution,
      degree,
      fieldOfStudy: fieldOfStudy || '',
      from: from || null,
      to: to || null,
      current: current || false,
      description: description || ''
    };

    freelancer.education.push(newEducation);
    await freelancer.save();

    res.status(201).json({
      message: 'Education added successfully',
      education: freelancer.education[freelancer.education.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// Update education
exports.updateEducation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const educationId = req.params.id;
    const { institution, degree, fieldOfStudy, from, to, current, description } = req.body;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find education
    const educationIndex = freelancer.education.findIndex(edu => edu._id.toString() === educationId);

    if (educationIndex === -1) {
      return res.status(404).json({ message: 'Education not found' });
    }

    // Update education
    if (institution) freelancer.education[educationIndex].institution = institution;
    if (degree) freelancer.education[educationIndex].degree = degree;
    if (fieldOfStudy !== undefined) freelancer.education[educationIndex].fieldOfStudy = fieldOfStudy;
    if (from !== undefined) freelancer.education[educationIndex].from = from;
    if (to !== undefined) freelancer.education[educationIndex].to = to;
    if (current !== undefined) freelancer.education[educationIndex].current = current;
    if (description !== undefined) freelancer.education[educationIndex].description = description;

    await freelancer.save();

    res.status(200).json({
      message: 'Education updated successfully',
      education: freelancer.education[educationIndex]
    });
  } catch (error) {
    next(error);
  }
};

// Delete education
exports.deleteEducation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const educationId = req.params.id;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find education
    const educationIndex = freelancer.education.findIndex(edu => edu._id.toString() === educationId);

    if (educationIndex === -1) {
      return res.status(404).json({ message: 'Education not found' });
    }

    // Remove education
    freelancer.education.splice(educationIndex, 1);
    await freelancer.save();

    res.status(200).json({
      message: 'Education deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get work experience
exports.getWorkExperience = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    res.status(200).json({ workExperience: freelancer.workExperience });
  } catch (error) {
    next(error);
  }
};

// Add work experience
exports.addWorkExperience = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { company, position, from, to, current, description } = req.body;

    if (!company || !position) {
      return res.status(400).json({ message: 'Company and position are required' });
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Add new work experience
    const newWorkExperience = {
      company,
      position,
      from: from || null,
      to: to || null,
      current: current || false,
      description: description || ''
    };

    freelancer.workExperience.push(newWorkExperience);
    await freelancer.save();

    res.status(201).json({
      message: 'Work experience added successfully',
      workExperience: freelancer.workExperience[freelancer.workExperience.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// Update work experience
exports.updateWorkExperience = async (req, res, next) => {
  try {
    const userId = req.userId;
    const experienceId = req.params.id;
    const { company, position, from, to, current, description } = req.body;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find work experience
    const experienceIndex = freelancer.workExperience.findIndex(exp => exp._id.toString() === experienceId);

    if (experienceIndex === -1) {
      return res.status(404).json({ message: 'Work experience not found' });
    }

    // Update work experience
    if (company) freelancer.workExperience[experienceIndex].company = company;
    if (position) freelancer.workExperience[experienceIndex].position = position;
    if (from !== undefined) freelancer.workExperience[experienceIndex].from = from;
    if (to !== undefined) freelancer.workExperience[experienceIndex].to = to;
    if (current !== undefined) freelancer.workExperience[experienceIndex].current = current;
    if (description !== undefined) freelancer.workExperience[experienceIndex].description = description;

    await freelancer.save();

    res.status(200).json({
      message: 'Work experience updated successfully',
      workExperience: freelancer.workExperience[experienceIndex]
    });
  } catch (error) {
    next(error);
  }
};

// Delete work experience
exports.deleteWorkExperience = async (req, res, next) => {
  try {
    const userId = req.userId;
    const experienceId = req.params.id;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find work experience
    const experienceIndex = freelancer.workExperience.findIndex(exp => exp._id.toString() === experienceId);

    if (experienceIndex === -1) {
      return res.status(404).json({ message: 'Work experience not found' });
    }

    // Remove work experience
    freelancer.workExperience.splice(experienceIndex, 1);
    await freelancer.save();

    res.status(200).json({
      message: 'Work experience deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get languages
exports.getLanguages = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    res.status(200).json({ languages: freelancer.languages });
  } catch (error) {
    next(error);
  }
};

// Add language
exports.addLanguage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, proficiency } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Language name is required' });
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Check if language already exists
    const languageExists = freelancer.languages.some(lang => lang.name.toLowerCase() === name.toLowerCase());

    if (languageExists) {
      return res.status(400).json({ message: 'Language already exists' });
    }

    // Add new language
    const newLanguage = {
      name,
      proficiency: proficiency || 'Fluent'
    };

    freelancer.languages.push(newLanguage);
    await freelancer.save();

    res.status(201).json({
      message: 'Language added successfully',
      language: freelancer.languages[freelancer.languages.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// Update language
exports.updateLanguage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const languageId = req.params.id;
    const { name, proficiency } = req.body;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find language
    const languageIndex = freelancer.languages.findIndex(lang => lang._id.toString() === languageId);

    if (languageIndex === -1) {
      return res.status(404).json({ message: 'Language not found' });
    }

    // Update language
    if (name) freelancer.languages[languageIndex].name = name;
    if (proficiency) freelancer.languages[languageIndex].proficiency = proficiency;

    await freelancer.save();

    res.status(200).json({
      message: 'Language updated successfully',
      language: freelancer.languages[languageIndex]
    });
  } catch (error) {
    next(error);
  }
};

// Delete language
exports.deleteLanguage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const languageId = req.params.id;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find language
    const languageIndex = freelancer.languages.findIndex(lang => lang._id.toString() === languageId);

    if (languageIndex === -1) {
      return res.status(404).json({ message: 'Language not found' });
    }

    // Remove language
    freelancer.languages.splice(languageIndex, 1);
    await freelancer.save();

    res.status(200).json({
      message: 'Language deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get certifications
exports.getCertifications = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    res.status(200).json({ certifications: freelancer.certifications });
  } catch (error) {
    next(error);
  }
};

// Add certification
exports.addCertification = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, issuer, dateObtained, expiryDate, credentialId, credentialUrl } = req.body;

    if (!name || !issuer) {
      return res.status(400).json({ message: 'Certification name and issuer are required' });
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Add new certification
    const newCertification = {
      name,
      issuer,
      dateObtained: dateObtained || null,
      expiryDate: expiryDate || null,
      credentialId: credentialId || '',
      credentialUrl: credentialUrl || ''
    };

    freelancer.certifications.push(newCertification);
    await freelancer.save();

    res.status(201).json({
      message: 'Certification added successfully',
      certification: freelancer.certifications[freelancer.certifications.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// Update certification
exports.updateCertification = async (req, res, next) => {
  try {
    const userId = req.userId;
    const certificationId = req.params.id;
    const { name, issuer, dateObtained, expiryDate, credentialId, credentialUrl } = req.body;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find certification
    const certificationIndex = freelancer.certifications.findIndex(cert => cert._id.toString() === certificationId);

    if (certificationIndex === -1) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    // Update certification
    if (name) freelancer.certifications[certificationIndex].name = name;
    if (issuer) freelancer.certifications[certificationIndex].issuer = issuer;
    if (dateObtained !== undefined) freelancer.certifications[certificationIndex].dateObtained = dateObtained;
    if (expiryDate !== undefined) freelancer.certifications[certificationIndex].expiryDate = expiryDate;
    if (credentialId !== undefined) freelancer.certifications[certificationIndex].credentialId = credentialId;
    if (credentialUrl !== undefined) freelancer.certifications[certificationIndex].credentialUrl = credentialUrl;

    await freelancer.save();

    res.status(200).json({
      message: 'Certification updated successfully',
      certification: freelancer.certifications[certificationIndex]
    });
  } catch (error) {
    next(error);
  }
};

// Delete certification
exports.deleteCertification = async (req, res, next) => {
  try {
    const userId = req.userId;
    const certificationId = req.params.id;

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Find certification
    const certificationIndex = freelancer.certifications.findIndex(cert => cert._id.toString() === certificationId);

    if (certificationIndex === -1) {
      return res.status(404).json({ message: 'Certification not found' });
    }

    // Remove certification
    freelancer.certifications.splice(certificationIndex, 1);
    await freelancer.save();

    res.status(200).json({
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Calculate profile completeness
const calculateProfileCompleteness = (user, freelancer) => {
  // Define required fields and their weights
  const fields = [
    { name: 'name', weight: 10, check: () => user.name && user.name.trim() !== '' },
    { name: 'profileImage', weight: 5, check: () => user.profileImage && user.profileImage.trim() !== '' },
    { name: 'title', weight: 10, check: () => freelancer.title && freelancer.title.trim() !== '' },
    { name: 'bio', weight: 15, check: () => freelancer.bio && freelancer.bio.trim() !== '' },
    { name: 'skills', weight: 15, check: () => freelancer.skills && freelancer.skills.length > 0 },
    { name: 'hourlyRate', weight: 5, check: () => freelancer.hourlyRate && freelancer.hourlyRate > 0 },
    { name: 'education', weight: 10, check: () => freelancer.education && freelancer.education.length > 0 },
    { name: 'workExperience', weight: 10, check: () => freelancer.workExperience && freelancer.workExperience.length > 0 },
    { name: 'portfolio', weight: 15, check: () => freelancer.portfolio && freelancer.portfolio.length > 0 },
    { name: 'languages', weight: 5, check: () => freelancer.languages && freelancer.languages.length > 0 }
  ];

  // Calculate total score
  let totalScore = 0;
  const missing = [];

  fields.forEach(field => {
    if (field.check()) {
      totalScore += field.weight;
    } else {
      missing.push(field.name);
    }
  });

  // Determine status based on percentage
  let status = 'Incomplete';
  if (totalScore >= 85) {
    status = 'Excellent';
  } else if (totalScore >= 70) {
    status = 'Good';
  } else if (totalScore >= 40) {
    status = 'Average';
  }

  return {
    percentage: totalScore,
    missingFields: missing,
    status
  };
};

// Get profile completeness
exports.getProfileCompleteness = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find freelancer profile
    const freelancer = await Freelancer.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Calculate profile completeness
    const completeness = calculateProfileCompleteness(user, freelancer);

    res.status(200).json({ completeness });
  } catch (error) {
    next(error);
  }
};
