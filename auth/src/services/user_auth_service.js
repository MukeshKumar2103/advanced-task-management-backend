const mongoose = require('mongoose');
const { userAppEvents } = require('./user_app_events');
const { Formators, Logs, Common } = require('../helpers');

const { formatResponse } = Formators;
const { logDetails } = Logs;
const { isEmptyObject } = Common;

const verifyToken = async (req, res) => {
  const { traceId, data } = await req.formatedData;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await logDetails({
      traceId: traceId,
      message: 'Inside verify token',
      data: JSON.stringify({
        traceId,
        data,
      }),
    });

    if (isEmptyObject(data) || !data) {
      await logDetails({
        traceId: traceId,
        message: 'Token not exist in redis',
      });
      return res.status(403).json(
        formatResponse({
          action: 'Verify token.',
          code: 0,
          data: [{ message: 'Forbidden' }],
        })
      );
    }

    await logDetails({
      traceId: traceId,
      message: 'Token exists in redis',
      data: JSON.stringify(data),
    });

    const isUserExist = await userAppEvents({
      payload: {
        event: 'CHECK_USER_EXIST',
        data: { email },
      },
      session,
    });

    if (isUserExist?.length === 0) {
      await logDetails({
        traceId: traceId,
        message: 'User not exist',
      });
      await session.abortTransaction();
      return res.status(403).json(
        formatResponse({
          action: 'Verify token.',
          code: 0,
          data: [{ message: 'Forbidden' }],
        })
      );
    }

    const isSessionExist = await getSession(data?.userId, session);

    if (isSessionExist?.length === 0) {
      await logDetails({
        traceId: traceId,
        message: 'Session not exist',
        data: JSON.stringify(
          formatResponse({
            action: 'Verify token.',
            code: 0,
            data: [{ message: 'Forbidden' }],
          })
        ),
      });
      await session.abortTransaction();
      return res.status(403).json(
        formatResponse({
          action: 'Verify token.',
          code: 0,
          data: [{ message: 'Forbidden' }],
        })
      );
    }

    if (validateDates(getCurrentUTC(), isSessionExist?.[0]?.expiryTime)) {
      await session.commitTransaction();
      const responseData = formatResponse({
        action: 'Verify token.',
        code: 1,
        data: [{ message: 'Token verified Successfully.' }],
      });
      return res.status(200).json(responseData);
    } else {
      await session.abortTransaction();
      return res.status(403).json(
        formatResponse({
          action: 'Verify token.',
          code: 0,
          data: [{ message: 'Forbidden' }],
        })
      );
    }
  } catch (error) {
    await session.abortTransaction();
    await logDetails({
      level: 'error',
      traceId: traceId,
      message: 'Error verifying token',
      data: error.message,
    });
    return res.status(500).json(
      formatResponse({
        action: 'Verify token.',
        code: 0,
        data: [{ message: error?.message || 'Internal Server Error' }],
      })
    );
  } finally {
    session.endSession();
  }
};
module.exports = { verifyToken };
