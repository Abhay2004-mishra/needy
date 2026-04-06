const express = require('express')
const { body, validationResult } = require('express-validator')
const { protect } = require('../middleware/auth')
const Payment = require('../models/Payment')
const Job = require('../models/Job')

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null

const router = express.Router()

// @route   POST /api/payments
// @desc    Create a payment hold for a job
// @access  Private
router.post('/', protect, [
  body('jobId').notEmpty().withMessage('Job is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { jobId, amount, currency = 'usd' } = req.body
    const job = await Job.findById(jobId)
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' })
    }

    let providerId = ''
    let status = 'pending'
    let clientSecret = null

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100),
        currency,
        metadata: {
          jobId: job._id.toString(),
          userId: req.user._id.toString()
        }
      })
      providerId = paymentIntent.id
      clientSecret = paymentIntent.client_secret
      status = 'held'
    }

    const payment = await Payment.create({
      userId: req.user._id,
      jobId: job._id,
      amount: parseFloat(amount),
      currency,
      status,
      providerId,
      method: stripe ? 'stripe' : 'manual',
      metadata: {
        clientSecret: clientSecret || '',
        createdBy: req.user._id.toString()
      }
    })

    res.status(201).json({
      success: true,
      data: payment,
      clientSecret
    })
  } catch (error) {
    console.error('Create payment error:', error)
    res.status(500).json({ success: false, message: 'Server error creating payment' })
  }
})

module.exports = router
