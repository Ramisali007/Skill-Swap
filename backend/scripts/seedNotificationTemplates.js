const mongoose = require('mongoose');
const dotenv = require('dotenv');
const NotificationTemplate = require('../models/NotificationTemplate');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Default templates
const defaultTemplates = [
  // Email templates
  {
    name: 'welcome_email',
    description: 'Welcome email sent to new users',
    type: 'email',
    subject: 'Welcome to SkillSwap!',
    content: `
      <h1>Welcome to SkillSwap, \{{recipientName}}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>With SkillSwap, you can:</p>
      <ul>
        <li>Find skilled freelancers for your projects</li>
        <li>Bid on interesting projects that match your skills</li>
        <li>Connect with professionals from around the world</li>
      </ul>
      <p>Get started by exploring our platform:</p>
      <a href="\{{dashboardLink}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>The SkillSwap Team</p>
    `,
    variables: [
      { name: 'recipientName', description: 'Name of the recipient' },
      { name: 'dashboardLink', description: 'Link to the dashboard' }
    ],
    category: 'system',
    isActive: true
  },
  {
    name: 'password_reset_email',
    description: 'Email sent when a user requests a password reset',
    type: 'email',
    subject: 'Reset Your SkillSwap Password',
    content: `
      <h1>Password Reset Request</h1>
      <p>Hello \{{recipientName}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="\{{resetLink}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>The SkillSwap Team</p>
    `,
    variables: [
      { name: 'recipientName', description: 'Name of the recipient' },
      { name: 'resetLink', description: 'Password reset link' }
    ],
    category: 'system',
    isActive: true
  },
  {
    name: 'new_bid_email',
    description: 'Email sent to project owner when a new bid is placed',
    type: 'email',
    subject: 'New Bid on Your Project',
    content: `
      <h1>New Bid Received</h1>
      <p>Hello \{{recipientName}},</p>
      <p>Good news! Your project "\{{projectTitle}}" has received a new bid from \{{bidderName}}.</p>
      <p><strong>Bid Amount:</strong> $\{{bidAmount}}</p>
      <p><strong>Delivery Time:</strong> \{{deliveryTime}}</p>
      <p>To view the bid details and accept or decline, click the button below:</p>
      <a href="\{{projectLink}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Bid</a>
      <p>Best regards,<br>The SkillSwap Team</p>
    `,
    variables: [
      { name: 'recipientName', description: 'Name of the recipient' },
      { name: 'projectTitle', description: 'Title of the project' },
      { name: 'bidderName', description: 'Name of the bidder' },
      { name: 'bidAmount', description: 'Bid amount' },
      { name: 'deliveryTime', description: 'Delivery time' },
      { name: 'projectLink', description: 'Link to the project' }
    ],
    category: 'bid',
    isActive: true
  },
  // SMS templates
  {
    name: 'bid_accepted_sms',
    description: 'SMS sent to freelancer when their bid is accepted',
    type: 'sms',
    content: 'SkillSwap: Congratulations! Your bid on "\{{projectTitle}}" has been accepted. Check your email for details.',
    variables: [
      { name: 'projectTitle', description: 'Title of the project' }
    ],
    category: 'bid',
    isActive: true
  },
  {
    name: 'new_message_sms',
    description: 'SMS sent when a user receives a new message',
    type: 'sms',
    content: 'SkillSwap: You have a new message from {{senderName}}. Log in to view and reply.',
    variables: [
      { name: 'senderName', description: 'Name of the message sender' }
    ],
    category: 'message',
    isActive: true
  },
  // In-App templates
  {
    name: 'project_completed_inapp',
    description: 'In-app notification when a project is marked as completed',
    type: 'inApp',
    content: 'Your project "{{projectTitle}}" has been marked as completed. Please review the work and provide feedback.',
    variables: [
      { name: 'projectTitle', description: 'Title of the project' }
    ],
    category: 'project',
    isActive: true
  },
  {
    name: 'new_review_inapp',
    description: 'In-app notification when a user receives a new review',
    type: 'inApp',
    content: '{{reviewerName}} has left a {{rating}}-star review on your profile. Click to view.',
    variables: [
      { name: 'reviewerName', description: 'Name of the reviewer' },
      { name: 'rating', description: 'Rating (1-5)' }
    ],
    category: 'review',
    isActive: true
  },
  // Dispute templates
  {
    name: 'dispute_opened_email',
    description: 'Email notification when a dispute is opened',
    type: 'email',
    subject: 'A Dispute Has Been Opened - SkillSwap',
    content: `
      <h1>Hello {{recipientName}},</h1>
      <p>A dispute has been opened for project: <strong>{{projectTitle}}</strong>.</p>
      <p><strong>Dispute reason:</strong> {{disputeReason}}</p>
      <p><strong>Opened by:</strong> {{openerName}}</p>
      <p>Please review the dispute details and respond as soon as possible. Our team will help mediate this issue.</p>
      <p>You can view the dispute details and respond by clicking the button below:</p>
      <a href="{{disputeLink}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Dispute</a>
      <p>If you have any questions, please contact our support team.</p>
      <p>Thank you,<br>The SkillSwap Team</p>
    `,
    variables: [
      { name: 'recipientName', description: 'Name of the recipient' },
      { name: 'projectTitle', description: 'Title of the project' },
      { name: 'disputeReason', description: 'Reason for the dispute' },
      { name: 'openerName', description: 'Name of the person who opened the dispute' },
      { name: 'disputeLink', description: 'Link to view the dispute' }
    ],
    category: 'project',
    isActive: true
  }
];

// Seed templates
const seedTemplates = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing templates
    await NotificationTemplate.deleteMany({});
    console.log('Cleared existing templates');

    // Insert default templates
    const result = await NotificationTemplate.insertMany(defaultTemplates);
    console.log(`${result.length} templates seeded successfully`);

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
};

// Run the seed function
seedTemplates();
