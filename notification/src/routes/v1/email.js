const { Router } = require('express');
const { Formators } = require('../../helpers');
const sendNotification = require('../../services/notification.service');

const { formatRequest } = Formators;

const router = Router();

router.post('/send-email', formatRequest(true), sendNotification);

module.exports = router;
