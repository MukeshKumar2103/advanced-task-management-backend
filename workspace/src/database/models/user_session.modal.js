const mongoose = require('mongoose');
const { DateUtil } = require('../../helpers');

const userSessionSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    public_key: {
      type: String,
      required: true,
    },
    private_key: {
      type: String,
      required: true,
    },
    auth_token: {
      type: String,
      required: true,
    },
    start_time: {
      type: String,
      required: true,
    },
    expiration_time: {
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

const userSession = mongoose.model('user_sessions', userSessionSchema);

module.exports = userSession;
