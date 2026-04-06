const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const { sendMail } = require('../services/mailer');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const createVerificationToken = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const verificationToken = await VerificationToken.create({
    userId,
    token,
    expiresAt
  });
  return verificationToken;
};

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`
  const subject = 'Verify your JobConnect account'
  const text = `Hi ${user.firstName},\n\nPlease verify your email by clicking the link below:\n${verifyUrl}\n\nIf you did not register, ignore this message.\n\nThanks,\nJobConnect Team`
  const html = `
    <p>Hi ${user.firstName},</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verifyUrl}">Verify my email</a></p>
    <p>If you did not register, ignore this message.</p>
    <p>Thanks,<br/>JobConnect Team</p>
  `
  await sendMail({ to: user.email, subject, text, html })
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['worker', 'poster', 'both']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, role, skills } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      avatar: (firstName[0] + lastName[0]).toUpperCase(),
      isVerified: false,
      isBlocked: false
    });

    const verificationToken = await createVerificationToken(user._id);
    await sendVerificationEmail(user, verificationToken.token);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        skills: user.skills,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        avatar: user.avatar,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Account blocked. Contact support.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        skills: user.skills,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        avatar: user.avatar || (user.firstName[0] + user.lastName[0]).toUpperCase(),
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        skills: user.skills,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar || (user.firstName[0] + user.lastName[0]).toUpperCase(),
        fullName: user.fullName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/auth/verify/:token
// @desc    Verify user email
// @access  Public
router.get('/verify/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const verification = await VerificationToken.findOne({ token }).populate('userId');

    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    const user = verification.userId;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();
    await verification.deleteOne();

    res.json({ success: true, message: 'Email verified successfully', user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      skills: user.skills,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      avatar: user.avatar || (user.firstName[0] + user.lastName[0]).toUpperCase(),
      fullName: user.fullName
    }});
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying email' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    await VerificationToken.deleteMany({ userId: user._id });
    const verificationToken = await createVerificationToken(user._id);
    await sendVerificationEmail(user, verificationToken.token);

    res.json({ success: true, message: 'Verification email resent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error resending verification email' });
  }
});

module.exports = router;
