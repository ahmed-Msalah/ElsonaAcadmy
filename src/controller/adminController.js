const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const Level = require('../models/level.model');
const Subject = require('../models/subject.model');
const Lecture = require('../models/lecture.model');
const CompletedLecture = require('../models/CompletedLecture.model');
const Exam = require('../models/exam.model');
const ExamAttempt = require('../models/ExamAttempt.model');
const CompletedSubject = require('../models/CompletedSubject.model');

// Get All Admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json({
      status: 200,
      data: admins.map(admin => ({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        gender: admin.gender,
        role: admin.role,
        createdAt: admin.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error', error: error.message });
  }
};

// Create New Admin
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, userName, gender } = req.body;

    // Check if email exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ status: 400, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      userName,
      password: hashedPassword,
      phoneNumber,
      gender,
      role: 'admin',
    });

    res.status(201).json({
      status: 201,
      message: 'Admin created successfully',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        gender: admin.gender,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error', error: error.message });
  }
};

// Delete Admin
const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    // تحقق هل هذا هو أول أدمن (سوبر أدمن)
    const firstAdmin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
    if (firstAdmin && firstAdmin._id.toString() === adminId) {
      return res.status(403).json({ status: 403, message: 'Cannot delete Super Admin' });
    }

    const deleted = await User.findOneAndDelete({ _id: adminId, role: 'admin' });
    if (!deleted) {
      return res.status(404).json({ status: 404, message: 'Admin not found' });
    }
    res.status(200).json({ status: 200, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error', error: error.message });
  }
};

const getStudentDetailedReport = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Get student basic info
    const student = await User.findById(studentId)
      .populate({ path: 'currentLevelId', select: 'levelNumber' })
      .select('name email currentLevelId');
    if (!student) return res.status(404).json({ status: 404, message: 'Student not found' });

    const levelId = student.currentLevelId;
    const levelNumber = levelId.levelNumber;

    // Get subjects in current level
    const subjects = await Subject.find({ levelId }).lean();

    // Get completed lectures for student
    const completedLectures = await CompletedLecture.find({ userId: studentId });
    const completedLectureMap = {};
    completedLectures.forEach(cl => {
      completedLectureMap[cl.lectureId.toString()] = cl.createdAt;
    });

    // Prepare subject reports
    let totalLectures = 0;
    let totalCompletedLectures = 0;

    const subjectsReport = await Promise.all(
      subjects.map(async subject => {
        // Lectures
        const lectures = await Lecture.find({ subjectId: subject._id }).lean();
        totalLectures += lectures.length;

        const lectureReports = lectures.map(lec => {
          const isCompleted = completedLectureMap.hasOwnProperty(lec._id.toString());
          if (isCompleted) totalCompletedLectures++;
          return {
            lectureId: lec._id,
            lectureName: lec.name,
            isCompleted,
            completedAt: isCompleted ? completedLectureMap[lec._id.toString()].toISOString() : null,
          };
        });

        // Exams
        const exams = await Exam.find({ subjectId: subject._id }).lean();
        const examResults = await Promise.all(
          exams.map(async exam => {
            const attempts = await ExamAttempt.find({ userId: studentId, examId: exam._id }).sort({
              attemptedAt: -1,
            });
            if (attempts.length === 0) return null;
            const lastAttempt = attempts[0];
            return {
              examId: exam._id,
              examTitle: exam.title,
              score: lastAttempt.score,
              totalMarks: exam.totalMarks,
              attempts: attempts.length,
              lastAttemptAt: lastAttempt.attemptedAt ? lastAttempt.attemptedAt.toISOString() : null,
            };
          }),
        );

        return {
          subjectId: subject._id,
          subjectName: subject.name,
          progress:
            lectures.length > 0
              ? Math.round(
                  (lectureReports.filter(l => l.isCompleted).length / lectures.length) * 100,
                )
              : 0,
          completedLectures: lectureReports.filter(l => l.isCompleted).length,
          totalLectures: lectures.length,
          lectureReports,
          examResults: examResults.filter(e => e !== null),
        };
      }),
    );

    // Calculate overall progress
    const overallProgress =
      totalLectures > 0 ? Math.round((totalCompletedLectures / totalLectures) * 100) : 0;

    res.status(200).json({
      status: 200,
      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          currentLevel: levelNumber,
        },
        overallProgress,
        subjects: subjectsReport,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error', error: error.message });
  }
};

const getAllStudentsProgressReports = async (req, res) => {
  try {
    // Get all students
    const students = await User.find({ role: 'student' })
      .populate({
        path: 'currentLevelId',
        select: 'levelNumber',
      })
      .select('name email currentLevelId');

    const reports = await Promise.all(
      students.map(async student => {
        const levelId = student.currentLevelId?._id || student.currentLevelId;
        const levelNumber = student.currentLevelId?.levelNumber || null;

        // Subjects in current level
        const subjects = await Subject.find({ levelId }).lean();
        const totalSubjects = subjects.length;

        // Completed subjects
        const completedSubjects = await CompletedSubject.find({ userId: student._id });
        const completedSubjectsCount = completedSubjects.length;

        // Exams attempts for this student
        const examAttempts = await ExamAttempt.find({ userId: student._id });
        const scores = examAttempts.map(a => a.score);
        const averageScore =
          scores.length > 0
            ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
            : null;

        // Overall progress: نسبة المواد المكتملة من إجمالي المواد
        const overallProgress =
          totalSubjects > 0 ? Math.round((completedSubjectsCount / totalSubjects) * 100) : 0;

        return {
          student: {
            id: student._id,
            name: student.name,
            email: student.email,
            currentLevel: levelNumber,
          },
          overallProgress,
          completedSubjects: completedSubjectsCount,
          totalSubjects,
          averageScore,
        };
      }),
    );

    res.status(200).json({
      status: 200,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error', error: error.message });
  }
};

const getDashboardStatistics = async (req, res) => {
  try {
    const [
      totalStudents,
      totalLevels,
      totalSubjects,
      totalLectures,
      totalExams,
      completedExams,
      examAttempts,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Level.countDocuments(),
      Subject.countDocuments(),
      Lecture.countDocuments(),
      Exam.countDocuments(),
      ExamAttempt.countDocuments(),
      ExamAttempt.find({}, 'score'),
    ]);

    const averageScore =
      examAttempts.length > 0
        ? Number(
            (
              examAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / examAttempts.length
            ).toFixed(2),
          )
        : 0;

    res.status(200).json({
      status: 200,
      data: {
        totalStudents,
        totalLevels,
        totalSubjects,
        totalLectures,
        totalExams,
        completedExams,
        averageScore,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  getStudentDetailedReport,
  getAllStudentsProgressReports,
  getDashboardStatistics,
};
