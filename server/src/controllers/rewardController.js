import User from '../models/User.js';
import RewardTransaction from '../models/RewardTransaction.js';
import WasteReport from '../models/WasteReport.js';

const getTierInfo = (points) => {
  if (points >= 500) return { name: 'Earth Guardian', badge: 'champion', nextThreshold: null, currentProgress: 100 };
  if (points >= 250) return { name: 'Green Champion', badge: 'gold', nextThreshold: 500, currentProgress: Math.round(((points - 250) / 250) * 100) };
  if (points >= 100) return { name: 'Eco Advocate', badge: 'silver', nextThreshold: 250, currentProgress: Math.round(((points - 100) / 150) * 100) };
  return { name: 'Eco Novice', badge: 'bronze', nextThreshold: 100, currentProgress: Math.round((points / 100) * 100) };
};

// @desc    Get current user's reward summary, tier, and transaction ledger
// @route   GET /api/rewards/me
// @access  Private
export const getMyRewards = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const transactions = await RewardTransaction.find({ resident: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const tier = getTierInfo(user.points || 0);

    const [totalReportsRecycled, completedPickups] = await Promise.all([
      WasteReport.countDocuments({ resident: req.user._id, pointsAwarded: true }),
      RewardTransaction.countDocuments({ resident: req.user._id, type: 'pickup_collection' })
    ]);

    res.status(200).json({
      success: true,
      points: user.points || 0,
      tier,
      stats: {
        verifiedReportsCount: totalReportsRecycled,
        completedPickupsCount: completedPickups,
        totalTransactions: transactions.length
      },
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get community recycling leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Public / Private
export const getLeaderboard = async (req, res, next) => {
  try {
    const topUsers = await User.find({ role: 'resident', isActive: true })
      .sort({ points: -1, createdAt: 1 })
      .limit(20)
      .select('name points createdAt');

    const leaderboard = topUsers.map((user, index) => {
      const tier = getTierInfo(user.points);
      return {
        rank: index + 1,
        id: user._id,
        name: user.name,
        points: user.points,
        tierName: tier.name,
        tierBadge: tier.badge,
        joinedAt: user.createdAt
      };
    });

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};
