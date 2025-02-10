const { Router } = require('express');
const { userAuthServices } = require('../../services');
const { Formators } = require('../../helpers');

const { formatRequest } = Formators;

const { signUp, signIn, verifyEmail } = userAuthServices;

const router = Router();

router.post('/sign-up', formatRequest(false), signUp);
router.post('/sign-in', formatRequest(false), signIn);
router.post('/verify-email', formatRequest(false), verifyEmail);
router.post('/toke/verify', formatRequest(false), verifyEmail);

module.exports = router;
