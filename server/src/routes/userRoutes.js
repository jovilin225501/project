import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateUpdateProfile, validateChangePassword } from '../validators/userValidator.js';

const router = express.Router();

router.use(protect);

router.get('/me', getProfile);
router.patch('/me', validateUpdateProfile, updateProfile);
router.post('/change-password', validateChangePassword, changePassword);

export default router;
