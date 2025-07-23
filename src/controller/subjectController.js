const Subject = require('../models/subject.model');

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json({ status: 200, data: subjects });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error });
  }
};

const createSubject = async (req, res) => {
  try {
    const { name, description, levelId, imageUrl, bookUrl, completionCondition } = req.body;

    const subject = await Subject.create({
      name,
      description,
      levelId,
      imageUrl,
      bookUrl,
      completionCondition,
    });

    res.status(201).json({
      status: 201,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;
    const updates = req.body;

    const updatedSubject = await Subject.findByIdAndUpdate(subjectId, updates, { new: true });

    if (!updatedSubject) {
      return res.status(404).json({ status: 404, message: 'Subject not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Subject updated successfully',
      data: updatedSubject,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;

    const deleted = await Subject.findByIdAndDelete(subjectId);
    if (!deleted) {
      return res.status(404).json({ status: 404, message: 'Subject not found' });
    }

    res.status(200).json({ status: 200, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error });
  }
};

module.exports = {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
