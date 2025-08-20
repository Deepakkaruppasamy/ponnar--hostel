import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { myVehicles, registerVehicle, listVehicles, listSlots, createSlot, updateSlot, createBadge, updateBadge } from '../controllers/parkingController.js';

const router = Router();

// Vehicles
router.get('/vehicles/mine', requireAuth(['student','admin']), myVehicles);
router.post('/vehicles', requireAuth(['student','admin']), registerVehicle);
router.get('/vehicles', requireAuth(['admin']), listVehicles);

// Slots
router.get('/slots', requireAuth(['admin']), listSlots);
router.post('/slots', requireAuth(['admin']), createSlot);
router.patch('/slots/:id', requireAuth(['admin']), updateSlot);

// Access badges
router.post('/badges', requireAuth(['admin']), createBadge);
router.patch('/badges/:id', requireAuth(['admin']), updateBadge);

export default router;
