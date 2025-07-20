const express = require('express');
const Router = express.Router();
const {
  getUserById,
  updateUserById,
  getAllUsers,
  deleteStudent,
  changePassword,
  getStudentProfile,
  updateStudentProfile,
} = require(`../controller/userController.js`);
const { authenticateToken } = require('../middleware/authorized.middleware.js');
Router.route('/admin').get(authenticateToken, getAllUsers);
Router.route('/admin/:id').get(authenticateToken, getUserById).put(authenticateToken, updateUserById);

Router.route('/changePassword').put(authenticateToken, changePassword);
Router.route('/me')
  .get(authenticateToken, getStudentProfile)
  .put(authenticateToken, updateStudentProfile)
  .delete(authenticateToken, deleteStudent);
module.exports = Router;
