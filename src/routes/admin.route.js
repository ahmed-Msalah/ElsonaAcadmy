const express = require('express');
const Router = express.Router();
const {
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  getStudentDetailedReport,
  getAllStudentsProgressReports,
  getDashboardStatistics,
} = require('../controller/adminController');
const { getUserById, updateUserById, getAllUsers } = require(`../controller/userController.js`);
const {
  getAllLevels,
  deleteLevel,
  updateLevel,
  createLevel,
} = require('../controller/levelController.js');
const {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
  getExamById,
} = require('../controller/examController.js');
const {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectByName,
} = require('../controller/subjectController.js');
const {
  getAllLectures,
  createLecture,
  updateLecture,
  deleteLecture,
} = require('../controller/lectureController.js');
const { authenticateToken } = require('../middleware/authorized.middleware.js');
const isAdmin = require('../middleware/isAdmin.js');
Router.route('/students').get(authenticateToken, isAdmin, getAllUsers);
Router.route('/students/:id')
  .get(authenticateToken, isAdmin, getUserById)
  .put(authenticateToken, isAdmin, updateUserById);
//levelRoutes
Router.route('/levels')
  .get(authenticateToken, isAdmin, getAllLevels)
  .post(authenticateToken, isAdmin, createLevel);
Router.route('/levels/:id')
  .put(authenticateToken, isAdmin, updateLevel)
  .delete(authenticateToken, isAdmin, deleteLevel);
//examRoutes
Router.route('/exams')
  .get(authenticateToken, isAdmin, getAllExams)
  .post(authenticateToken, isAdmin, createExam);
Router.route('/exams/:id')
  .put(authenticateToken, isAdmin, updateExam)
  .delete(authenticateToken, isAdmin, deleteExam)
  .get(authenticateToken, isAdmin, getExamById);

//subjectRoutes
Router.route('/subjects')
  .get(authenticateToken, isAdmin, getAllSubjects)
  .post(authenticateToken, isAdmin, createSubject);
Router.route('/subjects/:id')
  .put(authenticateToken, isAdmin, updateSubject)
  .delete(authenticateToken, isAdmin, deleteSubject);

//lectureRoutes
Router.route('/lectures')
  .get(authenticateToken, isAdmin, getAllLectures)
  .post(authenticateToken, isAdmin, createLecture);
Router.route('/lectures/:id')
  .put(authenticateToken, isAdmin, updateLecture)
  .delete(authenticateToken, isAdmin, deleteLecture);
//adminRoutes
Router.route('/admins')
  .get(authenticateToken, isAdmin, getAllAdmins)
  .post(authenticateToken, isAdmin, createAdmin);
Router.route('/admins/:adminId').delete(authenticateToken, isAdmin, deleteAdmin);

// Get Student Detailed Report
Router.get('/students/:studentId/report', authenticateToken, getStudentDetailedReport);
// Get All Students Progress Reports
Router.get('/reports', authenticateToken, isAdmin, getAllStudentsProgressReports);
// Dashboard Statistics
Router.get('/dashboard', authenticateToken, isAdmin, getDashboardStatistics);

module.exports = Router;
