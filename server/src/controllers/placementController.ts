import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createInternshipSchema, ListingStatus } from '@internfit/shared';
import { internshipRepository } from '../repositories/internshipRepository';

export const placementController = {
  async getPlacementListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const result = await internshipRepository.getAll(
        {
          status: status as ListingStatus | undefined,
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

  async createListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createInternshipSchema.parse(req.body);
      const internshipId = `int-${uuidv4().substring(0, 8)}`;
      const reviewerUserId = req.user!.id;

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
        message: 'Internship opportunity created successfully and recorded with placement-cell verification.',
        internshipId,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateListingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ success: false, message: 'Status is required.' });
        return;
      }

      await internshipRepository.updateStatus(id, status as ListingStatus);
      res.json({ success: true, message: `Listing status updated to ${status}.` });
    } catch (err) {
      next(err);
    }
  },
};
