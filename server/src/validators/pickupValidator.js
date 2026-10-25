import { body, param } from 'express-validator';
import { WASTE_CATEGORIES, TIME_SLOTS } from '../config/constants.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';

export const validateCreatePickup = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Waste category is required')
    .isIn(WASTE_CATEGORIES)
    .withMessage(`Category must be one of: ${WASTE_CATEGORIES.join(', ')}`),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Pickup address is required')
    .isLength({ min: 5, max: 250 })
    .withMessage('Address must be between 5 and 250 characters'),

  body('preferredDate')
    .notEmpty()
    .withMessage('Preferred pickup date is required')
    .isISO8601()
    .withMessage('Preferred date must be a valid date format (YYYY-MM-DD)')
    .toDate(),

  body('timeSlot')
    .trim()
    .notEmpty()
    .withMessage('Time slot is required')
    .isIn(TIME_SLOTS)
    .withMessage(`Time slot must be one of: ${TIME_SLOTS.join(', ')}`),

  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Instructions cannot exceed 500 characters'),

  handleValidationErrors
];

export const validateUpdatePickup = [
  param('id')
    .isMongoId()
    .withMessage('Invalid pickup request ID format'),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 250 }),

  body('preferredDate')
    .optional()
    .isISO8601()
    .toDate(),

  body('timeSlot')
    .optional()
    .trim()
    .isIn(TIME_SLOTS),

  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 500 }),

  handleValidationErrors
];
