import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listNotices, createNotice, updateNotice, deleteNotice } from '../controllers/noticeController.js';

const router = Router();

// public/student: list notices (auth optional). Use auth if you want to tailor by role later.
router.get('/', listNotices);

// admin
router.post('/', requireAuth(['admin']), createNotice);
router.patch('/:id', requireAuth(['admin']), updateNotice);
router.delete('/:id', requireAuth(['admin']), deleteNotice);

export default router;
