import express from 'express';
import passport from 'passport';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/user';
import { EmailCredential } from '../models/emailCredential';
import { logger } from '../utils/logger';
import tenantsConfig from '../config/tenants.json';

// Types for tenant configuration
interface QuotaConfig {
  daily: number;
  warmupStart: number;
  warmupDays: number;
}

interface TenantConfig {
  name: string;
  domain: string;
  quota: QuotaConfig;
}

interface TenantsConfig {
  [key: string]: TenantConfig;
}

// Extend Express Session
declare module 'express-session' {
  interface SessionData {
    tenantId?: string;
  }
}

// Extend Express User
declare global {
  namespace Express {
    interface User extends IUser {
      accessToken?: string;
      refreshToken?: string;
    }
  }
}

const router = express.Router();

// Helper function to find tenant by email domain
const findTenantByEmail = (email: string): { tenantId: string; config: TenantConfig } | null => {
  const domain = email.split('@')[1];
  for (const [tenantId, config] of Object.entries(tenantsConfig as TenantsConfig)) {
    if (config.domain === domain) {
      return { tenantId, config };
    }
  }
  return null;
};

// Middleware to verify JWT token
const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Invalid token format' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { 
      id: string;
      tenantId: string;
      userId: string;
    };
    req.user = { 
      _id: decoded.id,
      tenantId: decoded.tenantId,
      email: decoded.userId
    } as IUser;
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/me', verifyToken, async (req, res) => {
  try {
    console.log('Getting user info for:', req.user?._id);
    
    // Get email credentials
    const emailCredential = await EmailCredential.findOne({
      tenantId: req.user?.tenantId,
      userId: req.user?.email
    }).select('-accessToken -refreshToken');

    if (!emailCredential) {
      console.log('No email credentials found for user');
      return res.status(404).json({ error: 'User not found' });
    }

    // Get quota configuration
    const tenants = tenantsConfig as TenantsConfig;
    const tenantConfig = req.user?.tenantId ? tenants[req.user.tenantId] : undefined;

    const userInfo = {
      id: req.user?._id,
      email: req.user?.email,
      tenantId: req.user?.tenantId,
      provider: emailCredential.provider,
      quota: tenantConfig?.quota
    };

    console.log('Returning user info:', userInfo);
    return res.json(userInfo);
  } catch (error) {
    logger.error('Error getting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
// Start OAuth flow
router.get('/:provider',
  passport.authenticate('google', { 
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'] 
  })
);

// OAuth callback
router.get('/:provider/callback',
  (req, res, next) => {
    const provider = req.params.provider;
    console.log('Starting OAuth callback for provider:', provider);
    passport.authenticate(provider, { 
      failureRedirect: '/login',
      session: false // Disable session since we're using JWT
    })(req, res, next);
  },
  async (req, res) => {
    try {
      console.log('OAuth callback received user:', req.user);
      
      if (!req.user || !req.user.email) {
        console.log('No user or email found in request');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=auth_failed`);
      }

      // Find tenant based on email domain
      const tenantInfo = findTenantByEmail(req.user.email);
      console.log('Found tenant info:', tenantInfo);
      
      if (!tenantInfo) {
        console.log('No tenant found for email:', req.user.email);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=invalid_domain`);
      }

      // Store email credentials
      console.log('Storing email credentials for:', req.user.email);
      await EmailCredential.findOneAndUpdate(
        { email: req.user.email },
        {
          tenantId: tenantInfo.tenantId,
          userId: req.user.email,
          provider: 'google',
          email: req.user.email,
          accessToken: req.user.accessToken || '',
          refreshToken: req.user.refreshToken || ''
        },
        { upsert: true, new: true }
      );

      const secretKey = Buffer.from(process.env.JWT_SECRET || 'your-secret-key');
      const options: SignOptions = {
        expiresIn: 24 * 60 * 60 // 24 hours in seconds
      };

      const token = jwt.sign(
        { 
          id: req.user._id,
          tenantId: tenantInfo.tenantId,
          userId: req.user.email
        },
        secretKey,
        options
      );
      
      console.log('Generated JWT token, redirecting to frontend');
      // Redirect to frontend with token
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=server_error`);
    }
  }
);
// Logout
router.post('/logout', (_req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

export default router; 