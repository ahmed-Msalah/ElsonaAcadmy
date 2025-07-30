const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    birthDate: { type: Date, required: false },
    phoneNumber: { type: String, required: false },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    resetPasswordCode: { type: String },
    resetPasswordExpires: { type: Date },
    resetPasswordVerified: { type: Boolean, default: false },
    currentLevelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
      required: false,
    },
  },
  { timestamps: true },
);

const User = new mongoose.model('User', userSchema, 'Users');
module.exports = User;
