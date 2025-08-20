import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listAssets, createAsset, updateAsset, listConsumables, createConsumable, issueConsumable } from '../controllers/inventoryController.js';

const router = Router();

router.get('/assets', requireAuth(['admin']), listAssets);
router.post('/assets', requireAuth(['admin']), createAsset);
router.patch('/assets/:id', requireAuth(['admin']), updateAsset);

router.get('/consumables', requireAuth(['admin']), listConsumables);
router.post('/consumables', requireAuth(['admin']), createConsumable);
router.post('/issues', requireAuth(['admin']), issueConsumable);

export default router;
