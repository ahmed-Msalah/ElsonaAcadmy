const moment = require('moment');
const User = require('../models/user.model.js');
const bcrypt = require('bcrypt');

const getAllUsers = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== 'admin') res.status(401).json({ message: 'Forbeddin' });

    const users = await User.find().select('-role');

    if (users.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    res.status(200).json({ all: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOOR: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { user } = req;

    if (user.id === req.params.id || user.role === 'admin') {
      const userData = await User.findById(req.params.id);
      if (!userData) return res.status(404).json({ message: 'Student not found' });
      res.status(200).json({ userData });
    } else res.status(401).json({ message: 'Forbeddin' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOOR: error.message });
  }
};

const updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const { user } = req;

    if (user.id !== id && user.role !== 'admin') res.status(401).json({ message: 'Forbeddin' });

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    console.log('upated user data', updatedUser);

    if (!updatedUser) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOOR: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { user } = req;
    const id = req.user.id;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Studnet not found' });
    }

    return res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { user } = req;
    const userId = user.id;
    console.log('user from change password endpoint', user);

    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, userData.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = hashedPassword;
    await userData.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOORr: error.message });
  }
};
//////////////////////////////////////////////////////
const getStudentProfile = async (req, res) => {
  try {
    const { user } = req;
    const userData = await User.findById(user.id).select('-role');
    if (!userData) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json({ userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOOR: error.message });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const { user } = req;
    const id = user.id;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    console.log('upated user data', updatedUser);

    if (!updatedUser) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', EROOOOR: error.message });
  }
};

module.exports = {
  deleteStudent,
  getUserById,
  updateUserById,
  getAllUsers,
  changePassword,
  getStudentProfile,
  updateStudentProfile,
};
