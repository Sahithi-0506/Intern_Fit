import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/userRepository';
import { reviewRepository } from '../repositories/reviewRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { ModerationStatus } from '@internfit/shared';

export const adminController = {
  // Domain Allowlist
  async getDomains(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const domains = await userRepository.getAllowedDomains();
      res.json({ success: true, items: domains });
    } catch (err) {
      next(err);
    }
  },

  async addDomain(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { domain, collegeName } = req.body;
      if (!domain || !collegeName) {
        res.status(400).json({ success: false, message: 'Both domain and college name are required.' });
        return;
      }
      await userRepository.addAllowedDomain(domain, collegeName);
      res.status(201).json({ success: true, message: `Domain ${domain} added to approved allowlist.` });
    } catch (err) {
      next(err);
    }
  },

  // Alumni Verification
  async getAlumniList(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alumni = await userRepository.getAllAlumni();
      res.json({ success: true, items: alumni });
    } catch (err) {
      next(err);
    }
  },

  async decideAlumniStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { status, rejectionReason } = req.body;

      if (status !== 'approved' && status !== 'rejected') {
        res.status(400).json({ success: false, message: 'Status must be "approved" or "rejected".' });
        return;
      }

      await userRepository.upsertAlumniProfile(userId, {
        verificationStatus: status,
        rejectionReason: status === 'rejected' ? rejectionReason || 'Information could not be verified' : null,
      });

      // Send in-app notification to alumni
      await notificationRepository.createNotification(
        userId,
        status === 'approved' ? 'Alumni Profile Approved!' : 'Alumni Profile Verification Update',
        status === 'approved'
          ? 'Your alumni credentials have been verified by the placement cell. You may now post reviews and mentor students.'
          : `Your alumni verification was not approved: ${rejectionReason || 'Please verify your profile details.'}`,
        status === 'approved' ? 'success' : 'warning',
        '/alumni/dashboard'
      );

      res.json({ success: true, message: `Alumni verification status updated to ${status}.` });
    } catch (err) {
      next(err);
    }
  },

  // Review Moderation
  async getReviewsForModeration(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await reviewRepository.getAllReviewsForAdmin();
      res.json({ success: true, items: reviews });
    } catch (err) {
      next(err);
    }
  },

  async moderateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, notes } = req.body;
      const adminId = req.user!.id;

      if (!['approved', 'rejected', 'pending'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid moderation status.' });
        return;
      }

      await reviewRepository.updateModeration(id, status as ModerationStatus, notes, adminId);
      res.json({ success: true, message: `Review moderation status updated to ${status}.` });
    } catch (err) {
      next(err);
    }
  },

  // Outbox Logs
  async getOutboxLogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await notificationRepository.getOutboxList();
      res.json({ success: true, items: logs });
    } catch (err) {
      next(err);
    }
  },
};
