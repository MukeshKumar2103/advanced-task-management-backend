const verificationSessionModel = require('../models/verification_session.model');
const { DateUtil } = require('../../helpers');

const createVerificationSession = async ({ data, session }) => {
  const createdSession = await verificationSessionModel.create([data], {
    session,
  });
  return createdSession;
};

const getVerificationSession = async (id, query) => {
  const session = await verificationSessionModel.find({
    userId: id,
    ...query,
  });
  return session;
};

const updateVerificationSession = async (id) => {
  const updatedSession = await verificationSessionModel.findOneAndUpdate(
    { userId: id, isActive: true },
    { status: 'in-active', isActive: false },
    { new: true }
  );
  return updatedSession;
};

const getVerificationSessionAndUpdateAll = async (id) => {
  const sessions = await verificationSessionModel.aggregate([
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
  createVerificationSession,
  getVerificationSession,
  updateVerificationSession,
  getVerificationSessionAndUpdateAll,
};
