const { Router } = require('express');
const middlewares = require('../../middlewares');

const { sessions, auth, routes, callServices } = middlewares;

const { sessionAudit } = sessions;
const { verifyToken } = auth;
const { getActualRoute, verifyRoute } = routes;

const router = Router();

router.all(
  '/*',
  sessionAudit,
  getActualRoute,
  verifyRoute,
  verifyToken,
  callServices
);

module.exports = router;
