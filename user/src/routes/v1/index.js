const { Router } = require('express');

const userRoutes = require('./user');
const userRolesRoutes = require('./user_roles');
const userAuthRoutes = require('./user_auth.js');

const {
  subscribeEvents,
} = require('../../services/subscribe_events.service.js');

const router = Router();

router.use('/api/v1/auth', userAuthRoutes);

router.use('/api/v1/user', userRoutes);

router.use('/api/v1/user-roles', userRolesRoutes);

router.use('/api/v1/app-events', subscribeEvents);

module.exports = router;
