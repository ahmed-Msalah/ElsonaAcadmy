const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  score: { type: Number, required: true },
  answers: [
    {
      questionId: String,
      selectedOptionIndex: Number,
      correctOptionIndex: Number,
      isCorrect: Boolean,
    },
  ],
  attemptedAt: { type: Date, default: Date.now },
});

const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);
module.exports = ExamAttempt;