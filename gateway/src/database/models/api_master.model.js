const mongoose = require('mongoose');
const { Schema } = mongoose;

const { DateUtil } = require('../../helpers');

const ApiMasterSchema = new Schema(
  {
    dns: {
      type: String,
      require: true,
    },
    path: {
      type: String,
      require: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      require: true,
    },
    backendAPI: {
      type: String,
      require: true,
    },
    isPublic: {
      type: Boolean,
      require: true,
      default: true,
    },
    service: {
      type: String,
    },
    version: {
      type: Number,
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
  { optimisticConcurrency: true }
);

module.exports = mongoose.model('api_master', ApiMasterSchema);
