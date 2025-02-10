const mongoose = require('mongoose');
const { DateUtil } = require('../../helpers');

const userRolesSchema = mongoose.Schema(
  {
    roleId: {
      type: String,
      required: true,
    },
    role: {
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

const userRoles = mongoose.model('user_roles', userRolesSchema);

module.exports = userRoles;
