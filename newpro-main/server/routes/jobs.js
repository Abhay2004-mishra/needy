const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Location display map
const locationDisplayMap = {
  'new-york': 'New York, NY',
  'los-angeles': 'Los Angeles, CA',
  'chicago': 'Chicago, IL',
  'houston': 'Houston, TX',
  'remote': 'Remote'
};

const locationCoordinatesMap = {
  'new-york': [-74.0060, 40.7128],
  'los-angeles': [-118.2437, 34.0522],
  'chicago': [-87.6298, 41.8781],
  'houston': [-95.3698, 29.7604],
  'remote': [0, 0]
};

// @route   GET /api/jobs/user/my-jobs
// @desc    Get jobs posted by current user
// @access  Private
router.get('/user/my-jobs', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/jobs
// @desc    Get all jobs with filtering, sorting, pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      availableOnly,
      premiumOnly,
      sortBy = 'newest',
      page = 1,
      limit = 10,
      lat,
      lng,
      radius = 50000
    } = req.query;

    // Build query
    const filter = {};

    if (category) filter.category = category;
    if (location) filter.location = location;
    if (premiumOnly === 'true') filter.isPremium = true;
    if (availableOnly === 'true' || !req.query.status) filter.status = 'active';
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
        filter.locationCoordinates = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: parseInt(radius, 10) || 50000
          }
        };
      }
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'seats-low':
        sort = { bookedSeats: -1 }; // Most filled first = fewest seats left
        break;
      case 'salary-high':
        sort = { salary: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('postedBy', 'firstName lastName'),
      Job.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching jobs'
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'firstName lastName');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/jobs/:id/report
// @desc    Report a suspicious or invalid job
// @access  Private
router.post('/:id/report', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.reportedBy.some((id) => id.toString() === req.user._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this job'
      });
    }

    job.reports += 1;
    job.reportedBy.push(req.user._id);
    if (job.reports >= 3 && job.status === 'active') {
      job.status = 'pending';
      job.fraudScore = Math.min(100, job.fraudScore + 30);
    }
    await job.save();

    res.json({
      success: true,
      message: 'Job reported. Our team will review it shortly.'
    });
  } catch (error) {
    console.error('Report job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reporting job'
    });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['delivery', 'labor', 'tech', 'cleaning', 'freelance', 'events']),
  body('location').isIn(['new-york', 'los-angeles', 'chicago', 'houston', 'remote']),
  body('totalSeats').isInt({ min: 1, max: 50 }),
  body('salary').isFloat({ min: 1 }),
  body('paymentType').isIn(['hourly', 'fixed', 'daily']),
  body('contactEmail').isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title, description, category, location, skills,
      totalSeats, salary, paymentType, contactEmail,
      contactPhone, isPremium
    } = req.body;

    const paymentSuffix = paymentType === 'hourly' ? 'hour' : paymentType === 'daily' ? 'day' : 'fixed';
    const coordinates = locationCoordinatesMap[location] || [0, 0];
    const requiresApproval = isPremium || !req.user.isVerified;

    const job = await Job.create({
      title,
      description,
      category,
      location,
      locationDisplay: locationDisplayMap[location] || location,
      locationCoordinates: {
        type: 'Point',
        coordinates
      },
      skills: skills ? (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills) : [],
      totalSeats: parseInt(totalSeats),
      salary: parseFloat(salary),
      paymentType,
      paymentDisplay: `$${salary}/${paymentSuffix}`,
      contactEmail,
      contactPhone: contactPhone || '',
      isPremium: isPremium || false,
      postedByVerified: req.user.isVerified,
      postedBy: req.user._id,
      postedByName: `${req.user.firstName} ${req.user.lastName}`,
      status: requiresApproval ? 'pending' : 'active'
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating job'
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership or admin access
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'skills', 'contactEmail', 'contactPhone', 'status'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating job'
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership or admin access
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Delete associated bookings
    await Booking.deleteMany({ jobId: job._id });
    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting job'
    });
  }
});


module.exports = router;

