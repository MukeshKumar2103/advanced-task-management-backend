const { default: mongoose } = require('mongoose');

const { userRepository } = require('../database');
const { Logs, Formators, JwtHelpers } = require('../helpers');

const { formatResponse } = Formators;
const { logDetails } = Logs;
const { hashPassword } = JwtHelpers;

const checkUserIsExist = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  logDetails({
    traceId: req?.traceId,
    message: 'Inside check user',
  });

  try {
    const payload = { userId: req?.body?.userId };

    logDetails({
      traceId: req?.traceId,
      message: 'Checking user is exist',
    });

    const isUserExist = await userRepository.checkIsUserExist(
      payload?.userId,
      session
    );

    logDetails({
      traceId: req?.traceId,
      message: isUserExist?.length > 0 ? 'User is exist' : 'User is not exist',
    });

    await session.commitTransaction();
    session.endSession();

    const formateResponse = formatResponse({
      action: 'Check user',
      code: 1,
      data: isUserExist,
    });

    return res.status(200).json(formateResponse);
  } catch (error) {
    logDetails({
      traceId: req?.traceId,
      message: 'Check user failed',
    });

    const formateResponse = formatResponse({
      action: 'Check user',
      code: 0,
      data: [{ message: error?.message }],
    });

    await session.abortTransaction();
    session.endSession();

    return res.status(404).json(formateResponse);
  }
};

const createUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  logDetails({
    traceId: req?.traceId,
    message: 'Inside create user settings',
  });

  try {
    const { email, firstName, lastName, password } = req.body;

    const payload = {
      email,
      firstName,
      lastName,
      isActive: true,
      isEmailVerified: false,
      password: await hashPassword(password),
    };
    logDetails({
      traceId: req?.traceId,
      message: 'Checking user is exist',
    });

    const isUserExist = await userRepository.checkUserExist(
      payload?.email,
      session
    );

    if (isUserExist?.length > 0) {
      logDetails({
        traceId: req?.traceId,
        message: 'User is exist',
      });

      throw new Error('User already exist');
    }

    logDetails({
      traceId: req?.traceId,
      message: 'User is not exist',
    });

    const result = await userRepository.createUser(payload, session);

    logDetails({
      traceId: req?.traceId,
      message: 'After created the user',
    });

    const formateResponse = formatResponse({
      action: 'Create user',
      code: 1,
      data: result,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(formateResponse);
  } catch (error) {
    logDetails({
      traceId: req?.traceId,
      message: 'User creation failed',
    });

    const formateResponse = formatResponse({
      action: 'Create user Settings',
      code: 0,
      data: [{ message: error?.message }],
    });

    await session.abortTransaction();
    session.endSession();

    return res.status(404).json(formateResponse);
  }
};

const getUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  logDetails({
    traceId: req?.traceId,
    message: 'Inside create user settings',
  });

  try {
    const { id } = req.query;

    logDetails({
      traceId: req?.traceId,
      message: 'Before Get the user',
    });

    const user = await userRepository.checkIsUserExist(id, session);

    logDetails({
      traceId: req?.traceId,
      message: 'After created the user',
    });

    const formateResponse = formatResponse({
      action: 'Get user',
      code: 1,
      data: user,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(formateResponse);
  } catch (error) {
    logDetails({
      traceId: req?.traceId,
      message: 'Getting user failed',
    });

    const formateResponse = formatResponse({
      action: 'Getting user',
      code: 0,
      data: [{ message: error?.message }],
    });

    await session.abortTransaction();
    session.endSession();

    return res.status(404).json(formateResponse);
  }
};

const updateUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  logDetails({
    traceId: req?.traceId,
    message: 'Inside update User',
  });

  try {
    const payload = {
      id: req?.body?.userId,
      updatedData: req?.body?.updatedDataupdatedData,
    };

    logDetails({
      traceId: req?.traceId,
      message: 'Checking the user is esist',
    });

    const isUserExist = await userRepository.checkUserExist(
      payload?.email,
      session
    );

    if (isUserExist?.length === 0) {
      logDetails({
        traceId: req?.traceId,
        message: 'User is not esist',
      });

      throw new Error('User not found');
    }

    logDetails({
      traceId: req?.traceId,
      message: 'User is esist',
    });

    const result = await userRepository.updateUser(payload, session);

    logDetails({
      traceId: req?.traceId,
      message: 'After updated the user',
    });

    await session.commitTransaction();
    session.endSession();

    const formateResponse = formatResponse({
      action: 'Update the user',
      code: 0,
      data: result,
    });

    return res.status(200).json(formateResponse);
  } catch (error) {
    logDetails({
      traceId: req?.traceId,
      message: 'User creation failed',
    });

    await session.abortTransaction();
    session.endSession();

    const formateResponse = formatResponse({
      action: 'Update the user failed',
      code: 0,
      data: [{ message: error?.message }],
    });

    return res.status(404).json(formateResponse);
  }
};

module.exports = { createUser, updateUser, getUser, checkUserIsExist };
