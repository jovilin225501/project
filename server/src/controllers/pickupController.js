import PickupRequest from '../models/PickupRequest.js';
import { awardPickupPoints } from '../services/rewardService.js';

// @desc    Create a waste pickup request
// @route   POST /api/pickups
// @access  Private (Resident)
export const createPickup = async (req, res, next) => {
  try {
    const { category, address, preferredDate, timeSlot, instructions } = req.body;

    const pickup = await PickupRequest.create({
      resident: req.user._id,
      category,
      address,
      preferredDate,
      timeSlot,
      instructions: instructions || '',
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Pickup request scheduled successfully',
      pickup
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current resident's pickup requests
// @route   GET /api/pickups
// @access  Private
export const getMyPickups = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { resident: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [pickups, total] = await Promise.all([
      PickupRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      PickupRequest.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      pickups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get individual pickup request
// @route   GET /api/pickups/:id
// @access  Private
export const getPickupById = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id)
      .populate('resident', 'name email phone address');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found'
      });
    }

    const isOwner = pickup.resident._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view another resident\'s pickup request.'
      });
    }

    res.status(200).json({
      success: true,
      pickup
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or cancel pickup request
// @route   PATCH /api/pickups/:id
// @access  Private
export const updatePickup = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup request not found'
      });
    }

    const isOwner = pickup.resident.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot edit this pickup request.'
      });
    }

    const {
      address,
      preferredDate,
      timeSlot,
      instructions,
      status,
      assignedCollector,
      notes
    } = req.body;

    if (!isAdmin) {
      // Resident updates: only permitted when Pending
      if (pickup.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot update pickup in '${pickup.status}' status.`
        });
      }

      if (address) pickup.address = address;
      if (preferredDate) pickup.preferredDate = preferredDate;
      if (timeSlot) pickup.timeSlot = timeSlot;
      if (instructions !== undefined) pickup.instructions = instructions;
      if (status === 'Cancelled') pickup.status = 'Cancelled';
    } else {
      // Admin updates: can assign collector, change status, add notes
      if (assignedCollector !== undefined) pickup.assignedCollector = assignedCollector;
      if (notes !== undefined) pickup.notes = notes;
      if (status && status !== pickup.status) {
        pickup.status = status;

        // If completed, award points automatically
        if (status === 'Completed') {
          await awardPickupPoints(pickup, req.user._id);
        }
      }
    }

    await pickup.save();

    res.status(200).json({
      success: true,
      message: 'Pickup request updated successfully',
      pickup
    });
  } catch (error) {
    next(error);
  }
};
