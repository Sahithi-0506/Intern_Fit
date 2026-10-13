import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  createReviewSchema,
  requestAlumniAccessSchema,
  AlumniReview,
} from '@internfit/shared';
import { reviewRepository } from '../repositories/reviewRepository';
import { userRepository } from '../repositories/userRepository';
import { notificationRepository } from '../repositories/notificationRepository';

export const alumniController = {
  // =========================================================================
  // 1. ALUMNI ACCESS WORKFLOW
  // =========================================================================

  async requestAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { requestNote } = requestAlumniAccessSchema.parse(req.body);

      const profile = await userRepository.getAlumniProfile(userId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Alumni profile not found.' });
        return;
      }

      const request = await userRepository.createAlumniAccessRequest(userId, requestNote);

      await notificationRepository.createNotification(
        userId,
        'Alumni Access Request Submitted',
        'Your request for alumni verification has been submitted to the Admin / Placement Cell for review.',
        'info',
        '/alumni/dashboard'
      );

      res.status(201).json({
        success: true,
        message: 'Your access request has been submitted to the Admin / Placement Cell for verification.',
        request,
      });
    } catch (err) {
      next(err);
    }
  },

  async getAccessStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await userRepository.getAlumniProfile(userId);
      const latestRequest = await userRepository.getAlumniAccessRequestByUserId(userId);

      res.json({
        success: true,
        profile,
        verificationStatus: profile?.verificationStatus || 'not_requested',
        rejectionReason: profile?.rejectionReason || null,
        latestRequest,
      });
    } catch (err) {
      next(err);
    }
  },

  // =========================================================================
  // 2. REVIEWS MANAGEMENT
  // =========================================================================

  async submitReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createReviewSchema.parse(req.body);
      const userId = req.user!.id;

      // Ensure user is verified alumni
      const alumniProfile = await userRepository.getAlumniProfile(userId);
      if (!alumniProfile || alumniProfile.verificationStatus !== 'approved') {
        res.status(403).json({
          success: false,
          message:
            'Review submission is restricted to approved alumni. ' +
            'Please request alumni access from the Admin / Placement Cell and wait for approval.',
        });
        return;
      }

      const review: AlumniReview = {
        id: uuidv4(),
        userId,
        internshipId: data.internshipId || null,
        companyName: data.companyName,
        reviewText: data.reviewText,
        applicationAdvice: data.applicationAdvice || null,
        workCultureRating: data.workCultureRating || null,
        learningRating: data.learningRating || null,
        isAnonymous: data.isAnonymous,
        moderationStatus: 'pending', // Requires Admin / Placement Cell review
        moderationNotes: null,
        createdAt: new Date().toISOString(),
      };

      await reviewRepository.createReview(review);

      // Create notification for alumni
      await notificationRepository.createNotification(
        userId,
        'Review Submitted for Moderation',
        `Your experience review for ${data.companyName} has been received and will be visible to students once approved by the Admin / Placement Cell.`,
        'info',
        '/alumni/reviews'
      );

      res.status(201).json({
        success: true,
        message: 'Your review has been submitted successfully and is pending Admin / Placement Cell moderation.',
        review,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMyReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const myReviews = await reviewRepository.getReviewsByUserId(userId);
      res.json({ success: true, items: myReviews });
    } catch (err) {
      next(err);
    }
  },

  async withdrawReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const reviewId = req.params.id as string;

      const deleted = await reviewRepository.deletePendingReview(reviewId, userId);
      if (!deleted) {
        res.status(400).json({
          success: false,
          message: 'Unable to withdraw review. Only reviews that are still in "pending" status can be withdrawn.',
        });
        return;
      }

      res.json({ success: true, message: 'Your pending review has been withdrawn.' });
    } catch (err) {
      next(err);
    }
  },

  async updatePendingReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const reviewId = req.params.id as string;
      const updateData = req.body;

      const updated = await reviewRepository.updatePendingReview(reviewId, userId, updateData);
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'Unable to edit review. Only reviews that are still in "pending" status can be edited.',
        });
        return;
      }

      res.json({ success: true, message: 'Your pending review has been updated.' });
    } catch (err) {
      next(err);
    }
  },
};
