# SkillSwap Notification System

This document provides information about the notification system in SkillSwap and how to set it up.

## Features

The notification system includes:

1. **Email Notifications**: Send email notifications to users using templates
2. **SMS Notifications**: Mock SMS notifications (using Twilio mock)
3. **In-App Notifications**: Real-time notifications within the application
4. **Template Management**: Create and manage notification templates
5. **Scheduled Notifications**: Schedule notifications to be sent at a specific time
6. **User Preferences**: Allow users to set their notification preferences

## Setup Instructions

### 1. Install Dependencies

Make sure you have the required dependencies installed:

```bash
cd backend
npm install
```

### 2. Seed Notification Templates

To seed the default notification templates, run:

```bash
npm run seed:templates
```

This will create several default templates for common notifications like:
- Welcome emails
- Password reset emails
- Bid notifications
- Project updates
- Dispute notifications

### 3. Configure Email Settings

Update your `.env` file with the following email settings:

```
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_FROM=noreply@skillswap.com
```

For development, you can use [Mailtrap](https://mailtrap.io/) to test email sending without actually sending emails.

### 4. Configure Twilio (Optional)

If you want to use real SMS instead of the mock, update your `.env` file with Twilio credentials:

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Usage

### Sending Notifications

You can send notifications using the notification service:

```javascript
const notificationService = require('./services/notifications/service');

// Send email
await notificationService.sendEmail(
  'recipient@example.com',
  'Subject',
  '<h1>Email content</h1>'
);

// Send SMS
await notificationService.sendSMS(
  '+1234567890',
  'SMS content'
);

// Create in-app notification
await notificationService.createInAppNotification(
  userId,
  'type',
  'title',
  'message'
);

// Send notification using template
await notificationService.sendNotificationByTemplate(
  'template_name',
  userId,
  { variable1: 'value1', variable2: 'value2' },
  { email: true, sms: false, inApp: true }
);
```

### Managing Templates

You can manage notification templates through the admin interface at:

```
/admin/notifications
```

This interface allows you to:
- Create new templates
- Edit existing templates
- Delete templates
- Duplicate templates

### Scheduling Notifications

You can schedule notifications through the admin interface at:

```
/admin/notifications
```

Select the "Scheduled" tab to:
- Create scheduled notifications
- View existing scheduled notifications
- Cancel scheduled notifications

## Troubleshooting

### No Templates Found

If you see "Failed to load notification templates" error:

1. Make sure you've run the seed script:
   ```bash
   npm run seed:templates
   ```

2. Check the MongoDB connection:
   ```bash
   mongo mongodb://localhost:27017/skillswap
   db.notificationtemplates.find()
   ```

3. Check the server logs for any errors related to templates.

### Email Sending Issues

If emails are not being sent:

1. Check your email configuration in the `.env` file
2. Make sure the email service is running
3. Check the server logs for any errors related to email sending

## API Endpoints

The notification system exposes the following API endpoints:

- `GET /api/notify` - Get all notifications for current user
- `PUT /api/notify/:id/read` - Mark notification as read
- `PUT /api/notify/read-all` - Mark all notifications as read
- `DELETE /api/notify/:id` - Delete notification
- `GET /api/notify/unread-count` - Get unread notification count
- `PUT /api/notify/preferences` - Update notification preferences
- `POST /api/notify/email` - Send email notification
- `POST /api/notify/sms` - Send SMS notification
- `GET /api/notify/templates` - Get all templates (admin only)
- `GET /api/notify/templates/:id` - Get template by ID (admin only)
- `POST /api/notify/templates` - Create template (admin only)
- `PUT /api/notify/templates/:id` - Update template (admin only)
- `DELETE /api/notify/templates/:id` - Delete template (admin only)
- `GET /api/notify/scheduled` - Get all scheduled notifications (admin only)
- `GET /api/notify/scheduled/:id` - Get scheduled notification by ID (admin only)
- `POST /api/notify/scheduled` - Create scheduled notification (admin only)
- `PUT /api/notify/scheduled/:id/cancel` - Cancel scheduled notification (admin only)
