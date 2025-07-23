const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
      required: true,
    },
    imageUrl: String,
    bookUrl: String,
    completionCondition: {
      type: {
        type: String,
        enum: ['exam'],
        required: true,
      },
      examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

module.exports = mongoose.model('Subject', subjectSchema);
