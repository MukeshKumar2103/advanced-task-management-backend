const mongoose = require('mongoose');
const { DateUtil } = require('../../helpers');

const notificationSchema = mongoose.Schema(
  {
    sendTo: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      required: true,
    },
    content: { type: String },
    responseId: { type: String },
    status: { type: String },
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

const notification = mongoose.model('notification', notificationSchema);

module.exports = notification;
