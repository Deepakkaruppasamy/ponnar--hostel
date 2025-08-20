import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { approveRequest, createBookingRequest, listAllRequests, listMyRequests, rejectRequest, waitlistRequest } from '../controllers/bookingController.js';

const router = Router();

// student
router.post('/', requireAuth(['student']), createBookingRequest);
router.get('/mine', requireAuth(['student', 'admin']), listMyRequests);

// admin
router.get('/', requireAuth(['admin']), listAllRequests);
router.post('/:id/approve', requireAuth(['admin']), approveRequest);
router.post('/:id/reject', requireAuth(['admin']), rejectRequest);
router.post('/:id/waitlist', requireAuth(['admin']), waitlistRequest);

export default router;


