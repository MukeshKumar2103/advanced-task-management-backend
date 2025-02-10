const userRolesModel = require('../models/user_roles.model');

const checkRoleExist = async (id, session = null) => {
  try {
    const res = await userRolesModel.find({ roleId: id }).session(session);
    return res;
  } catch (err) {
    console.error('Error checking user existence:', err);
    throw err;
  }
};

const createRole = async (data, session = null) => {
  try {
    const result = await userRolesModel.create([data], session);
    return result;
  } catch (error) {
    console.error('Error creating API route:', error.message);
    throw new Error(`Failed to create API route: ${error.message}`);
  }
};

module.exports = { checkRoleExist, createRole };
