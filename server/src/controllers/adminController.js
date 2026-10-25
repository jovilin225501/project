import User from '../models/User.js';
import WasteReport from '../models/WasteReport.js';
import PickupRequest from '../models/PickupRequest.js';
import { awardReportPoints } from '../services/rewardService.js';
import { REPORT_STATUSES, WASTE_CATEGORIES } from '../config/constants.js';

// @desc    Get comprehensive administrator analytics and KPI metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalReports,
      pendingReports,
      activePickups,
      completedCollections,
      categoryStats,
      statusStats,
      recentReports,
      recentPickups
    ] = await Promise.all([
      User.countDocuments({ role: 'resident' }),
      WasteReport.countDocuments(),
      WasteReport.countDocuments({ status: 'Pending' }),
      PickupRequest.countDocuments({ status: { $in: ['Pending', 'Approved', 'Assigned', 'In Progress'] } }),
      WasteReport.countDocuments({ status: 'Completed' }),

      // Aggregate waste by category
      WasteReport.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),

      // Aggregate reports by status
      WasteReport.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Recent 5 reports
      WasteReport.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('resident', 'name email'),

      // Recent 5 pickups
      PickupRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('resident', 'name email')
    ]);

    // Ensure all categories are present in categoryStats
    const formattedCategories = WASTE_CATEGORIES.map((cat) => {
      const match = categoryStats.find((c) => c._id === cat);
      return {
        category: cat.charAt(0).toUpperCase() + cat.slice(1),
        count: match ? match.count : 0
      };
    });

    // Ensure all statuses are present in statusStats
    const formattedStatuses = REPORT_STATUSES.map((st) => {
      const match = statusStats.find((s) => s._id === st);
      return {
        status: st,
        count: match ? match.count : 0
      };
    });

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAggregation = await WasteReport.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalReports: { $sum: 1 },
          completedReports: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const found = monthlyAggregation.find((item) => item._id.year === y && item._id.month === m);
      trends.push({
        month: `${monthNames[d.getMonth()]} ${y}`,
        reports: found ? found.totalReports : 0,
        completed: found ? found.completedReports : 0
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalReports,
        pendingReports,
        activePickups,
        completedCollections,
        resolutionRate: totalReports > 0 ? Math.round((completedCollections / totalReports) * 100) : 0
      },
      charts: {
        byCategory: formattedCategories,
        byStatus: formattedStatuses,
        trends
      },
      recentActivity: {
        reports: recentReports,
        pickups: recentPickups
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports across all users with filters and pagination
// @route   GET /api/admin/reports
// @access  Private (Admin)
export const getAdminReports = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      urgency,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { assignedCollector: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (urgency && urgency !== 'all') query.urgency = urgency;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [reports, total] = await Promise.all([
      WasteReport.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('resident', 'name email phone address')
        .populate('statusHistory.updatedBy', 'name role'),
      WasteReport.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status, assign collector, and optionally award points
// @route   PATCH /api/admin/reports/:id/status
// @access  Private (Admin)
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, note, assignedCollector } = req.body;

    if (!REPORT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${REPORT_STATUSES.join(', ')}`
      });
    }

    const report = await WasteReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Waste report not found'
      });
    }

    report.status = status;
    if (assignedCollector !== undefined) {
      report.assignedCollector = assignedCollector;
    }

    // Append to status history
    report.statusHistory.push({
      status,
      updatedBy: req.user._id,
      note: note || `Status updated to ${status} by administrator`,
      timestamp: new Date()
    });

    let rewardResult = null;
    // If status transitioned to Completed and points not yet awarded, award points!
    if (status === 'Completed' && !report.pointsAwarded) {
      rewardResult = await awardReportPoints(report, req.user._id);
    } else {
      await report.save();
    }

    const updated = await WasteReport.findById(report._id)
      .populate('resident', 'name email phone address')
      .populate('statusHistory.updatedBy', 'name role');

    res.status(200).json({
      success: true,
      message: `Report status updated to '${status}' successfully`,
      report: updated,
      rewardResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list with search and pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 15 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.isActive = status === 'active';

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query)
    ]);

    // Attach count of reports per user
    const userIds = users.map((u) => u._id);
    const reportCounts = await WasteReport.aggregate([
      { $match: { resident: { $in: userIds } } },
      { $group: { _id: '$resident', count: { $sum: 1 } } }
    ]);

    const reportCountMap = {};
    reportCounts.forEach((rc) => {
      reportCountMap[rc._id.toString()] = rc.count;
    });

    const enrichedUsers = users.map((u) => ({
      ...u.toJSON(),
      reportsCount: reportCountMap[u._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      users: enrichedUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/deactivated status
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrator account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      user
    });
  } catch (error) {
    next(error);
  }
};
