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
      uniqe: true,
    },

    email: {
      type: String,
      required: true,
      uniqe: true,
    },

    password: {
      type: String,
      required: true,
    },
    birthDate: { type: Date, required: true },
    phoneNumber: { type: String, required: true },
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
      required: true,
    },
  },
  { timestamps: true },
);

const User = new mongoose.model('User', userSchema, 'Users');
module.exports = User;
