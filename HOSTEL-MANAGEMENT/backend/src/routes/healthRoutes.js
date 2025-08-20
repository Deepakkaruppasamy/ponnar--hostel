import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyProfile, upsertMyProfile, requestSickLeave, mySickLeaves, listSickLeaves, approveSickLeave, createEvent, listEvents, listIsolation, upsertIsolation } from '../controllers/healthController.js';

const router = Router();

// Profile (student)
router.get('/profile', requireAuth(['student','admin']), getMyProfile);
router.put('/profile', requireAuth(['student','admin']), upsertMyProfile);

// Sick leave
router.post('/sickleave', requireAuth(['student','admin']), requestSickLeave);
router.get('/sickleave/mine', requireAuth(['student','admin']), mySickLeaves);
router.get('/sickleave', requireAuth(['admin']), listSickLeaves);
router.post('/sickleave/:id/approve', requireAuth(['admin']), approveSickLeave);

// Emergency events
router.post('/events', requireAuth(['admin']), createEvent);
router.get('/events', requireAuth(['student','admin']), listEvents);

// Isolation rooms
router.get('/isolation', requireAuth(['admin']), listIsolation);
router.post('/isolation', requireAuth(['admin']), upsertIsolation);
router.patch('/isolation/:id', requireAuth(['admin']), upsertIsolation);

export default router;
