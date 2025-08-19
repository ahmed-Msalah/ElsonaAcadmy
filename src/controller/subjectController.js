const e = require('express');
const Subject = require('../models/subject.model');
const User = require('../models/user.model');
const CompletedSubject = require('../models/CompletedSubject.model');
const CompletedLecture = require('../models/CompletedLecture.model');
const Lecture = require('../models/lecture.model');
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json({ status: 200, data: subjects });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server Error', error });
  }
};

const getSubjectByName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.params; // 🟢 اسم المادة من الـ params

    // Get user's current level
    const user = await User.findById(userId).select('currentLevelId');
    const levelId = user.currentLevelId;

    // Get subject by name inside current level (case-insensitive)
    const subject = await Subject.findOne({
      levelId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    }).lean();

    if (!subject) {
      return res.status(404).json({
        status: 404,
        message: `Subject '${name}' not found in current level`,
      });
    }

    // Get completed subjects & lectures
    const completedSubjects = await CompletedSubject.find({ userId }).select('subjectId');
    const completedLectures = await CompletedLecture.find({ userId }).select('lectureId');

    const completedSubjectIds = completedSubjects.map(s => s.subjectId.toString());
    const completedLectureIds = completedLectures.map(l => l.lectureId.toString());

    // Get lectures for this subject
    const lectures = await Lecture.find({ subjectId: subject._id }).lean();

    const totalLectures = lectures.length;
    const completedCount = lectures.filter(lec =>
      completedLectureIds.includes(lec._id.toString()),
    ).length;
    const progress = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    const subjectWithLectures = {
      id: subject._id,
      name: subject.name,
      imageUrl: subject.imageUrl,
      description: subject.description,
      bookUrl: subject.bookUrl,
      isCompleted: completedSubjectIds.includes(subject._id.toString()),
      completionCondition: subject.completionCondition || null,
      progress,
      lectures: lectures.map(lec => ({
        id: lec._id,
        name: lec.name,
        description: lec.description,
        contentType: lec.contentType,
        contentUrl: lec.contentUrl,
        isCompleted: completedLectureIds.includes(lec._id.toString()),
        completionCondition: lec.completionCondition || null,
      })),
    };

    res.status(200).json({
      status: 200,
      data: subjectWithLectures,
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ status: 500, message: 'Server error', error: error.message });
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
  getSubjectByName,
  createSubject,
  updateSubject,
  deleteSubject,
};
