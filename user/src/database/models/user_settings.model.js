const mongoose = require('mongoose');
const { DateUtil } = require('../../helpers');

const userSettingsSchema = mongoose.Schema(
  {
    roleId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    isOnline: {
      type: Boolean,
    },
    themes: {
      appearence: {
        type: String,
        default: 'free',
      },
      color: {
        type: String,
        default: 'free',
      },
    },
    dateTimeUtils: {
      week: {
        type: String,
        enum: ['sunday', 'monday'],
        default: 'sunday',
      },
      time: {
        type: Number,
        enum: [12, 24],
        default: 12,
      },
      date: {
        type: String,
        enum: ['mm/dd/yyyy', 'dd/mm/yyyy', 'yyyy/mm/dd'],
      },
    },
    preferences: {
      toastMessage: {
        type: Boolean,
        default: true,
      },
      markdown: {
        type: Boolean,
        default: true,
      },
      offline: {
        type: Boolean,
        default: false,
      },
    },
    notificationPreferences: {
      inbox: {
        type: String,
        default: 'default',
        enum: ['default', 'focused', 'custom'],
      },
      email: {
        type: String,
        default: 'default',
        enum: ['default', 'focused', 'mentions', 'custom'],
      },
      browser: {
        type: String,
        default: 'default',
        enum: ['default', 'focused', 'mentions', 'custom'],
      },
    },
    language: {
      type: String,
      default: 'en',
    },
    Region: {
      type: String,
    },
    activity: {
      plan: {
        type: String,
        enum: ['free'],
        default: 'free',
      },
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

const userSettings = mongoose.model('user_settings', userSettingsSchema);

module.exports = userSettings;
