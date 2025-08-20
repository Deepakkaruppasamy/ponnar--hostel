const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

// Connect to MongoDB (update the URI as needed)
mongoose.connect('mongodb://localhost:27017/hostel', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

// Contact API route
const contactRoute = require('./routes/contact')
app.use('/api/contact', contactRoute)

// Start server (update port if needed)
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))