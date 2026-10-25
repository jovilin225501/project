import express from 'express';
import {
  createReport,
  getMyReports,
  getReportById,
  updateReport,
  deleteReport
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';
import { validateCreateReport, validateUpdateReport } from '../validators/reportValidator.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(upload.single('image'), validateCreateReport, createReport)
  .get(getMyReports);

router
  .route('/:id')
  .get(getReportById)
  .patch(upload.single('image'), validateUpdateReport, updateReport)
  .delete(deleteReport);

export default router;
