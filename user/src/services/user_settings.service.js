const { default: mongoose } = require('mongoose');

const { userSettingsRepository } = require('../database');
const { Logs, Formators } = require('../helpers');

const { logDetails } = Logs;
const { formatResponse } = Formators;

const createUserSettings = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  logDetails({
    traceId: req?.traceId,
    message: 'Inside create user settings',
  });

  try {
    const payload = {
      // userId: req?.body?.userId,
      ...req?.body,
    };

    logDetails({
      traceId: req?.traceId,
      message: 'Before create user settings',
      data: JSON.stringify(payload),
    });

    const isUserSettingsExist =
      await userSettingsRepository.checkUserSettingsExist(
        payload?.userId,
        session
      );

    let result = null;

    if (isUserSettingsExist?.length === 0) {
      result = await userSettingsRepository.createUserSettings(
        payload,
        session
      );
    } else {
      result = await userSettingsRepository.updateUserSettings(
        payload,
        session
      );
    }

    const formateResponse = formatResponse({
      action: 'Create user Settings',
      code: 1,
      data: result,
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(formateResponse);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    const formateResponse = formatResponse({
      action: 'Create user Settings',
      code: 0,
      data: [{ message: error?.message }],
    });

    return res.status(404).json(formateResponse);
  }
};

module.exports = { createUserSettings };
