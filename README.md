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

3. Set up Google OAuth credentials:
   - Create a new project in Google Cloud Console
   - Enable the Gmail API
   - Create OAuth 2.0 credentials
   - Download the credentials file and save it as `backend/src/google/credential.json`

4. Configure environment variables:

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

5. Start the development servers:
```bash
npm run dev
```