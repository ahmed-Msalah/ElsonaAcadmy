const mongoose = require('mongoose');
const Level = require('../models/level.model');
const Subject = require('../models/subject.model');
const Lecture = require('../models/lecture.model');
const CompletedLecture = require('../models/CompletedLecture.model');
const CompletedSubject = require('../models/CompletedSubject.model');

const getAllLevels = async (req, res) => {
  try {
    const levels = await Level.find().sort({ levelNumber: 1 });
    res.status(200).json({ status: 200, data: levels });
  } catch (err) {
    res.status(500).json({ status: 500, message: 'Server error' });
  }
};

const createLevel = async (req, res) => {
  try {
    const { levelNumber, title, description } = req.body;

    const exists = await Level.findOne({ levelNumber });
    if (exists) {
      return res.status(400).json({ status: 400, message: 'Level already exists' });
    }

    const newLevel = await Level.create({ levelNumber, title, description });

    res.status(201).json({
      status: 201,
      message: 'Level created successfully',
      data: newLevel,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: 'Server error' });
  }
};

const updateLevel = async (req, res) => {
  try {
    const levelId = req.params.id;
    const body = req.body;

    if (body.levelNumber)
      return res.status(400).json({ status: 400, message: "Level number can't be changed" });

    const updatedLevel = await Level.findByIdAndUpdate(levelId, body, { new: true });

    if (!updatedLevel) {
      return res.status(404).json({ status: 404, message: 'Level not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Level updated successfully',
      data: updatedLevel,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: 'Server error' });
  }
};

const deleteLevel = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: levelId } = req.params;

    // Check if level exists
    const level = await Level.findById(levelId).session(session);
    if (!level) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: 404, message: 'Level not found' });
    }


    // Find subjects related to the level
    const subjects = await Subject.find({ levelId: levelId }).session(session);
    const subjectIds = subjects.map(subject => subject._id);

    // Find lectures related to the subjects
    let lectureIds = [];
    if (subjectIds.length > 0) {
      const lectures = await Lecture.find({ subjectId: { $in: subjectIds } }).session(session);
      lectureIds = lectures.map(lec => lec._id);
    }

    // Delete CompletedLecture related to lectures
    if (lectureIds.length > 0) {
      await CompletedLecture.deleteMany({ lectureId: { $in: lectureIds } }).session(session);
      await Lecture.deleteMany({ subjectId: { $in: subjectIds } }).session(session);
    }

    // Delete CompletedSubject related to subjects
    if (subjectIds.length > 0) {
      await CompletedSubject.deleteMany({ subjectId: { $in: subjectIds } }).session(session);
      await Subject.deleteMany({ _id: { $in: subjectIds } }).session(session);
    }

    // Delete the level
    await Level.findByIdAndDelete(levelId).session(session);

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ status: 200, message: 'Level and associated content deleted successfully' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ status: 500, message: 'Server error' });
  }
};
module.exports = { getAllLevels, deleteLevel, updateLevel, createLevel };
