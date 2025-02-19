const userModel = require('../models/user.model');

const checkUserExist = async (email, session = null) => {
  try {
    const res = await userModel.find({ email: email }).session(session);
    return res;
  } catch (err) {
    console.error('Error checking user existence:', err);
    throw err;
  }
};

const checkIsUserExist = async (id, session = null) => {
  try {
    const res = await userModel.find({ _id: id }).session(session);
    return res;
  } catch (err) {
    console.error('Error checking user existence:', err);
    throw err;
  }
};

const createUser = async (data, session = null) => {
  console.log('data', data);
  try {
    const result = await userModel.create([data], session);
    return result;
  } catch (error) {
    console.error('Error creating API route:', error.message);
    throw new Error(`Failed to create API route: ${error.message}`);
  }
};

const updateUser = async (data, session = null) => {
  const { id, ...user } = data;
  try {
    const result = await userModel.findOneAndUpdate(
      { _id: id, isActive: true },
      { ...user },
      { new: true, session }
    );

    return result;
  } catch (error) {
    console.error('Error updating user:', error.message);
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

module.exports = { checkUserExist, checkIsUserExist, createUser, updateUser };
