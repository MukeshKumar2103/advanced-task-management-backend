const mongoose = require('mongoose');
const { DateUtil } = require('../../helpers');

const verificationSessionSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    expirationTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'in-active'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: DateUtil.getCurrentUTC(),
    },
    createdBy: {
      type: Number,
      default: -1,
    },
    updatedAt: {
      type: Date,
      default: DateUtil.getCurrentUTC(),
    },
    updatedBy: {
      type: Number,
      default: -1,
    },
  },
  {
    timestamps: true,
  }
);

const verificationSession = mongoose.model(
  'verification_sessions',
  verificationSessionSchema
);

module.exports = verificationSession;
