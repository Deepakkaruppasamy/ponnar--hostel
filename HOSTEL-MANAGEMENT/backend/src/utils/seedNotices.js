import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Notice } from '../models/Notice.js'

dotenv.config()

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management'
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  const count = await Notice.countDocuments()
  if (count > 0) {
    console.log('Notices already exist, skipping seeding.')
    await mongoose.disconnect()
    return
  }

  const now = new Date()
  const docs = [
    { title: 'Welcome to Ponnar Hostel', content: 'Orientation at 10 AM in the common hall.', audience: 'all', pinned: true, createdAt: now },
    { title: 'Mess Menu Update', content: 'Weekly menu has been updated. Check the notice board.', audience: 'students', pinned: false, createdAt: now },
    { title: 'Maintenance Window', content: 'Internet maintenance on Sunday 2-4 PM.', audience: 'all', pinned: false, createdAt: now },
  ]

  await Notice.insertMany(docs)
  console.log('Seeded sample notices')
  await mongoose.disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
