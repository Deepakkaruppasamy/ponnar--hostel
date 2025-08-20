import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createComplaint, listMyComplaints, listAllComplaints, updateComplaint } from '../controllers/complaintController.js';

const router = Router();

// student
router.post('/', requireAuth(['student', 'admin']), createComplaint);
router.get('/mine', requireAuth(['student', 'admin']), listMyComplaints);

// admin
router.get('/', requireAuth(['admin']), listAllComplaints);
router.patch('/:id', requireAuth(['admin']), updateComplaint);

export default router;
