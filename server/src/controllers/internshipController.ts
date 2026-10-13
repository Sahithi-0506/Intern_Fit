import { Request, Response, NextFunction } from 'express';
import { internshipRepository } from '../repositories/internshipRepository';
import { reviewRepository } from '../repositories/reviewRepository';
import { URL } from 'url';

export const internshipController = {
  async getInternships(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, city, workMode, category, isStipendDisclosed, limit, offset } = req.query;

      const result = await internshipRepository.getAll(
        {
          search: search as string,
          city: city as string,
          workMode: workMode as string,
          category: category as string,
          isStipendDisclosed: isStipendDisclosed === 'true' ? true : undefined,
          limit: limit ? parseInt(limit as string, 10) : 20,
          offset: offset ? parseInt(offset as string, 10) : 0,
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

  async getInternshipById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const internship = await internshipRepository.getById(id, req.user?.id);

      if (!internship) {
        res.status(404).json({ success: false, message: 'Internship opportunity not found.' });
        return;
      }

      // Fetch verified alumni reviews for this internship/company
      const reviews = await reviewRepository.getApprovedReviewsForInternship(internship.id, internship.companyName);

      res.json({
        success: true,
        internship,
        reviews,
      });
    } catch (err) {
      next(err);
    }
  },

  async getSafeApplyUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const internship = await internshipRepository.getById(id);

      if (!internship) {
        res.status(404).json({ success: false, message: 'Internship not found.' });
        return;
      }

      const rawUrl = internship.originalApplicationUrl;
      let parsed: URL;
      try {
        parsed = new URL(rawUrl);
      } catch {
        res.status(400).json({ success: false, message: 'Stored destination URL is malformed.' });
        return;
      }

      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        res.status(400).json({ success: false, message: 'Unsafe URL scheme detected.' });
        return;
      }

      res.json({
        success: true,
        destinationUrl: rawUrl,
        destinationDomain: parsed.hostname,
        companyName: internship.companyName,
        title: internship.title,
        disclaimer:
          'InternFit is redirecting you to the external employer application portal. ' +
          'InternFit does not transmit your personal data or resume externally. ' +
          'After submitting your application on the official site, return here and click "I\'ve Applied" to record your application.',
      });
    } catch (err) {
      next(err);
    }
  },

  async toggleSave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;

      const internship = await internshipRepository.getById(id);
      if (!internship) {
        res.status(404).json({ success: false, message: 'Internship not found.' });
        return;
      }

      if (internship.isSaved) {
        await internshipRepository.unsaveInternship(userId, id);
        res.json({ success: true, isSaved: false, message: 'Removed from saved internships.' });
      } else {
        await internshipRepository.saveInternship(userId, id);
        res.json({ success: true, isSaved: true, message: 'Internship saved to your bookmarks.' });
      }
    } catch (err) {
      next(err);
    }
  },

  async getSavedInternships(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const saved = await internshipRepository.getSavedInternships(userId);
      res.json({ success: true, items: saved });
    } catch (err) {
      next(err);
    }
  },
};
