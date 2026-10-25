import { body, param } from 'express-validator';
import { WASTE_CATEGORIES, URGENCY_LEVELS } from '../config/constants.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';

export const validateCreateReport = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Report title is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Waste category is required')
    .isIn(WASTE_CATEGORIES)
    .withMessage(`Category must be one of: ${WASTE_CATEGORIES.join(', ')}`),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Description must be between 5 and 1000 characters'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location or address is required')
    .isLength({ min: 3, max: 250 })
    .withMessage('Location must be between 3 and 250 characters'),

  body('urgency')
    .optional()
    .trim()
    .isIn(URGENCY_LEVELS)
    .withMessage(`Urgency must be one of: ${URGENCY_LEVELS.join(', ')}`),

  handleValidationErrors
];

export const validateUpdateReport = [
  param('id')
    .isMongoId()
    .withMessage('Invalid report ID format'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters'),

  body('category')
    .optional()
    .trim()
    .isIn(WASTE_CATEGORIES)
    .withMessage(`Category must be one of: ${WASTE_CATEGORIES.join(', ')}`),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Description must be between 5 and 1000 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 250 })
    .withMessage('Location must be between 3 and 250 characters'),

  body('urgency')
    .optional()
    .trim()
    .isIn(URGENCY_LEVELS)
    .withMessage(`Urgency must be one of: ${URGENCY_LEVELS.join(', ')}`),

  handleValidationErrors
];
