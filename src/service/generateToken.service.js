const jwt = require('jsonwebtoken');

const JWT_SECRET = 'yhxqejiytxmderhv';

module.exports.generateToken = user => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, userName: user.userName },
    JWT_SECRET,
    { expiresIn: '30d' },
  );
};
