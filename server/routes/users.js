const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, consentGiven } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please fill in all fields'
      });
    }

    if (!consentGiven) {
      return res.status(400).json({
        message: 'You must agree to the Reficere privacy policy to register'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email already exists'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      consentGiven: true,
      consentDate: new Date()
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong, please try again' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please enter your email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({
        message: 'Incorrect email or password'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong, please try again' });
  }
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not retrieve profile' });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          message: 'An account with this email already exists'
        });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not update profile' });
  }
});

module.exports = router;