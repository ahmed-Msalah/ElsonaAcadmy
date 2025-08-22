const mongoose = require('mongoose');
const getDirectDownloadUrl = require('../service/directLink');
const completionConditionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['exam', 'auto'],
      default: 'auto', // ✅ دعم النوعين
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: function () {
        return this.type === 'exam'; // ✅ مطلوب فقط لو النوع "exam"
      },
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
      required: false, // ✅ لأنها optional في حالة auto
    },
  },
  { timestamps: true },
);

lectureSchema.pre('save', async function (next) {
  if (this.isModified('contentUrl') || this.isNew) {
    try {
      this.contentUrl = await getDirectDownloadUrl(this.contentUrl, this.contentType);
    } catch (err) {
      console.error('Error converting contentUrl:', err.message);
    }
  }
  next();
});

const Lecture = new mongoose.model('Lecture', lectureSchema);
module.exports = Lecture;
