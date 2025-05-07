const User = require('../../models/User');
const Client = require('../../models/Client');
const Freelancer = require('../../models/Freelancer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  try {
    // Create a test account if no email credentials provided
    let testAccount = await nodemailer.createTestAccount();

    // Create reusable transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER || testAccount.user,
        pass: process.env.EMAIL_PASS || testAccount.pass
      }
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"SkillSwap" <noreply@skillswap.com>',
      to,
      subject,
      html
    });

    console.log('Message sent: %s', info.messageId);

    // Preview URL for test accounts
    if (!process.env.EMAIL_USER) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// User registration
exports.signup = async (req, res, next) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      console.error('Missing required fields:', { name, email, password: password ? 'provided' : 'missing', role });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated verification token for:', email);

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      verificationToken
      // isVerified will use the default value (true) from the User model
    });

    console.log('Attempting to save user to database...', {
      name,
      email,
      role,
      phone: phone ? 'provided' : 'not provided'
    });

    // Save user and create profile
    let savedUser;
    try {
      savedUser = await user.save();
      console.log('User saved successfully with ID:', savedUser._id);

      // Create role-specific profile
      if (role === 'client') {
        console.log('Creating client profile for user:', savedUser._id);
        const client = new Client({
          user: savedUser._id
        });
        await client.save();
        console.log('Client profile created successfully');
      } else if (role === 'freelancer') {
        console.log('Creating freelancer profile for user:', savedUser._id);
        const freelancer = new Freelancer({
          user: savedUser._id
        });
        await freelancer.save();
        console.log('Freelancer profile created successfully');
      }
    } catch (saveError) {
      console.error('Error saving user to database:', saveError);
      // Check for specific MongoDB errors
      if (saveError.name === 'MongoServerError' && saveError.code === 11000) {
        return res.status(400).json({
          message: 'User with this email already exists',
          error: 'duplicate_email'
        });
      }
      throw saveError; // Re-throw to be caught by the outer catch block
    }

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/verify-email?token=${verificationToken}`;
    console.log('Sending verification email to:', email, 'with URL:', verificationUrl);
    try {
      await sendEmail(
        email,
        'Verify Your SkillSwap Account',
        `
          <h1>Welcome to SkillSwap!</h1>
          <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>If you did not create this account, please ignore this email.</p>
        `
      );
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Return success response
    if (savedUser) {
      res.status(201).json({
        message: 'User registered successfully. You can now log in with your credentials.',
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      });
    } else {
      // This should not happen due to the try-catch above, but just in case
      res.status(500).json({
        message: 'Registration failed. User was not saved properly.'
      });
    }
  } catch (error) {
    console.error('Error during user registration:', error);

    // Check for MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'User with this email already exists',
        error: 'duplicate_email'
      });
    }

    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};

      // Extract validation error messages
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }

      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // For other errors, return a generic message but log the full error
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
    next(error);
  }
};

// Email verification
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Find user with the verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      message: 'Email verified successfully',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(
      email,
      'Verify Your SkillSwap Account',
      `
        <h1>Welcome to SkillSwap!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you did not create this account, please ignore this email.</p>
      `
    );

    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    next(error);
  }
};

// User login
exports.login = async (req, res, next) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.error('Missing required fields:', { email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found, checking password');
    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified - commented out since users are verified by default
    // if (!user.isVerified) {
    //   console.log('User email not verified:', email);
    //   return res.status(403).json({ message: 'Please verify your email before logging in' });
    // }

    // Check account status
    if (user.accountStatus === 'suspended') {
      console.log('User account is suspended:', email);
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    if (user.accountStatus === 'deactivated') {
      console.log('User account is deactivated:', email);
      return res.status(403).json({ message: 'Your account has been deactivated. Please reactivate your account to continue.' });
    }

    // Update login history
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Update last login time and add to login history
    user.lastLogin = new Date();
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress,
      userAgent
    });

    // Limit login history to last 10 entries
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    await user.save();
    console.log('Updated login history for user:', email);

    // Generate JWT token
    console.log('Generating token for user:', user._id);
    const token = generateToken(user._id);

    console.log('Login successful for user:', email);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed. Please try again later.' });
    next(error);
  }
};

// User logout (client-side token removal)
exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;

    // Get role-specific profile
    let profile = null;
    if (user.role === 'client') {
      profile = await Client.findOne({ user: user._id });
    } else if (user.role === 'freelancer') {
      profile = await Freelancer.findOne({ user: user._id });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(`Forgot password request received for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`User found with email: ${email}, setting password to "password123"`);
    console.log(`User before password reset: ${JSON.stringify({
      id: user._id,
      email: user.email,
      passwordLength: user.password ? user.password.length : 0
    })}`);

    // Set the password to "password123" - ensure it's a string
    user.password = String("password123");

    // Clear any existing reset tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Force the password to be marked as modified
    user.markModified('password');

    // Save the user with the new password
    try {
      const savedUser = await user.save();
      console.log(`Password reset to "password123" for user: ${email}`);
      console.log(`User saved with ID: ${savedUser._id}`);
      console.log(`User after password reset: ${JSON.stringify({
        id: savedUser._id,
        email: savedUser.email,
        passwordLength: savedUser.password ? savedUser.password.length : 0
      })}`);

      // Verify the password was saved correctly by retrieving the user again
      const verifyUser = await User.findById(savedUser._id);
      console.log(`Verification - Retrieved user from database: ${verifyUser.email}`);
      console.log(`Verification - Password length in database: ${verifyUser.password.length}`);

      // Test login with the new password
      const isPasswordValid = await verifyUser.comparePassword('password123');
      console.log(`Verification - Can login with "password123": ${isPasswordValid ? 'YES' : 'NO'}`);

      if (!isPasswordValid) {
        console.error('WARNING: Password was saved but cannot be used for login!');
      }
    } catch (saveError) {
      console.error(`Error saving user after password reset: ${saveError.message}`);
      console.error(saveError.stack);
      throw saveError;
    }

    // Send confirmation email
    try {
      await sendEmail(
        email,
        'Your SkillSwap Password Has Been Reset',
        `
          <h1>Password Reset Successful</h1>
          <p>Your password has been reset to: <strong>password123</strong></p>
          <p>Please log in with this password and change it immediately for security reasons.</p>
          <p>If you did not request this password reset, please contact support immediately.</p>
        `
      );
      console.log(`Password reset confirmation email sent to: ${email}`);
    } catch (emailError) {
      console.error(`Error sending password reset confirmation email to ${email}:`, emailError);
      // Continue even if email fails
    }

    res.status(200).json({
      message: 'Password has been reset to "password123". Please check your email for confirmation.'
    });
  } catch (error) {
    console.error(`Error during password reset for ${req.body.email}:`, error);
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find user with the reset token and valid expiry
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// Change password (authenticated)
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    console.log(`Password change request for user: ${user.email}`);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      console.log(`Password change failed: Current password is incorrect for user ${user.email}`);
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;

    // Save the user to update the password in MongoDB Atlas
    const savedUser = await user.save();
    console.log(`Password successfully changed for user: ${user.email}`);
    console.log(`User saved with ID: ${savedUser._id}`);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(`Error changing password: ${error.message}`);
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = req.user;

    // Update user fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
