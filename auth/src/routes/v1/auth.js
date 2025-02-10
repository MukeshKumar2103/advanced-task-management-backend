const { Router } = require('express');

const { userAuthServices } = require('../../services');
const { Formators } = require('../../helpers');

const { formatRequest } = Formators;

const { signUp, signIn, verifyEmail } = userAuthServices;

const router = Router();

router.post('/sign-up', formatRequest(true), signUp);
router.post('/sign-in', formatRequest(true), signIn);
router.post('/verify-token', formatRequest(true), verifyEmail);
router.post('/verify-email', formatRequest(true), verifyEmail);

module.exports = router;
