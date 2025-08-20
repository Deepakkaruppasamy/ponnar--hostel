import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upsertMealPlan, getMealPlan, setRSVP, getMyRSVP, headcount } from '../controllers/messController.js';

const router = Router();

// admin
router.put('/plan', requireAuth(['admin']), upsertMealPlan);
router.get('/headcount', requireAuth(['admin']), headcount);

// shared
router.get('/plan', requireAuth(['student', 'admin']), getMealPlan);
router.post('/rsvp', requireAuth(['student', 'admin']), setRSVP);
router.get('/rsvp/me', requireAuth(['student', 'admin']), getMyRSVP);

export default router;
