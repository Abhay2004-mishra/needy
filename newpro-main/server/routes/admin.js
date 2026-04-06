const express = require('express');
const { protect, admin } = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/admin/jobs/pending
// @desc    Get pending jobs for review
// @access  Admin
router.get('/jobs/pending', protect, admin, async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'pending' }).sort({ createdAt: -1 }).populate('postedBy', 'firstName lastName email');
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error('Admin pending jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/admin/jobs/:id/status
// @desc    Approve or reject a job
// @access  Admin
router.patch('/jobs/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'pending', 'rejected', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.status = status;
    if (status === 'active') {
      job.fraudScore = 0;
    }
    await job.save();

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Admin update job status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for moderation
// @access  Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/admin/users/:id/block
// @desc    Block or unblock a user
// @access  Admin
router.patch('/users/:id/block', protect, admin, async (req, res) => {
  try {
    const { block } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !!block;
    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Admin block user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/admin/users/:id/verify
// @desc    Verify or unverify a user
// @access  Admin
router.patch('/users/:id/verify', protect, admin, async (req, res) => {
  try {
    const { verify } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = !!verify;
    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Admin verify user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
