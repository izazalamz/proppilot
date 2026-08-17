import { Router } from 'express';
import {
    getPortalOverview,
    handleTenantMaintenance,
    handleTenantSSLCommerzInit,
} from '../controllers/portal.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/overview', getPortalOverview);
router.post('/maintenance', handleTenantMaintenance);
router.post('/invoices/:invoiceId/sslcommerz/init', handleTenantSSLCommerzInit);

export default router;
