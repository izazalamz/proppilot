import { Router } from 'express';
import {
    getProperties,
    getSingleProperty,
    handleCreateProperty,
    handleCreateUnitGroup,
    handleCreateUnit
} from '../controllers/property.controller.js';
import { updateProperty, updateUnitGroup } from '../services/property.service.js';
import { authenticate, requireWorkspace } from '../middlewares/auth.js';

const router = Router();

// Apply auth + workspace verification to all property endpoints
router.use(authenticate, requireWorkspace());

router.get('/', getProperties);
router.post('/', handleCreateProperty);
router.get('/:id', getSingleProperty);

router.put('/:id', async (req, res, next) => {
    try {
        await updateProperty(req.params.id, req.accountId, req.body);
        return res.status(200).json({ message: 'Property updated' });
    } catch (err) {
        next(err);
    }
});


router.post('/:propertyId/groups', handleCreateUnitGroup);

router.put('/:propertyId/groups/:groupId', async (req, res, next) => {
    try {
        const group = await updateUnitGroup(req.params.groupId, req.body);
        return res.status(200).json({ message: 'Unit group updated', data: group });
    } catch (err) {
        next(err);
    }
});

router.post('/:propertyId/units', handleCreateUnit);

export default router;