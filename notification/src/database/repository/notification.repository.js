const { NotificationModel } = require('../index');
const helpers = require('../../helpers');

const { Logs } = helpers;

const { logDetails } = Logs;

const createNotificationInfo = async ({ data, session }) => {
  try {
    const res = await NotificationModel.create([data], { session });
    return res;
  } catch (error) {
    logDetails({ error });
  }
};

module.exports = createNotificationInfo;
