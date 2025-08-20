import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { logPackage, listAllPackages, listMyPackages, markPicked } from '../controllers/packageController.js';

const router = Router();

// admin
router.post('/', requireAuth(['admin']), logPackage);
router.get('/', requireAuth(['admin']), listAllPackages);
router.post('/:id/pick', requireAuth(['admin']), markPicked);

// student
router.get('/mine', requireAuth(['student', 'admin']), listMyPackages);

export default router;
