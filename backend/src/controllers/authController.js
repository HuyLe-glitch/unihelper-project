const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Lấy thông tin chi tiết tuỳ theo role
    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === 'STAFF') {
      profile = await Staff.findOne({ user: user._id });
    } else if (user.role === 'ADMIN') {
      profile = await Admin.findOne({ user: user._id });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      role: user.role,
      user: {
        email: user.email,
        profile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
