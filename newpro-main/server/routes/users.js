const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Booking = require('../models/Booking');

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'skills', 'bio', 'role'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle skills as array
    if (typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map(s => s.trim());
    }

    // Update avatar if name changed
    if (updates.firstName || updates.lastName) {
      const firstName = updates.firstName || req.user.firstName;
      const lastName = updates.lastName || req.user.lastName;
      updates.avatar = (firstName[0] + lastName[0]).toUpperCase();
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        skills: user.skills,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get dashboard stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const [activeJobs, totalBookings, myJobs] = await Promise.all([
      Job.countDocuments({ postedBy: req.user._id, status: 'active' }),
      Booking.countDocuments({ userId: req.user._id }),
      Job.find({ postedBy: req.user._id })
    ]);

    // Calculate earnings (sum of salary * booked seats for user's jobs)
    const earnings = myJobs.reduce((sum, job) => {
      return sum + (job.salary * job.bookedSeats);
    }, 0);

    res.json({
      success: true,
      stats: {
        activeJobs,
        totalBookings,
        earnings,
        avgRating: 4.8 // Placeholder
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
