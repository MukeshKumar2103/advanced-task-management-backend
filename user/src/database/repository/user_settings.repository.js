const userSettingsModel = require('../models/user_settings.model');

const checkUserSettingsExist = async (id, session = null) => {
  try {
    const result = await userSettingsModel.findOne({ userId: id }, session);
    return result;
  } catch (error) {
    console.error('Error creating API route:', error.message);
    throw new Error(`Failed to create API route: ${error.message}`);
  }
};

const createUserSettings = async (data, session = null) => {
  try {
    const result = await userSettingsModel.create([data], session);
    return result;
  } catch (error) {
    console.error('Error creating API route:', error.message);
    throw new Error(`Failed to create API route: ${error.message}`);
  }
};

const updateUserSettings = async (data, session = null) => {
  try {
    const result = await userSettingsModel.findOneAndUpdate(data, session);
    return result;
  } catch (error) {
    console.error('Error creating API route:', error.message);
    throw new Error(`Failed to create API route: ${error.message}`);
  }
};

module.exports = {
  checkUserSettingsExist,
  createUserSettings,
  updateUserSettings,
};
