const { Router } = require('express');
const { formatRequest } = require('../../helpers/formators');
const {
  checkUserIsExist,
  createUser,
  updateUser,
  getUser,
} = require('../../services/user_services.service');

const router = Router();

router.post('/create', formatRequest(false), createUser);
router.get('/current', formatRequest(false), getUser);
router.post('/update', formatRequest(false), updateUser);
router.post('/check-user', formatRequest(false), checkUserIsExist);

module.exports = router;
