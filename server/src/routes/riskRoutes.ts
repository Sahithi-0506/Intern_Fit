import { Router } from 'express';
import { urlRiskController } from '../controllers/urlRiskController';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

const riskLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxHits: 15,
  message: 'URL risk analysis rate limit exceeded. Please wait a minute before checking another link.',
});

router.post('/check-url', riskLimiter, (req, res, next) => {
  if (req.cookies?.token || req.headers.authorization) {
    return authMiddleware(req, res, () => urlRiskController.evaluateUrl(req, res, next));
  }
  return urlRiskController.evaluateUrl(req, res, next);
});

router.get('/assessments/:id', urlRiskController.getAssessment);

export default router;
