import { Router } from 'express';
import { adminPlacementController } from '../controllers/adminPlacementController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

// Strictly restricted to unified role 'admin_placement_cell'
router.use(authMiddleware);
router.use(requireRole('admin_placement_cell'));

// Opportunities Management
router.get('/opportunities', adminPlacementController.getOpportunities);
router.post('/opportunities', adminPlacementController.createOpportunity);
router.patch('/opportunities/:id/status', adminPlacementController.updateOpportunityStatus);
router.put('/opportunities/:id/status', adminPlacementController.updateOpportunityStatus);
router.put('/opportunities/:id', adminPlacementController.updateOpportunity);
router.delete('/opportunities/:id', adminPlacementController.deleteOpportunity);

// Also support legacy /listings alias
router.get('/listings', adminPlacementController.getOpportunities);
router.post('/listings', adminPlacementController.createOpportunity);
router.patch('/listings/:id/status', adminPlacementController.updateOpportunityStatus);

// Alumni Access Requests & Management
router.get('/alumni/requests', adminPlacementController.getAlumniRequests);
router.post('/alumni/requests/:requestId/decision', adminPlacementController.decideAlumniRequest);
router.get('/alumni', adminPlacementController.getAllAlumni);
router.post('/alumni/:userId/approve', adminPlacementController.approveAlumniAccess);
router.post('/alumni/:userId/revoke', adminPlacementController.revokeAlumniAccess);

// Review Moderation
router.get('/reviews', adminPlacementController.getReviewsForModeration);
router.post('/reviews/:id/decision', adminPlacementController.moderateReview);
router.patch('/reviews/:id/decision', adminPlacementController.moderateReview);

// Domain Allowlist & Logs
router.get('/domains', adminPlacementController.getDomains);
router.post('/domains', adminPlacementController.addDomain);
router.get('/outbox', adminPlacementController.getOutboxLogs);
router.get('/smtp/status', adminPlacementController.getSmtpStatus);
router.post('/smtp/test', adminPlacementController.testEmail);

export default router;
