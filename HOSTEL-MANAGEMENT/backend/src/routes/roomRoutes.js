import { Router } from 'express';
import { listRooms, createRoomsIfMissing, getRoomStats, getRoomSummary } from '../controllers/roomController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// public stats for landing page
router.get('/stats', getRoomStats);
router.get('/summary', getRoomSummary);

router.get('/', requireAuth(), listRooms);
router.post('/seed', requireAuth(['admin']), createRoomsIfMissing);

export default router;


