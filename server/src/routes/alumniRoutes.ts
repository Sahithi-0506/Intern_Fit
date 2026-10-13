import { Router } from 'express';
import { alumniController } from '../controllers/alumniController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('alumni'));

// Alumni Access Requests
router.post('/request-access', alumniController.requestAccess);
router.get('/access-status', alumniController.getAccessStatus);

// Alumni Reviews
router.post('/reviews', alumniController.submitReview);
router.get('/my-reviews', alumniController.getMyReviews);
router.delete('/reviews/:id', alumniController.withdrawReview);
router.put('/reviews/:id', alumniController.updatePendingReview);

export default router;
