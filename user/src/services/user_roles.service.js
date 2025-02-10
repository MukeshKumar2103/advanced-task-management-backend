const { default: mongoose } = require('mongoose');

const { userRoleRepository } = require('../database');
const { Logs } = require('../helpers');

const { logDetails } = Logs;

const createUserRole = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  logDetails({
    traceId: req?.traceId,
    message: 'Before create user role',
  });

  try {
    const payload = {
      roleId: req?.body?.roleId,
      role: req?.body?.role,
      permissions: req?.body?.permissions,
      status: req?.body?.status,
      isActive: req?.body?.isActive,
    };

    logDetails({
      traceId: req?.traceId,
      message: 'Checking user role exist',
    });

    const isUserRoleExist = await userRoleRepository.checkRoleExist(
      payload?.role,
      session
    );

    if (isUserRoleExist?.length > 0) {
      logDetails({
        traceId: req?.traceId,
        message: 'User role is exist',
      });
      throw new Error('User already exist');
    }

    logDetails({
      traceId: req?.traceId,
      message: 'User role is not exist',
    });

    const result = await userRoleRepository.createRole(payload, session);

    logDetails({
      traceId: req?.traceId,
      message: 'After created user role',
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    logDetails({
      traceId: req?.traceId,
      message: 'User creation failed',
    });

    await session.abortTransaction();
    session.endSession();

    return res.status(404).json({ success: false, message: error?.message });
  }
};

module.exports = { createUserRole };
