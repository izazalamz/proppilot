import { Router } from 'express';
import {
    getTenants,
    handleCreateTenant,
    getLeases,
    handleCreateLease,
} from '../controllers/tenant.controller.js';
import { authenticate, requireWorkspace } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireWorkspace());

// Tenant management
router.get('/', getTenants);
router.post('/', handleCreateTenant);

// Lease management
router.get('/leases', getLeases);
router.post('/leases', handleCreateLease);

export default router;