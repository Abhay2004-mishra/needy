const express = require('express')
const { body, validationResult } = require('express-validator')
const { protect } = require('../middleware/auth')
const Message = require('../models/Message')
const User = require('../models/User')

const router = express.Router()

// @route   GET /api/messages
// @desc    Get current user's messages and latest conversations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'firstName lastName email')
      .populate('recipient', 'firstName lastName email')
      .limit(100)

    res.json({ success: true, data: messages })
  } catch (error) {
    console.error('Messages fetch error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching messages' })
  }
})

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation with another user for an optional job
// @access  Private
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'firstName lastName email')
      .populate('recipient', 'firstName lastName email')

    res.json({ success: true, data: messages })
  } catch (error) {
    console.error('Conversation fetch error:', error)
    res.status(500).json({ success: false, message: 'Server error fetching conversation' })
  }
})

// @route   POST /api/messages
// @desc    Send a message to another user
// @access  Private
router.post('/', protect, [
  body('recipientId').notEmpty().withMessage('Recipient is required'),
  body('content').trim().notEmpty().withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { recipientId, content, jobId } = req.body
    const recipient = await User.findById(recipientId).select('_id')
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' })
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipient._id,
      content,
      jobId: jobId || undefined
    })

    res.status(201).json({ success: true, data: message })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ success: false, message: 'Server error sending message' })
  }
})

// @route   PATCH /api/messages/:id/read
// @desc    Mark a message as read
// @access  Private
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' })
    }
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    message.read = true
    await message.save()
    res.json({ success: true, data: message })
  } catch (error) {
    console.error('Message read error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router
