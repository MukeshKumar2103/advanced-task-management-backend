const { SessionAuditRepository } = require('../database/index');

const mongoose = require('mongoose');

const auditSession = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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
