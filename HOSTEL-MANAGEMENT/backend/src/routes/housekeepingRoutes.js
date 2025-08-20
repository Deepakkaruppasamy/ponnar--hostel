import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createLog, listLogs, updateStatus } from '../controllers/housekeepingController.js';

const router = Router();

// admin
router.post('/', requireAuth(['admin']), createLog);
router.get('/', requireAuth(['admin']), listLogs);
router.patch('/:id', requireAuth(['admin']), updateStatus);

export default router;
