const moment = require('moment');
const User = require('../models/user.model.js');
const Subject = require('../models/subject.model');
const Lecture = require('../models/lecture.model');
const CompletedLecture = require('../models/CompletedLecture.model');
const CompletedSubject = require('../models/CompletedSubject.model');
const bcrypt = require('bcrypt');
const ExamAttempt = require('../models/ExamAttempt.model');
const Exam = require('../models/exam.model');

const getAllUsers = async (req, res) => {
  try {
    const { user } = req;
    const users = await User.find().select('-role');

    if (users.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    res.status(200).json({ all: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOOR: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userData = await User.findById(req.params.id);
    if (!userData) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json({ userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOOR: error.message });
  }
};

const updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    console.log('upated user data', updatedUser);

    if (!updatedUser) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOOR: error.message });
  }
};
//////////////////////(student endpoint)////////////////////////////////
const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: 'currentLevelId',
        select: 'levelNumber',
      })
      .select('name email phoneNumber gender birthDate currentLevelId');

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 200,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        birthDate: user.birthDate.toISOString().split('T')[0],
        currentLevel: user.currentLevelId.levelNumber,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: 'Server Error',
    });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const { user } = req;
    const id = user.id;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: 'currentLevelId',
      select: 'levelNumber',
    });

    console.log('upated user data', updatedUser);

    if (!updatedUser) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json({
      message: 'Student updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        gender: updatedUser.gender,
        birthDate: updatedUser.birthDate.toISOString().split('T')[0],
        currentLevel: updatedUser.currentLevelId.levelNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOOR: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { user } = req;
    const id = req.user.id;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Studnet not found' });
    }

    return res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { user } = req;
    const userId = user.id;
    console.log('user from change password endpoint', user);

    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, userData.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = hashedPassword;
    await userData.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOORr: error.message });
  }
};
const getSubjectsWithLectures = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's current level
    const user = await User.findById(userId).select('currentLevelId');
    const levelId = user.currentLevelId;

    // Get all subjects in current level
    const subjects = await Subject.find({ levelId }).lean();

    const completedSubjects = await CompletedSubject.find({ userId }).select('subjectId');
    const completedLectures = await CompletedLecture.find({ userId }).select('lectureId');

    const completedSubjectIds = completedSubjects.map(s => s.subjectId.toString());
    const completedLectureIds = completedLectures.map(l => l.lectureId.toString());

    const subjectsWithLectures = await Promise.all(
      subjects.map(async subject => {
        const lectures = await Lecture.find({ subjectId: subject._id }).lean();

        const totalLectures = lectures.length;
        const completedCount = lectures.filter(lec =>
          completedLectureIds.includes(lec._id.toString()),
        ).length;
        const progress = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

        return {
          id: subject._id,
          name: subject.name,
          imageUrl: subject.imageUrl,
          description: subject.description,
          bookUrl: subject.bookUrl,
          isCompleted: completedSubjectIds.includes(subject._id.toString()),
          completionCondition: subject.completionCondition || null,
          progress,
          lectures: lectures.map(lec => ({
            id: lec._id,
            name: lec.name,
            description: lec.description,
            contentType: lec.contentType,
            contentUrl: lec.contentUrl,
            isCompleted: completedLectureIds.includes(lec._id.toString()),
            completionCondition: lec.completionCondition || null,
          })),
        };
      }),
    );

    res.status(200).json({
      status: 200,
      data: {
        level: levelId, // ممكن ترجع levelNumber لو عاوز
        subjects: subjectsWithLectures,
      },
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ status: 500, message: 'Server error', error });
  }
};
const getStudentProgressReport = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's current level
    const user = await User.findById(userId)
      .populate({
        path: 'currentLevelId',
        select: 'levelNumber',
      })
      .select('currentLevelId');
    if (!user) return res.status(404).json({ status: 404, message: 'User not found' });
    console.log(user);

    const levelId = user.currentLevelId;

    // Get all subjects in current level
    const subjects = await Subject.find({ levelId }).lean();

    // Get completed lectures and subjects
    const completedLectures = await CompletedLecture.find({ userId }).select('lectureId');
    const completedLectureIds = completedLectures.map(l => l.lectureId.toString());

    const completedSubjects = await CompletedSubject.find({ userId }).select('subjectId');
    const completedSubjectIds = completedSubjects.map(s => s.subjectId.toString());

    // Prepare subjects progress
    let totalLectures = 0;
    let totalCompletedLectures = 0;

    const subjectsProgress = await Promise.all(
      subjects.map(async subject => {
        const lectures = await Lecture.find({ subjectId: subject._id }).lean();
        const subjectLectureIds = lectures.map(lec => lec._id.toString());

        const completedCount = subjectLectureIds.filter(id =>
          completedLectureIds.includes(id),
        ).length;

        totalLectures += lectures.length;
        totalCompletedLectures += completedCount;

        // Get last exam score for this subject
        const exam = await Exam.findOne({ subjectId: subject._id }).lean();
        let lastExamScore = null;
        if (exam) {
          const lastAttempt = await ExamAttempt.findOne({ userId, examId: exam._id }).sort({
            attemptedAt: -1,
          });
          lastExamScore = lastAttempt ? lastAttempt.score : null;
        }

        return {
          subjectId: subject._id,
          subjectName: subject.name,
          progress: lectures.length > 0 ? Math.round((completedCount / lectures.length) * 100) : 0,
          completedLectures: completedCount,
          totalLectures: lectures.length,
          lastExamScore,
          isCompleted: completedSubjectIds.includes(subject._id.toString()),
        };
      }),
    );

    // Calculate overall progress
    const overallProgress =
      totalLectures > 0 ? Math.round((totalCompletedLectures / totalLectures) * 100) : 0;

    res.status(200).json({
      status: 200,
      data: {
        currentLevel: levelId.levelNumber,
        overallProgress,
        subjects: subjectsProgress,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error', error });
  }
};
const completeSubject = async (req, res) => {
  try {
    const userId = req.user.id;
    const subjectId = req.params.subjectId;

    // تحقق من وجود المادة
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ status: 404, message: 'Subject not found' });
    }

    // قبل إضافة المادة كمكتملة، تحقق من الشروط
    const lectures = await Lecture.find({ subjectId });
    const completedLectures = await CompletedLecture.find({
      userId,
      lectureId: { $in: lectures.map(l => l._id) },
    });
    const allLecturesCompleted = completedLectures.length === lectures.length;

    // لو فيه امتحان للمادة، تحقق من النجاح فيه
    const exam = await Exam.findOne({ subjectId });
    let examPassed = true;
    if (exam) {
      const attempt = await ExamAttempt.findOne({ userId, examId: exam._id });
      examPassed = attempt && attempt.passed;
    }

    if (allLecturesCompleted && examPassed) {
      // سجل المادة كمكتملة
      await CompletedSubject.create({ userId, subjectId });
      res.status(200).json({ status: 200, message: 'Subject marked as complete' });
    } else {
      res.status(400).json({ status: 400, message: 'Subject not completed yet' });
    }
  } catch (error) {
    console.error('Error completing subject:', error);
    res.status(500).json({ status: 500, message: 'Server error', error });
  }
};

module.exports = {
  deleteStudent,
  getUserById,
  updateUserById,
  getAllUsers,
  changePassword,
  getStudentProfile,
  updateStudentProfile,
  getSubjectsWithLectures,
  getStudentProgressReport,
  completeSubject,
};
