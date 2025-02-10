const userModel = require('../models/user.model');

const getResource = async (data, session = null) => {
  const { id, phoneNumber, isActive } = data;

  const payload = {};

  if (id) payload['_id'] = Number(id);
  if (phoneNumber) payload['phoneNumber'] = phoneNumber;
  if (isActive) payload['isActive'] = isActive;

  const user = await userModel.find(payload).session(session);
  return user;
};

const checkResourceExist = async (id, session = null) => {
  try {
    const res = await userModel
      .find({
        _id: Number(id),
      })
      .session(session);
    return res;
  } catch (err) {
    console.error('Error checking resource existence:', err);
    throw err;
  }
};

module.exports = {
  getResource,
  checkResourceExist,
};
