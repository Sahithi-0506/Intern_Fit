import { Request, Response, NextFunction } from 'express';
import { recordApplicationSchema, updateApplicationNotesSchema, updateApplicationStatusSchema } from '@internfit/shared';
import { applicationRepository } from '../repositories/applicationRepository';
import { internshipRepository } from '../repositories/internshipRepository';
import { userRepository } from '../repositories/userRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { sendEmail } from '../config/email';
import { URL } from 'url';

export const applicationController = {
  async recordSelfReported(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = recordApplicationSchema.parse(req.body);
      const userId = req.user!.id;

      const internship = await internshipRepository.getById(data.internshipId);
      if (!internship) {
        res.status(404).json({ success: false, message: 'Internship opportunity not found.' });
        return;
      }

      let destinationDomain = 'external-portal';
      try {
        destinationDomain = new URL(internship.originalApplicationUrl).hostname;
      } catch {
        destinationDomain = 'external-portal';
      }

      const application = await applicationRepository.recordApplication(
        userId,
        data.internshipId,
        data.externalPlatform,
        destinationDomain,
        data.notes
      );

      // Create in-app notification
      await notificationRepository.createNotification(
        userId,
        'Application Recorded',
        `You marked having applied to ${internship.title} at ${internship.companyName} via ${data.externalPlatform}.`,
        'success',
        '/applications'
      );

      // Send self-reported confirmation email
      const user = await userRepository.findById(userId);
      if (user) {
        const emailContent = {
          to: user.email,
          subject: `Application Recorded: ${internship.title} at ${internship.companyName}`,
          text:
            `Hi ${user.firstName},\n\n` +
            `InternFit has recorded your self-reported application for:\n` +
            `Role: ${internship.title}\n` +
            `Company: ${internship.companyName}\n` +
            `Platform: ${data.externalPlatform}\n\n` +
            `IMPORTANT NOTICE: This confirmation records that you marked this application as submitted. ` +
            `InternFit does not independently verify whether the external employer received or approved your submission. ` +
            `Please monitor your email and the employer portal for official hiring updates.`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f766e;">Application Recorded</h2>
              <p>Hi ${user.firstName},</p>
              <p>InternFit has recorded your self-reported confirmation for the following internship:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <tr><td style="padding: 8px; font-weight: bold; width: 30%;">Role:</td><td style="padding: 8px;">${internship.title}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Company:</td><td style="padding: 8px;">${internship.companyName}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Destination:</td><td style="padding: 8px;">${data.externalPlatform} (${destinationDomain})</td></tr>
              </table>
              <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 12px; margin-top: 15px; font-size: 13px; color: #475569;">
                <strong>Notice:</strong> This email confirms that you recorded this external application in your InternFit tracker.
                InternFit does not independently verify whether the employer portal received or accepted your application.
              </div>
            </div>
          `,
        };

        const result = await sendEmail(emailContent);
        await notificationRepository.recordOutbox(
          user.email,
          emailContent.subject,
          emailContent.html,
          emailContent.text,
          result.status,
          result.error
        );
      }

      res.status(201).json({
        success: true,
        message: 'Your self-reported application has been safely recorded in your tracker.',
        application,
      });
    } catch (err) {
      next(err);
    }
  },

  async getUserApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const applications = await applicationRepository.getUserApplications(userId);
      res.json({ success: true, items: applications });
    } catch (err) {
      next(err);
    }
  },

  async updateNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { notes } = updateApplicationNotesSchema.parse(req.body);

      await applicationRepository.updateNotes(id, notes);
      res.json({ success: true, message: 'Notes updated successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, notes } = updateApplicationStatusSchema.parse(req.body);

      await applicationRepository.updateStatus(id, status, notes);
      res.json({ success: true, message: `Application status updated to ${status}.` });
    } catch (err) {
      next(err);
    }
  },

  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await applicationRepository.getDashboardStats(userId);
      res.json({ success: true, stats });
    } catch (err) {
      next(err);
    }
  },
};
