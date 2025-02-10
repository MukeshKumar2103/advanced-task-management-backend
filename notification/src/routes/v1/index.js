const { Router } = require('express');

const emailRoutes = require('./email');

// const { subscribeEvents } = require('../../services/subscribe_events');

const router = Router();

router.use('/api/v1', emailRoutes);

// router.use('/api/v1/app-events', subscribeEvents);

module.exports = router;
