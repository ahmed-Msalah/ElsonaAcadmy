const express = require('express');
const Router = express.Router();
const {
  deleteStudent,
  changePassword,
  getStudentProfile,
  updateStudentProfile,
  getSubjectsWithLectures,
  getStudentProgressReport,
  completeSubject,
} = require(`../controller/userController.js`);
const { getSubjectByName } = require('../controller/subjectController.js');
const { getExamDetails, submitExam } = require('../controller/studentExamController.js');
const { markLectureComplete } = require('../controller/lectureController.js');
const { authenticateToken } = require('../middleware/authorized.middleware.js');
const { route } = require('./auth.route.js');

Router.route('/changePassword').put(authenticateToken, changePassword);
Router.route('/profile')
  .get(authenticateToken, getStudentProfile)
  .put(authenticateToken, updateStudentProfile)
  .delete(authenticateToken, deleteStudent);

// Route to get exam details
Router.route('/exams/:examId').get(authenticateToken, getExamDetails);
Router.route('/exams/:examId/submit').post(authenticateToken, submitExam);
module.exports = Router;
//student lecture completion
Router.route('/lectures/:lectureId/complete').post(authenticateToken, markLectureComplete);
//student progress
Router.get('/progress', authenticateToken, getStudentProgressReport);
// اكتمال المادة بشرط تحقق كل المحاضرات والامتحان
Router.route('/subjects/:subjectId/complete').post(authenticateToken, completeSubject);
Router.route('/subjects').get(authenticateToken, getSubjectsWithLectures);
Router.route('/subjects/name/:name').get(authenticateToken, getSubjectByName);
module.exports = Router;
