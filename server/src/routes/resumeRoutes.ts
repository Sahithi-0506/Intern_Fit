import { Router } from 'express';
import { resumeController } from '../controllers/resumeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { uploadResume } from '../middleware/uploadMiddleware';

const router = Router();

// Strictly restricted to students
router.use(authMiddleware);
router.use(requireRole('student'));

router.post('/upload', uploadResume.single('resume'), resumeController.upload);
router.get('/my-resume', resumeController.getMyResume);
router.delete('/', resumeController.deleteResume);
router.post('/analyze-match/:internshipId', resumeController.analyzeMatch);

export default router;
