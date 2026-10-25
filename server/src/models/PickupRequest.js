import mongoose from 'mongoose';
import { WASTE_CATEGORIES, PICKUP_STATUSES, TIME_SLOTS } from '../config/constants.js';

const pickupRequestSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Please select a waste category for pickup'],
      enum: {
        values: WASTE_CATEGORIES,
        message: '{VALUE} is not a valid waste category'
      }
    },
    address: {
      type: String,
      required: [true, 'Please provide a pickup address'],
      trim: true
    },
    preferredDate: {
      type: Date,
      required: [true, 'Please specify a preferred pickup date']
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a preferred time slot'],
      enum: {
        values: TIME_SLOTS,
        message: '{VALUE} is not a supported time slot'
      }
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Instructions cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: {
        values: PICKUP_STATUSES,
        message: '{VALUE} is not a valid pickup status'
      },
      default: 'Pending'
    },
    assignedCollector: {
      type: String,
      default: '',
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

pickupRequestSchema.index({ resident: 1, createdAt: -1 });
pickupRequestSchema.index({ status: 1, createdAt: -1 });

export const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);
export default PickupRequest;
