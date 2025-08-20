const Exam = require('../models/exam.model');

const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find();

    const examsWithCount = exams.map(exam => {
      const { questions, ...rest } = exam._doc;
      return {
        ...rest,
        questionsCount: questions?.length || 0,
      };
    });

    res.status(200).json({ status: 200, data: examsWithCount });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
  }
};

const createExam = async (req, res) => {
  try {
    const { title, description, totalMarks, timeLimit, questions, levelId, lectureId, subjectId } =
      req.body;

    const exam = await Exam.create({
      title,
      description,
      totalMarks,
      timeLimit,
      questions,
      levelId,
      lectureId,
      subjectId,
    });

    res.status(201).json({
      status: 201,
      message: 'Exam created successfully',
      data: {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        totalMarks: exam.totalMarks,
        timeLimit: exam.timeLimit,
        questionsCount: exam.questions.length,
        createdAt: exam.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
  }
};

const updateExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const { title, description, totalMarks, timeLimit, questions } = req.body;

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      { title, description, totalMarks, timeLimit, questions },
      { new: true },
    );

    if (!updatedExam) {
      return res.status(404).json({ status: 404, message: 'Exam not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Exam updated successfully',
      data: {
        id: updatedExam._id,
        title: updatedExam.title,
        description: updatedExam.description,
        totalMarks: updatedExam.totalMarks,
        timeLimit: updatedExam.timeLimit,
        questionsCount: updatedExam.questions.length,
        createdAt: updatedExam.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
  }
};

const deleteExam = async (req, res) => {
  try {
    const examId = req.params.id;

    const deletedExam = await Exam.findByIdAndDelete(examId);
    if (!deletedExam) {
      return res.status(404).json({ status: 404, message: 'Exam not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
};
