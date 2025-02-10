const mongoose = require('mongoose');
const { DateUtil } = require('../../helpers');

const counterSchema = mongoose.Schema(
  {
    collection_name: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: DateUtil.getCurrentUTC(),
    },
  },
  {
    timestamps: true,
  }
);

const counter = mongoose.model('Counter', counterSchema);

module.exports = counter;
