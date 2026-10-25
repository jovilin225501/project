import express from 'express';
import {
  createPickup,
  getMyPickups,
  getPickupById,
  updatePickup
} from '../controllers/pickupController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateCreatePickup, validateUpdatePickup } from '../validators/pickupValidator.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(validateCreatePickup, createPickup)
  .get(getMyPickups);

router
  .route('/:id')
  .get(getPickupById)
  .patch(validateUpdatePickup, updatePickup);

export default router;
