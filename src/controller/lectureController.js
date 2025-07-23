const Lecture = require('../models/lecture.model');

const getAllLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find();
    res.status(200).json({ status: 200, data: lectures });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error });
  }
};

const createLecture = async (req, res) => {
  try {
    const { name, description, subjectId, contentType, contentUrl, completionCondition } = req.body;

    const lecture = await Lecture.create({
      name,
      description,
      subjectId,
      contentType,
      contentUrl,
      completionCondition,
    });

    res.status(201).json({
      status: 201,
      message: 'Lecture created successfully',
      data: lecture,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error });
  }
};

const updateLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const updatedLecture = await Lecture.findByIdAndUpdate(lectureId, req.body, { new: true });

    if (!updatedLecture) {
      return res.status(404).json({ status: 404, message: 'Lecture not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Lecture updated successfully',
      data: updatedLecture,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error });
  }
};

const deleteLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const deletedLecture = await Lecture.findByIdAndDelete(lectureId);

    if (!deletedLecture) {
      return res.status(404).json({ status: 404, message: 'Lecture not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Lecture deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error });
  }
};

module.exports = {
  getAllLectures,
  createLecture,
  updateLecture,
  deleteLecture,
};
