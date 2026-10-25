import { REWARD_POINTS } from '../config/constants.js';
import User from '../models/User.js';
import RewardTransaction from '../models/RewardTransaction.js';

/**
 * Calculate reward points for a verified waste report
 */
export const calculateReportPoints = (category, urgency) => {
  const basePoints = REWARD_POINTS[category] || 10;
  const bonus = (urgency && REWARD_POINTS.urgencyBonus[urgency]) || 0;
  return basePoints + bonus;
};

/**
 * Award points to a resident for a verified waste report
 * Guarantees no duplicate points are awarded
 */
export const awardReportPoints = async (report, adminUserId) => {
  if (report.pointsAwarded) {
    return { awarded: false, message: 'Points have already been awarded for this report' };
  }

  const points = calculateReportPoints(report.category, report.urgency);

  // Update user points atomically
  await User.findByIdAndUpdate(report.resident, {
    $inc: { points }
  });

  // Create audit transaction record
  const transaction = await RewardTransaction.create({
    resident: report.resident,
    points,
    type: 'waste_report',
    referenceId: report._id,
    referenceType: 'WasteReport',
    description: `Earned ${points} points for verified ${report.category} waste report (#${report._id.toString().slice(-6)})`
  });

  report.pointsAwarded = true;
  report.pointsAmount = points;
  await report.save();

  return { awarded: true, points, transaction };
};

/**
 * Award points for a completed pickup request
 */
export const awardPickupPoints = async (pickup, adminUserId) => {
  const basePoints = 25; // Standard pickup bonus

  // Check if already awarded
  const existingTx = await RewardTransaction.findOne({
    referenceId: pickup._id,
    referenceType: 'PickupRequest'
  });

  if (existingTx) {
    return { awarded: false, message: 'Points have already been awarded for this pickup' };
  }

  await User.findByIdAndUpdate(pickup.resident, {
    $inc: { points: basePoints }
  });

  const transaction = await RewardTransaction.create({
    resident: pickup.resident,
    points: basePoints,
    type: 'pickup_collection',
    referenceId: pickup._id,
    referenceType: 'PickupRequest',
    description: `Earned ${basePoints} points for completed ${pickup.category} pickup (#${pickup._id.toString().slice(-6)})`
  });

  return { awarded: true, points: basePoints, transaction };
};
