import express from 'express';
import {
  getAdminDashboardStats,
  getAdminReports,
  updateReportStatus,
  getAdminUsers,
  toggleUserStatus
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/dashboard', getAdminDashboardStats);
router.get('/reports', getAdminReports);
router.patch('/reports/:id/status', updateReportStatus);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', toggleUserStatus);

export default router;
