const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'held', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  method: {
    type: String,
    default: 'stripe'
  },
  providerId: {
    type: String,
    default: ''
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Payment', paymentSchema)
