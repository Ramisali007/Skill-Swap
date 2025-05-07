# SkillSwap Platform

SkillSwap is a comprehensive platform that connects freelancers with clients seeking their services. This project is built using the MERN stack (MongoDB, Express, React, Node.js) with a microservices architecture.

## Features

### Client Features
- Role-based authentication with JWT and password hashing
- Project posting with CRUD operations
- Freelancer search and filtering system
- Real-time bidding system
- In-app messaging
- Review and rating system
- Analytics dashboard

### Freelancer Features
- Profile management
- Bid management
- Project management tools
- Project timeline tracking

### Admin Features
- Freelancer verification
- Platform analytics
- Notification system

## Technical Stack

### Frontend
- React with Vite
- React Router for navigation
- Tailwind CSS for styling
- Chart.js for data visualization
- Socket.io for real-time features

### Backend
- Node.js with Express
- MongoDB Atlas (cloud database)
- JWT for authentication
- Bcrypt for password hashing
- Socket.io for real-time communication
- Multer for file uploads
- Nodemailer for email notifications

## Project Structure

```
skillswap/
├── frontend/             # React frontend
│   ├── public/           # Static files
│   └── src/              # Source files
│       ├── components/   # React components
│       ├── context/      # Context providers
│       ├── pages/        # Page components
│       └── utils/        # Utility functions
│
└── backend/              # Node.js backend
    ├── config/           # Configuration files
    ├── middlewares/      # Express middlewares
    ├── models/           # MongoDB models
    ├── services/         # Microservices
    │   ├── auth/         # Authentication service
    │   ├── projects/     # Project management service
    │   ├── bidding/      # Bidding service
    │   ├── messaging/    # Messaging service
    │   ├── reviews/      # Review service
    │   ├── admin/        # Admin service
    │   └── notifications/ # Notification service
    └── utils/            # Utility functions
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/skillswap.git
cd skillswap
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/skillswap
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
EMAIL_FROM=noreply@skillswap.com
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_SECURE=false
```

5. Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- POST /api/auth/signup - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/verify-email - Verify email
- POST /api/auth/reset-password - Reset password

### Projects
- GET /api/projects - Get all projects
- POST /api/projects - Create a new project
- GET /api/projects/:id - Get project by ID
- PUT /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project

### Bidding
- POST /api/projects/:id/bids - Submit a bid
- GET /api/projects/:id/bids - Get all bids for a project
- PUT /api/projects/:id/bids/:bidId - Update bid

### Messaging
- GET /api/messages/conversations - Get all conversations
- POST /api/messages/conversations - Create a new conversation
- GET /api/messages/conversations/:id/messages - Get messages in a conversation
- POST /api/messages/conversations/:id/messages - Send a message

### Reviews
- POST /api/reviews - Create a review
- GET /api/reviews/user/:userId - Get all reviews for a user
- PUT /api/reviews/:id - Update review

### Admin
- GET /api/admin/freelancers/pending - Get pending freelancer verifications
- PUT /api/admin/freelancers/:id/verify - Verify freelancer
- GET /api/admin/analytics/users - Get user analytics

### Notifications
- GET /api/notify - Get all notifications
- PUT /api/notify/:id/read - Mark notification as read
- POST /api/notify/email - Send email notification

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was created as part of a web engineering course assignment.
- Special thanks to all contributors and the open-source community for their valuable resources.
