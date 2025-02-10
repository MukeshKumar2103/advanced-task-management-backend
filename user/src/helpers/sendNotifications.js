const axios = require('axios');

const { logDetails } = require('./logDetails');
// const config = require('../config');
// const { Env } = config;

const sendNotification = async ({ traceId, payload }) => {
  await logDetails({
    traceId: traceId,
    message: 'Inside send notification',
  });

  try {
    const res = await axios.post(
      `http://localhost:8000/api-gateway/api/v1/send-email`,
      payload
    );
    await logDetails({
      traceId: traceId,
      message: 'Notification send successfully',
    });
    return res.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || 'Error in app events service'
    );
  }
};

module.exports = { sendNotification };
