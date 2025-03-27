import express from 'express';
import { emailQueue } from '../services/queue';
import { logger } from '../utils/logger';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';

const router = express.Router();

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    req.user = { _id: decoded.id } as any;
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Send email
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { toAddress, subject, body } = req.body;
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // if (!user.tenantId || !user.userId) {
    //   return res.status(400).json({ error: 'User not properly configured' });
    // }

    const emailEvent = {
      toAddress,
      tenantId: user.tenantId ?? "tenant",
      userId: user.userId ?? "user",
      fromAddress: user.email,
      subject,
      body
    };

    await emailQueue.addToQueue(emailEvent);
    logger.info('Email queued for sending:', emailEvent);

    return res.json({ message: 'Email queued successfully' });
  } catch (error) {
    logger.error('Error queueing email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get email quota status
router.get('/quota', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.tenantId) {
      return res.status(400).json({ error: 'User not properly configured' });
    }

    // Get remaining quota from Redis
    const redisClient = require('redis').createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    });

    await redisClient.connect();
    const key = `quota:${user.tenantId}:${new Date().toISOString().split('T')[0]}`;
    const currentCount = await redisClient.get(key);
    await redisClient.disconnect();

    console.log('Current count:', currentCount);
    const dailyQuota = parseInt(process.env.DAILY_EMAIL_QUOTA || '100');
    const remainingQuota = currentCount ? dailyQuota - parseInt(currentCount) : dailyQuota;

    return res.json({
      dailyQuota,
      remainingQuota,
      usedQuota: dailyQuota - remainingQuota
    });
  } catch (error) {
    logger.error('Error getting quota status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 