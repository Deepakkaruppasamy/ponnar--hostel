import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createInspection, listInspections, updateInspection, createDamage, listDamages, updateDamage } from '../controllers/inspectionsController.js';

const router = Router();

router.post('/', requireAuth(['admin']), createInspection);
router.get('/', requireAuth(['admin']), listInspections);
router.patch('/:id', requireAuth(['admin']), updateInspection);

router.post('/damages', requireAuth(['admin']), createDamage);
router.get('/damages', requireAuth(['admin']), listDamages);
router.patch('/damages/:id', requireAuth(['admin']), updateDamage);

export default router;
