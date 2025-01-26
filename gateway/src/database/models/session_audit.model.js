const mongoose = require('mongoose');
const { Schema } = mongoose;

const { DateUtil } = require('../../helpers');

const SessionAuditSchema = new Schema(
  {
    ipAddress: String,
    resourceId: String,
    agent: String,
    method: String,
    path: String,
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
  }
  //   { optimisticConcurrency: true }
);

module.exports = mongoose.model('session_audit', SessionAuditSchema);
