import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const DisputeTemplateCreator = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Create dispute notification templates
  const createDisputeTemplates = async () => {
    try {
      setLoading(true);
      
      // Create dispute opened template (email)
      await axios.post('/api/notify/templates', {
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
      });
      
      // Create dispute opened template (SMS)
      await axios.post('/api/notify/templates', {
        name: 'dispute_opened_sms',
        description: 'SMS notification when a dispute is opened',
        type: 'sms',
        content: 'SkillSwap: A dispute has been opened for project "{{projectTitle}}". Please check your email or login to respond.',
        variables: [
          { name: 'projectTitle', description: 'Title of the project' }
        ],
        category: 'project',
        isActive: true
      });
      
      // Create dispute response template (email)
      await axios.post('/api/notify/templates', {
        name: 'dispute_response_email',
        description: 'Email notification when there is a response to a dispute',
        type: 'email',
        subject: 'New Response to Your Dispute - SkillSwap',
        content: `
          <h1>Hello {{recipientName}},</h1>
          <p>There has been a new response to the dispute for project: <strong>{{projectTitle}}</strong>.</p>
          <p><strong>Response from:</strong> {{responderName}}</p>
          <p>You can view the full response and reply by clicking the button below:</p>
          <a href="{{disputeLink}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Dispute</a>
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you,<br>The SkillSwap Team</p>
        `,
        variables: [
          { name: 'recipientName', description: 'Name of the recipient' },
          { name: 'projectTitle', description: 'Title of the project' },
          { name: 'responderName', description: 'Name of the person who responded' },
          { name: 'disputeLink', description: 'Link to view the dispute' }
        ],
        category: 'project',
        isActive: true
      });
      
      // Create dispute resolved template (email)
      await axios.post('/api/notify/templates', {
        name: 'dispute_resolved_email',
        description: 'Email notification when a dispute is resolved',
        type: 'email',
        subject: 'Dispute Resolved - SkillSwap',
        content: `
          <h1>Hello {{recipientName}},</h1>
          <p>The dispute for project <strong>{{projectTitle}}</strong> has been resolved.</p>
          <p><strong>Resolution:</strong> {{resolution}}</p>
          <p><strong>Resolved by:</strong> {{resolverName}}</p>
          <p>You can view the details by clicking the button below:</p>
          <a href="{{projectLink}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Project</a>
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you,<br>The SkillSwap Team</p>
        `,
        variables: [
          { name: 'recipientName', description: 'Name of the recipient' },
          { name: 'projectTitle', description: 'Title of the project' },
          { name: 'resolution', description: 'Resolution details' },
          { name: 'resolverName', description: 'Name of the person who resolved the dispute' },
          { name: 'projectLink', description: 'Link to view the project' }
        ],
        category: 'project',
        isActive: true
      });
      
      // Create dispute resolved template (SMS)
      await axios.post('/api/notify/templates', {
        name: 'dispute_resolved_sms',
        description: 'SMS notification when a dispute is resolved',
        type: 'sms',
        content: 'SkillSwap: The dispute for project "{{projectTitle}}" has been resolved. Please check your email or login for details.',
        variables: [
          { name: 'projectTitle', description: 'Title of the project' }
        ],
        category: 'project',
        isActive: true
      });
      
      // Create verification templates
      await axios.post('/api/notify/templates', {
        name: 'verification_approved_email',
        description: 'Email notification when a freelancer is verified',
        type: 'email',
        subject: 'Your Account Has Been Verified - SkillSwap',
        content: `
          <h1>Congratulations, {{recipientName}}!</h1>
          <p>Your SkillSwap account has been verified. You now have access to all features and benefits of being a verified freelancer.</p>
          <p>Benefits include:</p>
          <ul>
            <li>Higher visibility in search results</li>
            <li>Access to premium projects</li>
            <li>Verified badge on your profile</li>
            <li>Higher trust from potential clients</li>
          </ul>
          <p>You can start exploring premium projects by clicking the button below:</p>
          <a href="{{dashboardLink}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Go to Dashboard</a>
          <p>Thank you for being part of the SkillSwap community!</p>
          <p>Best regards,<br>The SkillSwap Team</p>
        `,
        variables: [
          { name: 'recipientName', description: 'Name of the recipient' },
          { name: 'dashboardLink', description: 'Link to the dashboard' }
        ],
        category: 'verification',
        isActive: true
      });
      
      // Create verification rejected template
      await axios.post('/api/notify/templates', {
        name: 'verification_rejected_email',
        description: 'Email notification when a freelancer verification is rejected',
        type: 'email',
        subject: 'Verification Status Update - SkillSwap',
        content: `
          <h1>Hello {{recipientName}},</h1>
          <p>We have reviewed your verification request and unfortunately, we are unable to verify your account at this time.</p>
          <p><strong>Reason:</strong> {{rejectionReason}}</p>
          <p>You can submit a new verification request after addressing the issues mentioned above. If you believe this is an error, please contact our support team.</p>
          <p>To submit a new verification request, please click the button below:</p>
          <a href="{{verificationLink}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Submit New Request</a>
          <p>Thank you for your understanding.</p>
          <p>Best regards,<br>The SkillSwap Team</p>
        `,
        variables: [
          { name: 'recipientName', description: 'Name of the recipient' },
          { name: 'rejectionReason', description: 'Reason for rejection' },
          { name: 'verificationLink', description: 'Link to submit a new verification request' }
        ],
        category: 'verification',
        isActive: true
      });
      
      setSuccess(true);
      setLoading(false);
      toast.success('Dispute and verification templates created successfully');
    } catch (error) {
      console.error('Error creating templates:', error);
      toast.error('Failed to create templates');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Dispute & Verification Templates</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Create notification templates for disputes and verifications
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Templates created successfully</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>All dispute and verification notification templates have been created and are ready to use.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>This will create the following notification templates:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Dispute opened (email & SMS)</li>
                      <li>Dispute response (email)</li>
                      <li>Dispute resolved (email & SMS)</li>
                      <li>Verification approved (email)</li>
                      <li>Verification rejected (email)</li>
                    </ul>
                    <p className="mt-2">If templates with these names already exist, they will be updated.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={createDisputeTemplates}
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Templates...
                  </>
                ) : (
                  'Create Templates'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeTemplateCreator;
