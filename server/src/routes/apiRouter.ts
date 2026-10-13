import { Router } from 'express';
import authRoutes from './authRoutes';
import internshipRoutes from './internshipRoutes';
import adminPlacementRoutes from './adminPlacementRoutes';
import riskRoutes from './riskRoutes';
import resumeRoutes from './resumeRoutes';
import applicationRoutes from './applicationRoutes';
import alumniRoutes from './alumniRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/internships', internshipRoutes);
router.use('/admin-placement', adminPlacementRoutes);
router.use('/placement', adminPlacementRoutes);
router.use('/admin', adminPlacementRoutes);
router.use('/risk', riskRoutes);
router.use('/resume', resumeRoutes);
router.use('/applications', applicationRoutes);
router.use('/alumni', alumniRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'InternFit API Backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

export default router;
