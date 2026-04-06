const express = require('express');
const Booking = require('../models/Booking');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Book a job
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { jobId } = req.body;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer available'
      });
    }

    if (job.bookedSeats >= job.totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'All seats are already taken'
      });
    }

    // Check if already booked
    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      jobId: job._id
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked this job'
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      jobId: job._id,
      status: 'confirmed'
    });

    // Update job seats
    job.bookedSeats += 1;
    if (job.bookedSeats >= job.totalSeats) {
      job.status = 'closed';
    }
    await job.save();

    res.status(201).json({
      success: true,
      data: booking,
      job: {
        contactEmail: job.contactEmail,
        contactPhone: job.contactPhone
      }
    });
  } catch (error) {
    console.error('Booking error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked this job'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during booking'
    });
  }
});

// @route   GET /api/bookings/my
// @desc    Get current user bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bookings/check/:jobId
// @desc    Check if user has booked a specific job
// @access  Private
router.get('/check/:jobId', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      userId: req.user._id,
      jobId: req.params.jobId
    });

    res.json({
      success: true,
      isBooked: !!booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/bookings/:jobId
// @desc    Cancel a booking
// @access  Private
router.delete('/:jobId', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      userId: req.user._id,
      jobId: req.params.jobId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Free up the seat
    const job = await Job.findById(req.params.jobId);
    if (job) {
      job.bookedSeats = Math.max(0, job.bookedSeats - 1);
      if (job.status === 'closed') {
        job.status = 'active';
      }
      await job.save();
    }

    await Booking.findByIdAndDelete(booking._id);

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error cancelling booking'
    });
  }
});

module.exports = router;
