import WasteReport from '../models/WasteReport.js';

// @desc    Create a new waste report
// @route   POST /api/reports
// @access  Private (Resident)
export const createReport = async (req, res, next) => {
  try {
    const { title, category, description, location, urgency } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const report = await WasteReport.create({
      title,
      category,
      description,
      location,
      urgency: urgency || 'medium',
      imageUrl,
      resident: req.user._id,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          updatedBy: req.user._id,
          note: 'Report submitted by resident'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Waste report submitted successfully',
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports belonging to current resident (with search, filter, pagination)
// @route   GET /api/reports
// @access  Private (Resident)
export const getMyReports = async (req, res, next) => {
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

    const query = { resident: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (urgency && urgency !== 'all') {
      query.urgency = urgency;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [reports, total] = await Promise.all([
      WasteReport.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('statusHistory.updatedBy', 'name role'),
      WasteReport.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get individual report details
// @route   GET /api/reports/:id
// @access  Private (Owner or Admin)
export const getReportById = async (req, res, next) => {
  try {
    const report = await WasteReport.findById(req.params.id)
      .populate('resident', 'name email phone address')
      .populate('statusHistory.updatedBy', 'name role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Waste report not found'
      });
    }

    // Ownership check: only resident owner or admin can view
    const isOwner = report.resident._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view another resident\'s report.'
      });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit permitted fields of a pending report
// @route   PATCH /api/reports/:id
// @access  Private (Owner)
export const updateReport = async (req, res, next) => {
  try {
    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Waste report not found'
      });
    }

    // Ownership verification
    if (report.resident.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own reports.'
      });
    }

    // Status rule: resident can only edit when Pending
    if (req.user.role !== 'admin' && report.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Reports with status '${report.status}' can no longer be edited by residents.`
      });
    }

    const { title, category, description, location, urgency } = req.body;
    if (title) report.title = title;
    if (category) report.category = category;
    if (description) report.description = description;
    if (location) report.location = location;
    if (urgency) report.urgency = urgency;

    if (req.file) {
      report.imageUrl = `/uploads/${req.file.filename}`;
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Waste report updated successfully',
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a report (permitted only when Pending)
// @route   DELETE /api/reports/:id
// @access  Private (Owner or Admin)
export const deleteReport = async (req, res, next) => {
  try {
    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Waste report not found'
      });
    }

    const isOwner = report.resident.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot delete this report.'
      });
    }

    // Permitted only when Pending (or admin override)
    if (!isAdmin && report.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete report with status '${report.status}'. Only Pending reports can be cancelled or removed.`
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Waste report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
