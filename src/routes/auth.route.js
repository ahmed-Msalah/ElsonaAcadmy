const express = require('express');
const {
  createAccount,
  login,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} = require('../controller/authController.js');

const Router = express.Router();

Router.post('/register', createAccount);
Router.post('/login', login);
Router.post('/password/forget', requestPasswordReset);
Router.post('/password/forget/verify', verifyResetCode);
Router.put('/password/reset', resetPassword);

module.exports = Router;
