const ConfigUpdateModel = require('../models/config_update.model');

const getLatestConfigRecord = async (session = null) => {
  try {
    const configRecord = await ConfigUpdateModel.findOne(
      { isActive: true },
      null,
      { session }
    );
    return configRecord;
  } catch (error) {
    console.error('Error fetching latest config record:', error);
    throw new Error('Failed to fetch latest config record: ' + error.message);
  }
};

const deactivateConfigRecordById = async (id, session = null) => {
  try {
    const result = await ConfigUpdateModel.updateOne(
      { _id: id, isActive: true },
      { $set: { isActive: false } },
      { session }
    );
    return result;
  } catch (error) {
    console.error('Error deactivating config record:', error);
    throw new Error('Failed to deactivate config record: ' + error.message);
  }
};

module.exports = {
  getLatestConfigRecord,
  deactivateConfigRecordById,
};
