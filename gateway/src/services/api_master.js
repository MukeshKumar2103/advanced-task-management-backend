const mongoose = require('mongoose');

const { APIBusMasterRepository } = require('../database/index');

const createRoute = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Perform your database operations with session
    const result = await APIBusMasterRepository.createApiRoute(req, {
      session,
    });

    if (result) {
      // Commit the transaction if the operation was successful
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({ success: true, data: result });
    } else {
      // Abort the transaction if the operation failed
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: 'API route creation failed',
      });
    }
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();

    return res.status(404).json({ success: false, message: error?.message });
  }
};

const getRoute = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await APIBusMasterRepository.getApiRoute(req, res, {
      session,
    });

    if (result) {
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({ success: true, data: result });
    } else {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: 'Failed to get API route',
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(404).json({
      success: false,
      message: error?.message || 'An error occurred while fetching the route',
    });
  }
};

module.exports = {
  createRoute,
  getRoute,
};
