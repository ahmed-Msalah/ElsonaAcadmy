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
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture',
      required: false,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: false,
    },
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
      required: true, // A level is always required for any exam.
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

// Add a pre-validation hook to ensure data integrity for exam associations.
examSchema.pre('validate', function (next) {
  // Rule: If an exam is for a specific lecture, it must also be linked to a subject.
  if (this.lectureId && !this.subjectId) {
    return next(new Error('An exam for a specific lecture must also be linked to a subject.'));
  }

  // If all checks pass, proceed with saving.
  next();
});

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;
