# Email Microservice

A microservice for handling email sending with rate limiting, quota management, and email validation.

## Features

- Email sending with queue management using Redis
- Google OAuth authentication
- Email quota management with warmup strategy
- Throwaway email detection
- Modern Vue.js frontend with Element Plus UI
- TypeScript support
- MongoDB for user data storage
- JWT token authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- Google OAuth credentials
- Mailgun account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd email-microservice
```

2. Install dependencies:
```bash
npm run install:all
```

3. Configure environment variables:

Backend (.env):
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/email-service
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
DAILY_EMAIL_QUOTA=100
EMAIL_WARMUP_START=10
EMAIL_WARMUP_DAYS=30
```

Frontend (.env):
```env
VUE_APP_API_URL=http://localhost:3000
VUE_APP_BASE_URL=/
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the backend (port 3000) and frontend (port 8080) servers.

## Usage

1. Access the frontend at http://localhost:8080
2. Sign in with your Google account
3. Use the email form to send emails
4. Monitor your email quota in the UI

## API Endpoints

### Authentication
- GET /auth/google - Initiate Google OAuth login
- GET /auth/google/callback - Google OAuth callback
- GET /auth/me - Get current user info
- POST /auth/logout - Logout user

### Email
- POST /email/send - Send an email
- GET /email/quota - Get email quota status

## Email Quota Management

The service implements a warmup strategy for email quotas:
- Starting quota: 10 emails per day
- Maximum quota: 100 emails per day
- Warmup period: 30 days
- Linear increase from starting to maximum quota

## Development

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run serve
```

## Building for Production

```bash
npm run build
```

This will build both the backend and frontend for production deployment.

## License

MIT 