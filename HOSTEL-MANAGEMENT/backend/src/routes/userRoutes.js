import express from 'express'
import { listUsers } from '../controllers/userController.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Authenticated listing for DM picker and admin tools
router.get('/', requireAuth(), listUsers)

export default router
