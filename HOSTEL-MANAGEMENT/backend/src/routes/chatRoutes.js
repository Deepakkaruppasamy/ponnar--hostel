import express from 'express'
import { getHistory } from '../controllers/chatController.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Public or protected? For now allow authenticated or public read of history as per product needs.
router.get('/history', requireAuth(), getHistory)

export default router
