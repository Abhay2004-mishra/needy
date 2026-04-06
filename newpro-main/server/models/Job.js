const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['delivery', 'labor', 'tech', 'cleaning', 'freelance', 'events']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    enum: ['new-york', 'los-angeles', 'chicago', 'houston', 'remote']
  },
  locationDisplay: {
    type: String,
    required: true
  },
  locationCoordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  totalSeats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: 1,
    max: 50
  },
  bookedSeats: {
    type: Number,
    default: 0,
    min: 0
  },
  salary: {
    type: Number,
    required: [true, 'Salary amount is required'],
    min: 1
  },
  paymentType: {
    type: String,
    required: [true, 'Payment type is required'],
    enum: ['hourly', 'fixed', 'daily']
  },
  paymentDisplay: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true
  },
  contactPhone: {
    type: String,
    default: ''
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  postedByVerified: {
    type: Boolean,
    default: false
  },
  reports: {
    type: Number,
    default: 0
  },
  reportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  fraudScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postedByName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected', 'closed', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for efficient querying
jobSchema.index({ category: 1, location: 1, status: 1 });
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ locationCoordinates: '2dsphere' });

// Virtual for remaining seats
jobSchema.virtual('remainingSeats').get(function() {
  return this.totalSeats - this.bookedSeats;
});

jobSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
