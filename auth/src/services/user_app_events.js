const axios = require('axios');

const config = require('../config');
const { Env } = config;

const userAppEvents = async ({ payload }) => {
  try {
    const res = await axios.post(
      `${Env.appEvents.userService}/user-service/api/v1/app-events`,
      payload
    );
    return res.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || 'Error in app events service'
    );
  }
};

module.exports = { userAppEvents };
