const Exam = require('../models/exam.model');
const ExamAttempt = require('../models/ExamAttempt.model');

const getExamDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = req.params.examId;

    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).json({ status: 404, message: 'Exam not found' });

    const attempt = await ExamAttempt.findOne({ userId, examId });

    res.status(200).json({
      status: 200,
      data: {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        totalMarks: exam.totalMarks,
        timeLimit: exam.timeLimit,
        questionsCount: exam.questions.length,
        isAttempted: !!attempt,
        lastScore: attempt ? attempt.score : null,
        questions: exam.questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error', error: error.message });
  }
};

const submitExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = req.params.examId;
    const { answers } = req.body;

    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).json({ status: 404, message: 'Exam not found' });

    // Prevent multiple attempts (optional)
    const prevAttempt = await ExamAttempt.findOne({ userId, examId });
    if (prevAttempt)
      return res.status(400).json({ status: 400, message: 'Exam already attempted' });

    let score = 0;
    const correctAnswers = exam.questions.map((q, idx) => {
      const userAnswer = answers.find(a => a.questionId === q.id);
      const isCorrect = userAnswer && userAnswer.selectedOptionIndex === q.correctOptionIndex;
      if (isCorrect) score += exam.totalMarks / exam.questions.length;
      return {
        questionId: q.id,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect: !!isCorrect,
      };
    });

    // Save attempt
    await ExamAttempt.create({
      userId,
      examId,
      score: Math.round(score),
      answers: correctAnswers.map((ans, idx) => ({
        questionId: ans.questionId,
        selectedOptionIndex: answers.find(a => a.questionId === ans.questionId)
          ?.selectedOptionIndex,
        correctOptionIndex: ans.correctOptionIndex,
        isCorrect: ans.isCorrect,
      })),
    });

    res.status(200).json({
      status: 200,
      data: {
        score: Math.round(score),
        totalMarks: exam.totalMarks,
        passed: score >= exam.totalMarks * 0.5, // Example: pass if >= 50%
        correctAnswers,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error', error: error.message });
  }
};
module.exports = {
  getExamDetails,
  submitExam,
};
