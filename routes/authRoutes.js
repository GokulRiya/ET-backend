const express = require('express');
const router = express.Router();

const { userRegister, userLogin, getAllUsers } = require('../controllers/authContoller');

router.post('/register', userRegister);
router.post('/login', userLogin);
router.get('/', getAllUsers);

module.exports = router;