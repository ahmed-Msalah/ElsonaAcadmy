const mongoose = require('mongoose');

const completedSubjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const CompletedSubject = new mongoose.model('CompletedSubject', completedSubjectSchema);
module.exports = CompletedSubject;
