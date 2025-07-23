// models/Exam.model.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, 'At least two options are required'],
  },
  correctOptionIndex: {
    type: Number,
    required: true,
  },
});

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    timeLimit: {
      type: Number,
      required: true,
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;
