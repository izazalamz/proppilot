import { Router } from 'express';
import {
    getProperties,
    getSingleProperty,
    handleCreateProperty,
    handleCreateUnitGroup,
    handleCreateUnit,
} from '../controllers/property.controller.js';
import { authenticate, requireWorkspace } from '../middlewares/auth.js';

const router = Router();

// Apply auth + workspace verification to all property endpoints
router.use(authenticate, requireWorkspace());

router.get('/', getProperties);
router.post('/', handleCreateProperty);
router.get('/:id', getSingleProperty);
router.post('/:propertyId/groups', handleCreateUnitGroup);
router.post('/:propertyId/units', handleCreateUnit);

export default router;