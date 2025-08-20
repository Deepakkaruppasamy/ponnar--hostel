import { Router } from 'express'
import { submitContact, listContacts, markContactRead } from '../controllers/contactController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/', submitContact)

// Admin: list all contact messages (optionally filter unread)
router.get('/', requireAuth(['admin']), listContacts)

// Admin: mark message as read
router.patch('/:id/read', requireAuth(['admin']), markContactRead)

export default router
