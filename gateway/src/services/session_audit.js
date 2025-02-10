const { SessionAuditRepository } = require('../database/index');

const mongoose = require('mongoose');
const { Logs } = require('../helpers');

const { logDetails } = Logs;

const auditSession = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  logDetails({
    traceId: req?.traceId,
    message: 'Before audit session creation',
  });

  try {
    const result = await SessionAuditRepository.createSessionAudit(req, res, {
      session,
    });

    await session.commitTransaction();
    return {
      success: true,
      message: 'Audit session created successfully',
      data: result,
    };
  } catch (error) {
    await session.abortTransaction();
    return {
      success: false,
      message:
        error?.message || 'An error occurred while creating the session audit',
    };
  } finally {
    session.endSession();
  }
};

module.exports = {
  auditSession,
};
