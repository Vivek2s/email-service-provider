import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@sendinblue/client';
import { emailQueue } from './queue';
import { logger } from '../utils/logger';
import { User } from '../models/user';

// Initialize Brevo API client
const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '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');

const DAILY_QUOTA = parseInt(process.env.DAILY_EMAIL_QUOTA || '100');
const WARMUP_START = parseInt(process.env.EMAIL_WARMUP_START || '10');
const WARMUP_DAYS = parseInt(process.env.EMAIL_WARMUP_DAYS || '30');

// List of throwaway email domains
const THROWAWAY_DOMAINS = [
  'tempmail.com',
  'throwawaymail.com',
  'temp-mail.org',
  'tempmail.net',
  'disposablemail.com'
];

// const CONFIGURED_USERS = [
//   {
//     tenantId: 'tenant007',
//     userId: 'DonJon',
//     expectedProvider: 'gmail'    // This user must connect Gmail
//   },
//   {
//     tenantId: 'tenant007',
//     userId: 'JaneSmith',
//     expectedProvider: 'outlook'  // This user must connect Outlook
//   }
// ];

const isThrowawayEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return THROWAWAY_DOMAINS.includes(domain || '');
};

const getDailyQuota = async (tenantId: string): Promise<number> => {
  try {
    const key = `quota:${tenantId}:${new Date().toISOString().split('T')[0]}`;
    const currentCount = await emailQueue.get(key);
    
    if (!currentCount) {
      // Calculate warmup quota based on days since tenant creation
      const tenant = await User.findOne({ tenantId });
      if (!tenant) return WARMUP_START;
      
      const daysSinceCreation = Math.floor(
        (Date.now() - tenant.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const warmupQuota = Math.min(
        WARMUP_START + Math.floor(daysSinceCreation * (DAILY_QUOTA - WARMUP_START) / WARMUP_DAYS),
        DAILY_QUOTA
      );
      
      await emailQueue.set(key, '0');
      await emailQueue.expire(key, 24 * 60 * 60); // 24 hours
      return warmupQuota;
    }
    
    return DAILY_QUOTA - parseInt(currentCount);
  } catch (error) {
    logger.error('Error getting daily quota:', error);
    return 0;
  }
};

const incrementDailyQuota = async (tenantId: string): Promise<void> => {
  try {
    const key = `quota:${tenantId}:${new Date().toISOString().split('T')[0]}`;
    await emailQueue.incr(key);
  } catch (error) {
    logger.error('Error incrementing daily quota:', error);
  }
};

export const processEmailQueue = async (): Promise<void> => {
  while (true) {
    try {
      const email = await emailQueue.getNextEmail();
      if (!email) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before checking again
        continue;
      }

      // Check if email is from throwaway domain
      if (isThrowawayEmail(email.toAddress)) {
        logger.warn('Rejected throwaway email:', email.toAddress);
        continue;
      }

      // Check quota
      const remainingQuota = await getDailyQuota(email.tenantId);
      if (remainingQuota <= 0) {
        logger.warn('Daily quota exceeded for tenant:', email.tenantId);
        await emailQueue.requeueEmail(email);
        continue;
      }

      // Send email using Brevo
      try {
        const sender = { email: email.fromAddress, name: email.fromAddress.split('@')[0] };
        const receivers = [{ email: email.toAddress }];
        
        console.log('Sending email to:', receivers, sender);
        const sendEmailRequest = new SendSmtpEmail();
        sendEmailRequest.subject = email.subject;
        sendEmailRequest.htmlContent = email.body;
        sendEmailRequest.sender = sender;
        sendEmailRequest.to = receivers;

        await apiInstance.sendTransacEmail(sendEmailRequest);
        
        await incrementDailyQuota(email.tenantId);
        logger.info('Email sent successfully:', email.toAddress);
      } catch (error) {
        logger.error('Error sending email:', error);
        if ((email.retryCount || 0) < 3) {
          await emailQueue.requeueEmail(email);
        }
      }
    } catch (error) {
      logger.error('Error processing email queue:', error);
    }
  }
}; 