const { Router } = require('express');
const Version1Routes = require('./gateway');

const router = Router();

router.use('/api/v1', Version1Routes);

module.exports = router;
