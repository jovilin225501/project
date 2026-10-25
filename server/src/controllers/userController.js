import User from '../models/User.js';
import WasteReport from '../models/WasteReport.js';
import PickupRequest from '../models/PickupRequest.js';

// @desc    Get current user profile with summary stats
// @route   GET /api/users/me
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const [reportsCount, pendingReports, pickupsCount] = await Promise.all([
      WasteReport.countDocuments({ resident: req.user._id }),
      WasteReport.countDocuments({ resident: req.user._id, status: 'Pending' }),
      PickupRequest.countDocuments({ resident: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      user,
      stats: {
        totalReports: reportsCount,
        pendingReports,
        totalPickups: pickupsCount,
        rewardPoints: user.points
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile (name, phone, address)
// @route   PATCH /api/users/me
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/users/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
