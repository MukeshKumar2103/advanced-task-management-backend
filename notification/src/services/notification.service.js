const { default: mongoose } = require('mongoose');
const helpers = require('../helpers');
const createNotificationInfo = require('../database/repository/notification.repository');

const { Logs, SendEmail, Formators } = helpers;

const { logDetails } = Logs;
const { formatResponse } = Formators;

const sendNotification = async (req, res) => {
  const { traceId, ...logObject } = await req['formatedData'];

  const session = await mongoose.startSession();
  session.startTransaction();

  await logDetails({
    traceId: traceId,
    message: 'Inside send notification service',
    data: JSON.stringify(logObject),
  });

  try {
    const payload = {
      sendTo: req?.body?.sendTo,
      event: req?.body?.event,
      content: req?.body?.data?.content,
      responseId: '',
      status: '',
    };

    const res = await SendEmail({
      to: payload?.sendTo,
      content: payload?.content,
    });

    await logDetails({
      traceId: traceId,
      message: 'After send notification',
      data: JSON.stringify({
        messageId: res?.messageId,
      }),
    });

    payload['status'] = 'SUCCESS';
    payload['responseId'] = res?.messageId;

    await createNotificationInfo({ data: payload, session });

    await logDetails({
      traceId: traceId,
      message: 'After inserted notification data',
      data: JSON.stringify({
        messageId: res?.messageId,
      }),
    });

    await session.commitTransaction();

    if (res?.status !== 200) throw new Error('Email not sent');

    const formatedResponse = formatResponse({
      action: 'Signup',
      code: 1,
      data: [{ message: 'Email send successfully' }],
    });

    return res.status(200).json(formatedResponse);
  } catch (error) {
    const formatedResponse = formatResponse({
      action: 'Signup',
      code: 1,
      data: [{ message: error?.message }],
    });

    logDetails({});
    return res.status(200).json(formatedResponse);
  }
};

module.exports = sendNotification;
