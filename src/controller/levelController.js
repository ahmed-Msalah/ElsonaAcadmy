const Level = require('../models/level.model');

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

    if (body.levelNumber) return res.status(400).json({ status: 400, message: "Level number can't be changed" });

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
  try {
    const levelId = req.params.id;

    const deleted = await Level.findByIdAndDelete(levelId);

    if (!deleted) {
      return res.status(404).json({ status: 404, message: 'Level not found' });
    }

    res.status(200).json({ status: 200, message: 'Level deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 500, message: 'Server error' });
  }
};
module.exports = { getAllLevels, deleteLevel, updateLevel, createLevel };
