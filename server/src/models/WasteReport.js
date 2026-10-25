import mongoose from 'mongoose';
import { WASTE_CATEGORIES, URGENCY_LEVELS, REPORT_STATUSES } from '../config/constants.js';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: REPORT_STATUSES,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const wasteReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a report title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a waste category'],
      enum: {
        values: WASTE_CATEGORIES,
        message: '{VALUE} is not a valid waste category'
      }
    },
    description: {
      type: String,
      required: [true, 'Please provide a description of the waste'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    location: {
      type: String,
      required: [true, 'Please provide a location or street address'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    urgency: {
      type: String,
      enum: {
        values: URGENCY_LEVELS,
        message: '{VALUE} is not a valid urgency level'
      },
      default: 'medium'
    },
    status: {
      type: String,
      enum: {
        values: REPORT_STATUSES,
        message: '{VALUE} is not a valid report status'
      },
      default: 'Pending'
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assignedCollector: {
      type: String,
      default: '',
      trim: true
    },
    pointsAwarded: {
      type: Boolean,
      default: false
    },
    pointsAmount: {
      type: Number,
      default: 0
    },
    statusHistory: [statusHistorySchema]
  },
  {
    timestamps: true
  }
);

wasteReportSchema.index({ resident: 1, createdAt: -1 });
wasteReportSchema.index({ status: 1, createdAt: -1 });
wasteReportSchema.index({ category: 1 });

export const WasteReport = mongoose.model('WasteReport', wasteReportSchema);
export default WasteReport;
