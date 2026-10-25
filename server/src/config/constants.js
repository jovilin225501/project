// EcoTrack System Constants

export const WASTE_CATEGORIES = [
  'plastic',
  'paper',
  'glass',
  'organic',
  'electronic',
  'mixed'
];

export const URGENCY_LEVELS = [
  'low',
  'medium',
  'high',
  'critical'
];

export const REPORT_STATUSES = [
  'Pending',
  'Approved',
  'Assigned',
  'In Progress',
  'Completed',
  'Rejected'
];

export const PICKUP_STATUSES = [
  'Pending',
  'Approved',
  'Assigned',
  'In Progress',
  'Completed',
  'Cancelled'
];

export const USER_ROLES = [
  'resident',
  'admin'
];

// Documented configurable points award policy
export const REWARD_POINTS = {
  plastic: 20,
  paper: 10,
  glass: 15,
  organic: 10,
  electronic: 50,
  mixed: 5,
  urgencyBonus: {
    critical: 15,
    high: 10,
    medium: 5,
    low: 0
  }
};

export const TIME_SLOTS = [
  '08:00 AM - 11:00 AM',
  '11:00 AM - 02:00 PM',
  '02:00 PM - 05:00 PM',
  '05:00 PM - 08:00 PM'
];
