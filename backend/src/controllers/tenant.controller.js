import { z } from 'zod';
import {
    getTenantsByAccount,
    createTenant,
    getLeasesByAccount,
    createLease,
} from '../services/tenant.service.js';

const tenantSchema = z.object({
    tenantType: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    businessName: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    governmentId: z.string().optional(),
    emergencyContact: z.string().optional(),
    notes: z.string().optional(),
});

const leaseSchema = z.object({
    tenantId: z.string().uuid('Invalid tenant ID'),
    unitId: z.string().uuid('Invalid unit ID'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    rentAmount: z.number().positive('Rent amount must be greater than 0'),
    securityDeposit: z.number().nonnegative().optional(),
    billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED']).optional(),
    notes: z.string().optional(),
});

export const getTenants = async (req, res, next) => {
    try {
        const tenants = await getTenantsByAccount(req.accountId);
        return res.status(200).json({ data: tenants });
    } catch (error) {
        next(error);
    }
};

export const handleCreateTenant = async (req, res, next) => {
    try {
        const validated = tenantSchema.parse(req.body);
        const tenant = await createTenant(req.accountId, validated);
        return res.status(201).json({ message: 'Tenant profile created', data: tenant });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        next(error);
    }
};

export const getLeases = async (req, res, next) => {
    try {
        const leases = await getLeasesByAccount(req.accountId);
        return res.status(200).json({ data: leases });
    } catch (error) {
        next(error);
    }
};

export const handleCreateLease = async (req, res, next) => {
    try {
        const validated = leaseSchema.parse(req.body);
        const lease = await createLease(req.accountId, validated);
        return res.status(201).json({ message: 'Lease agreement created', data: lease });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        next(error);
    }
};