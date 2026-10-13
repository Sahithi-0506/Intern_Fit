import { Router } from 'express';
import { internshipController } from '../controllers/internshipController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public discovery routes (optional auth to attach bookmark/applied status)
router.get('/', (req, res, next) => {
  // If authorization header or cookie is present, run authMiddleware softly
  if (req.cookies?.token || req.headers.authorization) {
    return authMiddleware(req, res, () => internshipController.getInternships(req, res, next));
  }
  return internshipController.getInternships(req, res, next);
});

router.get('/saved', authMiddleware, internshipController.getSavedInternships);

router.get('/:id', (req, res, next) => {
  if (req.cookies?.token || req.headers.authorization) {
    return authMiddleware(req, res, () => internshipController.getInternshipById(req, res, next));
  }
  return internshipController.getInternshipById(req, res, next);
});

router.get('/:id/apply-url', internshipController.getSafeApplyUrl);
router.post('/:id/save', authMiddleware, internshipController.toggleSave);

export default router;
