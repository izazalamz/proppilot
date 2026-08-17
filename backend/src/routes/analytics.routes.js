import { Router } from 'express';
import { getDashboardData } from '../controllers/analytics.controller.js';
import { authenticate, requireWorkspace } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireWorkspace());

router.get('/', getDashboardData);
router.get('/overview', getDashboardData);

export default router;
