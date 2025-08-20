import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requestPass, myPasses, listPasses, approve, deny, verify } from '../controllers/gatepassController.js';

const router = Router();

router.post('/', requireAuth(['student','admin']), requestPass);
router.get('/mine', requireAuth(['student','admin']), myPasses);
router.get('/', requireAuth(['admin']), listPasses);
router.post('/:id/approve', requireAuth(['admin']), approve);
router.post('/:id/deny', requireAuth(['admin']), deny);
router.post('/:id/verify', requireAuth(['admin']), verify);

export default router;
