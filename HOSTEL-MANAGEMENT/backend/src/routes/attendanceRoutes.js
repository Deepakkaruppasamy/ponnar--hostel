import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { myToday, checkIn, checkOut, list } from '../controllers/attendanceController.js';

const router = Router();

router.get('/me', requireAuth(['student','admin']), myToday);
router.post('/checkin', requireAuth(['student','admin']), checkIn);
router.post('/checkout', requireAuth(['student','admin']), checkOut);
router.get('/', requireAuth(['admin']), list);

export default router;
