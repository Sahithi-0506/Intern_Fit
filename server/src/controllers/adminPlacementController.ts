import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  createInternshipSchema,
  ListingStatus,
  ModerationStatus,
  moderateAlumniRequestSchema,
  moderateReviewSchema,
} from '@internfit/shared';
import { internshipRepository } from '../repositories/internshipRepository';
import { userRepository } from '../repositories/userRepository';
import { reviewRepository } from '../repositories/reviewRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { sendEmail, verifySmtpConnection } from '../config/email';

export const adminPlacementController = {
  // =========================================================================
  // 1. OPPORTUNITIES MANAGEMENT
  // =========================================================================

  async getOpportunities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, search, city } = req.query;
      const result = await internshipRepository.getAll(
        {
          status: status as ListingStatus | undefined,
          search: search as string | undefined,
          city: city as string | undefined,
          limit: 100,
        },
        req.user?.id
      );

      res.json({
        success: true,
        items: result.items,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  async createOpportunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createInternshipSchema.parse(req.body);
      const internshipId = `int-${uuidv4().substring(0, 8)}`;
      const reviewerUserId = req.user!.id;

      if (data.applicationDeadline) {
        const d = new Date(data.applicationDeadline);
        if (isNaN(d.getTime())) {
          res.status(400).json({ success: false, message: 'Invalid application deadline format. Please provide a valid date.' });
          return;
        }
      }
      if (data.startDate) {
        const d = new Date(data.startDate);
        if (isNaN(d.getTime())) {
          res.status(400).json({ success: false, message: 'Invalid start date format. Please provide a valid date.' });
          return;
        }
      }

      const skills = [
        ...data.requiredSkills.map(s => ({ internshipId, skillName: s, skillType: 'required' as const })),
        ...data.preferredSkills.map(s => ({ internshipId, skillName: s, skillType: 'preferred' as const })),
      ];

      const newListing = {
        id: internshipId,
        companyId: null,
        companyName: data.companyName,
        title: data.title,
        description: data.description,
        responsibilities: data.responsibilities || null,
        selectionProcess: data.selectionProcess || null,
        location: data.location,
        city: data.city,
        workMode: data.workMode,
        duration: data.duration,
        stipendAmount: data.stipendAmount,
        isStipendDisclosed: data.isStipendDisclosed,
        category: data.category,
        startDate: data.startDate || null,
        applicationDeadline: data.applicationDeadline || null,
        eligibleDegrees: data.eligibleDegrees,
        eligibleYears: data.eligibleYears,
        eligibleBranches: data.eligibleBranches,
        minCgpa: data.minCgpa ?? null,
        allowsBacklogs: data.allowsBacklogs,
        originalApplicationUrl: data.originalApplicationUrl,
        sourceType: data.sourceType,
        sourceUrl: data.sourceUrl,
        sourceEvidenceNotes: data.sourceEvidenceNotes || null,
        listingStatus: data.listingStatus,
        verificationStatus: data.verificationStatus,
        reviewedByUserId: reviewerUserId,
        reviewedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skills,
      };

      await internshipRepository.create(newListing);

      res.status(201).json({
        success: true,
        message: 'Internship opportunity created successfully and recorded with Admin / Placement Cell verification.',
        internshipId,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateOpportunityStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ success: false, message: 'Status is required.' });
        return;
      }

      await internshipRepository.updateStatus(id, status as ListingStatus);
      res.json({ success: true, message: `Opportunity listing status updated to ${status}.` });
    } catch (err) {
      next(err);
    }
  },

  async updateOpportunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      if (req.body.applicationDeadline) {
        const d = new Date(req.body.applicationDeadline);
        if (isNaN(d.getTime())) {
          res.status(400).json({ success: false, message: 'Invalid application deadline format. Please provide a valid date.' });
          return;
        }
      }
      if (req.body.startDate) {
        const d = new Date(req.body.startDate);
        if (isNaN(d.getTime())) {
          res.status(400).json({ success: false, message: 'Invalid start date format. Please provide a valid date.' });
          return;
        }
      }
      await internshipRepository.updateListing(id, req.body);
      res.json({ success: true, message: 'Opportunity listing updated successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async deleteOpportunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await internshipRepository.deleteListing(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Opportunity not found.' });
        return;
      }
      res.json({ success: true, message: 'Opportunity listing removed.' });
    } catch (err) {
      next(err);
    }
  },

  // =========================================================================
  // 2. ALUMNI ACCESS REQUESTS & MANAGEMENT
  // =========================================================================

  async getAlumniRequests(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await userRepository.getAllAlumniAccessRequests();
      res.json({ success: true, items: requests });
    } catch (err) {
      next(err);
    }
  },

  async decideAlumniRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestId = parseInt(req.params.requestId as string, 10);
      const data = moderateAlumniRequestSchema.parse(req.body);
      const adminId = req.user!.id;

      await userRepository.decideAlumniAccessRequest(requestId, data.status, adminId, data.decisionNotes);

      res.json({
        success: true,
        message: `Alumni access request decision recorded: ${data.status}.`,
      });
    } catch (err) {
      next(err);
    }
  },

  async getAllAlumni(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alumni = await userRepository.getAllAlumni();
      res.json({ success: true, items: alumni });
    } catch (err) {
      next(err);
    }
  },

  async revokeAlumniAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { notes } = req.body;
      const adminId = req.user!.id;

      await userRepository.revokeAlumniAccess(userId, adminId, notes || 'Access revoked by Admin / Placement Cell');

      await notificationRepository.createNotification(
        userId,
        'Alumni Access Revoked',
        `Your alumni review posting privileges have been revoked by the Placement Cell. Reason: ${notes || 'Administrative policy update.'}`,
        'warning',
        '/alumni/dashboard'
      );

      res.json({ success: true, message: 'Alumni access has been revoked.' });
    } catch (err) {
      next(err);
    }
  },

  async approveAlumniAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { notes } = req.body;
      const adminId = req.user!.id;

      await userRepository.approveAlumniAccess(userId, adminId, notes || 'Access approved by Admin / Placement Cell');

      await notificationRepository.createNotification(
        userId,
        'Alumni Access Approved',
        'Your alumni account has been approved by the Placement Cell. You can now submit internship reviews.',
        'success',
        '/alumni/dashboard'
      );

      res.json({ success: true, message: 'Alumni access has been approved.' });
    } catch (err) {
      next(err);
    }
  },

  // =========================================================================
  // 3. ALUMNI REVIEW MODERATION
  // =========================================================================

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
      const data = moderateReviewSchema.parse(req.body);
      const adminId = req.user!.id;

      await reviewRepository.updateModeration(id, data.status as ModerationStatus, data.moderationNotes, adminId);

      const review = await reviewRepository.getReviewById(id);
      if (review) {
        await notificationRepository.createNotification(
          review.userId,
          data.status === 'approved' ? 'Alumni Review Approved' : 'Alumni Review Moderation Update',
          data.status === 'approved'
            ? `Your review for ${review.companyName} has been approved by the Placement Cell and is now visible to students.`
            : `Your review for ${review.companyName} was not approved. Moderation note: ${data.moderationNotes || 'Does not meet campus review guidelines.'}`,
          data.status === 'approved' ? 'success' : 'warning',
          '/alumni/reviews'
        );
      }

      res.json({ success: true, message: `Review moderation status updated to ${data.status}.` });
    } catch (err) {
      next(err);
    }
  },

  // =========================================================================
  // 4. COLLEGE EMAIL DOMAINS & OUTBOX AUDIT LOGS
  // =========================================================================

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
      res.status(201).json({ success: true, message: `Domain ${domain} added to approved college allowlist.` });
    } catch (err) {
      next(err);
    }
  },

  async getOutboxLogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await notificationRepository.getOutboxList();
      res.json({ success: true, items: logs });
    } catch (err) {
      next(err);
    }
  },

  async getSmtpStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await verifySmtpConnection();
      res.json({ success: true, ...status });
    } catch (err) {
      next(err);
    }
  },

  async testEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recipient = (req.body.recipient || 'achyutha0506@gmail.com').trim();
      const testContent = {
        to: recipient,
        subject: 'InternFit SMTP STARTTLS Test Verification',
        text: 'This is a test notification confirming that InternFit Gmail SMTP STARTTLS (port 587) delivery is operating correctly.',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fbcfe8; border-radius: 8px; background-color: #fff8f9;">
            <h2 style="color: #e11d48;">InternFit SMTP Verification</h2>
            <p>This test email confirms that SMTP delivery on port 587 with STARTTLS is functional.</p>
            <p style="color: #64748b; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
          </div>
        `,
      };

      const result = await sendEmail(testContent);
      await notificationRepository.recordOutbox(
        recipient,
        testContent.subject,
        testContent.html,
        testContent.text,
        result.status,
        result.error
      );

      res.json({
        success: result.status === 'sent',
        status: result.status,
        message:
          result.status === 'sent'
            ? `Test email delivered successfully to ${recipient} via Gmail SMTP STARTTLS (port 587).`
            : result.status === 'dry_run_logged'
            ? 'SMTP credentials incomplete (SMTP_PASS is empty in server/.env). Email safely recorded in email_outbox in dry_run_logged mode.'
            : `Email delivery failed: ${result.error}`,
        error: result.error,
      });
    } catch (err) {
      next(err);
    }
  },
};
