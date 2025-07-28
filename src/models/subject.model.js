const mongoose = require('mongoose');

const completionConditionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['exam', 'auto'],
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: function () {
        return this.type === 'exam';
      },
    },
  },
  { _id: false },
);

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    bookUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
      required: true,
    },
    completionCondition: {
      type: completionConditionSchema,
      required: false,
    },
  },
  { timestamps: true },
);

const Subject = new mongoose.model('Subject', subjectSchema);
module.exports = Subject;
