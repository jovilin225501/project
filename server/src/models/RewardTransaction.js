import mongoose from 'mongoose';

const rewardTransactionSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    points: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['waste_report', 'pickup_collection', 'bonus', 'adjustment'],
      default: 'waste_report'
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    referenceType: {
      type: String,
      enum: ['WasteReport', 'PickupRequest', 'Manual'],
      default: 'WasteReport'
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

rewardTransactionSchema.index({ resident: 1, createdAt: -1 });

export const RewardTransaction = mongoose.model('RewardTransaction', rewardTransactionSchema);
export default RewardTransaction;
