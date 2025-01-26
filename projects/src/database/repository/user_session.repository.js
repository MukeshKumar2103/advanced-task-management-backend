const userSessionModel = require('../models/user_session.modal');
const { DateUtil } = require('../../helpers');

const createuserSession = async (data) => {
  const createdSession = await userSessionModel.create(data);
  return createdSession;
};

const getSession = async (id) => {
  const session = await userSessionModel.find({
    userId: id,
    isActive: true,
  });
  return session;
};

const getSessionAndUpdateAll = async (id) => {
  const sessions = await userSessionModel.aggregate([
    {
      $match: {
        userId: Number(id),
        status: 'active',
      },
    },
    {
      $set: {
        status: 'in-active',
        isActive: false,
        updataedAt: DateUtil.getCurrentUTC(),
      },
    },
    {
      $merge: {
        into: 'user_sessions',
        whenMatched: 'merge',
        whenNotMatched: 'discard',
      },
    },
  ]);

  return sessions;
};

module.exports = {
  createuserSession,
  getSessionAndUpdateAll,
  getSession,
};
