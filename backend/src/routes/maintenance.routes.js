import { Router } from 'express';
import {
    getMaintenanceRequests,
    getSingleMaintenanceRequest,
    handleCreateMaintenanceRequest,
    handleUpdateMaintenanceRequest,
    handleUpdateMaintenanceStatus,
    handleAssignStaff,
    handleDeleteMaintenanceRequest,
    getStaffDirectory,
} from '../controllers/maintenance.controller.js';
import { authenticate, requireWorkspace } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireWorkspace());

router.get('/staff', getStaffDirectory);
router.get('/', getMaintenanceRequests);
router.post('/', handleCreateMaintenanceRequest);
router.get('/:id', getSingleMaintenanceRequest);
router.put('/:id', handleUpdateMaintenanceRequest);
router.patch('/:id/status', handleUpdateMaintenanceStatus);
router.patch('/:id/assign', handleAssignStaff);
router.delete('/:id', handleDeleteMaintenanceRequest);

export default router;
