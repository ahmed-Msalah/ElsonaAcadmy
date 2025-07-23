const mongoose = require('mongoose');
const levelSchema = new mongoose.Schema(
  {
    levelNumber: {
      type: Number,
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    strict: true,
    timestamps: true,
  },
);

const Level = new mongoose.model('Level', levelSchema, 'Levels');
module.exports = Level;
