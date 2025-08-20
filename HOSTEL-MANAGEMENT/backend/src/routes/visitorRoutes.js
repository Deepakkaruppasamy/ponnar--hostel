import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requestVisit, listMine, listAll, approveVisit, denyVisit, checkIn, checkOut } from '../controllers/visitorController.js';

const router = Router();

// student
router.post('/', requireAuth(['student', 'admin']), requestVisit);
router.get('/mine', requireAuth(['student', 'admin']), listMine);

// admin
router.get('/', requireAuth(['admin']), listAll);
router.post('/:id/approve', requireAuth(['admin']), approveVisit);
router.post('/:id/deny', requireAuth(['admin']), denyVisit);
router.post('/:id/checkin', requireAuth(['admin']), checkIn);
router.post('/:id/checkout', requireAuth(['admin']), checkOut);

export default router;
