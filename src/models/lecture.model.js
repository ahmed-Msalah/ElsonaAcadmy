const mongoose = require('mongoose');

const completionConditionSchema = new mongoose.Schema(
  {
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
  { _id: false },
);

const lectureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    contentType: {
      type: String,
      enum: ['video', 'pdf', 'text'],
      required: true,
    },
    contentUrl: {
      type: String,
      required: true,
    },
    completionCondition: {
      type: completionConditionSchema,
      required: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Lecture', lectureSchema);
