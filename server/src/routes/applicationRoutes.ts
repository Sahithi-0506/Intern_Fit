import { Router } from 'express';
import { applicationController } from '../controllers/applicationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

// Strictly restricted to students
router.use(authMiddleware);
router.use(requireRole('student'));

router.post('/record', applicationController.recordSelfReported);
router.get('/', applicationController.getUserApplications);
router.get('/dashboard-stats', applicationController.getDashboardStats);
router.patch('/:id/notes', applicationController.updateNotes);
router.patch('/:id/status', applicationController.updateStatus);

export default router;
