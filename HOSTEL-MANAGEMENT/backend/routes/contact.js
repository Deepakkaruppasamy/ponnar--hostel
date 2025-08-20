// Express route for saving contact messages to MongoDB

const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

// Define Contact schema and model
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema)

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' })
    }
    await Contact.create({ name, email, message })
    res.status(201).json({ message: 'Contact saved.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

module.exports = router
