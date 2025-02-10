const { Router } = require('express');
const { UserRoleServices } = require('../../services');
const { Formators } = require('../../helpers');

const { formatRequest } = Formators;

const { createUserRole } = UserRoleServices;

const router = Router();

router.post('/create', formatRequest(false), createUserRole);

module.exports = router;
