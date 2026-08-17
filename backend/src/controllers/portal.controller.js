import { z } from 'zod';
import {
    getTenantPortalOverview,
    createTenantMaintenanceTicket,
    initTenantPayment,
} from '../services/portal.service.js';

const tenantMaintenanceSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    problemDescription: z.string().min(5, 'Problem description is required'),
    category: z.string().min(1, 'Category is required'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export const getPortalOverview = async (req, res, next) => {
    try {
        const leaseId = req.query.leaseId || null;
        const accountId = req.query.accountId || req.headers['x-account-id'] || req.accountId || null;
        const overview = await getTenantPortalOverview(req.user.id, req.user.email, accountId, leaseId);
        return res.status(200).json({ data: overview });
    } catch (err) {
        next(err);
    }
};



export const handleTenantMaintenance = async (req, res, next) => {
    try {
        const validated = tenantMaintenanceSchema.parse(req.body);
        const created = await createTenantMaintenanceTicket(req.user.id, req.user.email, validated);
        return res.status(201).json({ message: 'Repair request submitted successfully', data: created });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleTenantSSLCommerzInit = async (req, res, next) => {
    try {
        const originUrl = req.headers.origin || 'http://localhost:5173';
        const session = await initTenantPayment(req.user.id, req.user.email, req.params.invoiceId, { originUrl });
        return res.status(200).json({ data: session });
    } catch (err) {
        next(err);
    }
};
