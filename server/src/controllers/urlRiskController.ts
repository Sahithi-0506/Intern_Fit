import { Request, Response, NextFunction } from 'express';
import { checkUrlRiskSchema } from '@internfit/shared';
import { checkUrlRisk } from '../services/urlRiskService';
import { riskRepository } from '../repositories/riskRepository';

export const urlRiskController = {
  async evaluateUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = checkUrlRiskSchema.parse(req.body);
      const userId = req.user?.id || null;

      const assessment = await checkUrlRisk(url, userId);
      await riskRepository.saveAssessment(assessment);

      res.json({
        success: true,
        assessment,
        limitationNotice:
          'This assessment is derived strictly from observable network indicators, domain alignment, and text evidence. ' +
          'A lower observed risk score does not guarantee employment authenticity. Always verify postings on official corporate channels.',
      });
    } catch (err: any) {
      next(err);
    }
  },

  async getAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const assessment = await riskRepository.getById(id);

      if (!assessment) {
        res.status(404).json({ success: false, message: 'Risk assessment record not found.' });
        return;
      }

      res.json({ success: true, assessment });
    } catch (err) {
      next(err);
    }
  },
};
