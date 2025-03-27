import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

interface EmailEvent {
  toAddress: string;
  tenantId: string;
  userId: string;
  subject: string;
  fromAddress: string;
  body: string;
  retryCount?: number;
  timestamp?: number;
}

const redisClient: RedisClientType = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err: Error) => {
  logger.error('Redis Client Error:', err);
});

// Only log the initial connection
redisClient.on('connect', () => {
  if (!redisClient.isOpen) {
    logger.info('Connected to Redis');
  }
});

export const emailQueue = {
  async addToQueue(event: EmailEvent): Promise<void> {
    try {
      await redisClient.connect();
      await redisClient.lPush('email:queue', JSON.stringify({
        ...event,
        retryCount: 0,
        timestamp: Date.now()
      }));
      logger.info('Added email to queue:', event);
    } catch (error) {
      logger.error('Error adding to queue:', error);
      throw error;
    } finally {
      await redisClient.disconnect();
    }
  },

  async getNextEmail(): Promise<EmailEvent | null> {
    try {
      await redisClient.connect();
      const email = await redisClient.rPop('email:queue');
      if (email) {
        return JSON.parse(email);
      }
      return null;
    } catch (error) {
      logger.error('Error getting next email:', error);
      throw error;
    } finally {
      await redisClient.disconnect();
    }
  },

  async requeueEmail(event: EmailEvent): Promise<void> {
    try {
      await redisClient.connect();
      const updatedEvent = {
        ...event,
        retryCount: (event.retryCount || 0) + 1,
        timestamp: Date.now()
      };
      await redisClient.lPush('email:queue', JSON.stringify(updatedEvent));
      logger.info('Requeued email:', updatedEvent);
    } catch (error) {
      logger.error('Error requeueing email:', error);
      throw error;
    } finally {
      await redisClient.disconnect();
    }
  },

  // Redis client methods
  async get(key: string): Promise<string | null> {
    try {
      await redisClient.connect();
      return await redisClient.get(key);
    } finally {
      await redisClient.disconnect();
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await redisClient.connect();
      await redisClient.set(key, value);
    } finally {
      await redisClient.disconnect();
    }
  },

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await redisClient.connect();
      await redisClient.expire(key, seconds);
    } finally {
      await redisClient.disconnect();
    }
  },

  async incr(key: string): Promise<void> {
    try {
      await redisClient.connect();
      await redisClient.incr(key);
    } finally {
      await redisClient.disconnect();
    }
  }
}; 