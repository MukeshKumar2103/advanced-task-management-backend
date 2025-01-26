const APIBusMasterModel = require('../models/api_master.model');

const { DateUtil } = require('../../helpers');

const { getCurrentUTC } = DateUtil;

const createApiRoute = async (req, session = null) => {
  console.log('session', session);
  try {
    const newRoute = {
      dns: req.body.dns,
      path: req.body.path,
      method: req.body.method,
      backendAPI: req.body.backendAPI,
      isPublic: req.body.isPublic,
      isActive: req.body.isActive,
      service: req.body.service,
    };

    const result = await APIBusMasterModel.create([newRoute]);

    return result;
  } catch (error) {
    console.error('Error creating API route:', error.message);
    throw new Error(`Failed to create API route: ${error.message}`);
  }
};

const updateAPIRoute = async (req) => {
  const newRoute = {
    dns: req.body.dns,
    path: req.body.path,
    method: req.body.method,
    backendAPI: req.body.backendAPI,
    isPublic: req.body.isPublic,
    isActive: req.body.isActive,
    service: req.body.service,
  };

  const updatedAPIRoute = await APIBusMasterModel.aggregate([
    {
      $match: {
        path: newRoute?.path,
        status: 'active',
      },
    },
    {
      $set: {
        ...newRoute,
        updataedAt: getCurrentUTC(),
      },
    },
    {
      $merge: {
        into: 'resource_sessions',
        whenMatched: 'merge',
        whenNotMatched: 'discard',
      },
    },
  ]);

  return updatedAPIRoute;
};

const getApiRoute = async (req, session = null) => {
  const path = req?.route?.path;

  try {
    const api = await APIBusMasterModel.find(
      {
        api: path,
        isActive: true,
      },
      null,
      { session }
    );

    return api;
  } catch (error) {
    throw new Error(`Error fetching API route: ${error.message}`);
  }
};

const getAllActiveRoutes = async (session = null) => {
  try {
    const activeRoutes = await APIBusMasterModel.find(
      { isActive: true },
      null,
      { session }
    );

    return activeRoutes;
  } catch (error) {
    throw new Error(`Error fetching active routes: ${error.message}`);
  }
};

module.exports = {
  createApiRoute,
  updateAPIRoute,
  getApiRoute,
  getAllActiveRoutes,
};
