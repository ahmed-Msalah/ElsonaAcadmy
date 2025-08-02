const User = require('../models/user.model.js');
const Level = require('../models/level.model.js');
const bcrypt = require('bcrypt');
const {
  sendVerificationEmail,
  resendVerificationEmail,
  sendResetCodeEmail,
} = require('../service/email.service.js');
const { generateToken } = require('../service/generateToken.service.js');

const createAccount = async (req, res) => {
  try {
    const levelOne = await Level.findOne({ levelNumber: 1 });
    if (!levelOne) {
      return res.status(500).json({ status: 500, message: 'Default level not found' });
    }
    const { name, userName, email, password, phoneNumber, birthDate, gender } = req.body;

    if (!name || !userName || !email || !password || !gender || !birthDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      userName,
      email,
      password: hashedPassword,
      phoneNumber,
      gender,
      birthDate,
      currentLevelId: levelOne.id,
    });

    const createdUser = await newUser.save();
    const token = generateToken(createdUser);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      data: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        phoneNumber: createdUser.phoneNumber,
        gender: createdUser.gender,
        birthDate: createdUser.birthDate
          ? new Date(createdUser.birthDate).toISOString().split('T')[0]
          : null,
        currentLevel: createdUser.currentLevelId.levelNumber,
        role: createdUser.role,
      },
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).populate({
      path: 'currentLevelId',
      select: 'levelNumber',
    });

    if (!user) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const token = generateToken(user);
    if (user.role === 'student') {
      res.status(200).json({
        message: 'Login successful!',
        token,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : null,
          currentLevel: user.currentLevelId.levelNumber,
          role: user.role,
        },
      });
    }
    res.status(200).json({
      message: 'Login successful!',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : null,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Student not found' });

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // Code expires in 10 minutes

    // Store usedr document
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetCodeExpires;
    await user.save({ validateBeforeSave: false });

    // Send the code via email
    await sendResetCodeEmail(user.email, user.userName, resetCode);

    return res
      .status(200)
      .json({ message: 'Password reset code sent to your email', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { id, code } = req.body;

    if (!id || !code) {
      return res.status(400).json({ message: 'student ID and verification code are required.' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({
        message: 'Verification code has expired. Please request a new verification code.',
      });
    }

    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: 'Incorrect verification code.' });
    }

    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordVerified = true;
    await user.save();

    res.status(200).json({ message: 'Account has been successfully verified!' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while verifying the account.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id, newPassword } = req.body;

    if (!id || !newPassword) {
      return res.status(400).json({ message: 'Student ID and New Password  are required.' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (!user.resetPasswordVerified) {
      return res.status(400).json({ message: 'You Must Verified Your Email for reset Password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordVerified = undefined;
    await user.save();

    res.status(200).json({ message: 'Password Change Sucessfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while verifying the account.' });
  }
};

module.exports = {
  createAccount,
  login,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
};
