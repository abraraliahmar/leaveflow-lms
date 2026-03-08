const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Helper: generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['employee', 'employer']).withMessage('Role must be employee or employer'),
    body('department').optional().trim(),
    body('securityQuestion').trim().notEmpty().withMessage('Security question is required'),
    body('securityAnswer').trim().notEmpty().withMessage('Security answer is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { name, email, password, role, department, securityQuestion, securityAnswer } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered.' });
      }

      const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
      const user = await User.create({ name, email, password, role, department, securityQuestion, securityAnswer: hashedAnswer });
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      res.status(500).json({ message: 'Registration failed', error: err.message });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      res.status(500).json({ message: 'Login failed', error: err.message });
    }
  }
);

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password/question
router.post(
  '/forgot-password/question',
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user || !user.securityQuestion) {
        return res.status(404).json({ message: 'No account found with this email.' });
      }
      res.json({ securityQuestion: user.securityQuestion });
    } catch (err) {
      res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
  }
);

// POST /api/auth/forgot-password/reset
router.post(
  '/forgot-password/reset',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('securityAnswer').trim().notEmpty().withMessage('Security answer is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    try {
      const { email, securityAnswer, newPassword } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'No account found with this email.' });
      }
      const isMatch = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect security answer. Please try again.' });
      }
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password reset successfully! You can now log in.' });
    } catch (err) {
      res.status(500).json({ message: 'Password reset failed', error: err.message });
    }
  }
);

// PATCH /api/auth/change-password
router.patch(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user._id);
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }
      user.password = req.body.newPassword;
      await user.save();
      res.json({ message: 'Password changed successfully.' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to change password', error: err.message });
    }
  }
);

module.exports = router;
