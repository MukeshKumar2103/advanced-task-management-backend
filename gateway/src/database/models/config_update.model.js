const mongoose = require('mongoose');
const { Schema } = mongoose;

const { DateUtil } = require('../../helpers');

const ConfigUpdateSchema = new Schema(
  {
    description: {
      type: String,
      require: true,
    },
    changeTime: {
      type: String,
      require: true,
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

module.exports = mongoose.model('config_update', ConfigUpdateSchema);
