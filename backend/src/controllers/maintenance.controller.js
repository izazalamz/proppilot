import { z } from 'zod';
import {
    getMaintenanceRequestsByAccount,
    getMaintenanceRequestById,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    updateMaintenanceStatus,
    assignMaintenanceStaff,
    deleteMaintenanceRequest,
    getWorkspaceStaff,
} from '../services/maintenance.service.js';

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

const maintenanceRequestSchema = z.object({
    propertyId: z.string().min(1, 'Property selection is required'),
    unitId: z.string().nullable().optional(),
    tenantId: z.string().nullable().optional(),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    problemDescription: z.string().min(5, 'Problem description is required'),
    category: z.string().min(1, 'Category is required'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    status: z.enum(['REQUESTED', 'REVIEWED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('REQUESTED'),
    assignedToUserId: z.string().nullable().optional(),
    requestedAt: z.string().optional(),
});

const statusUpdateSchema = z.object({
    status: z.enum(['REQUESTED', 'REVIEWED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    reviewNotes: z.string().optional(),
    resolutionNotes: z.string().optional(),
});

const assignStaffSchema = z.object({
    assignedToUserId: z.string().min(1, 'Staff user selection is required'),
});

// ==========================================
// CONTROLLER HANDLERS
// ==========================================

export const getMaintenanceRequests = async (req, res, next) => {
    try {
        const { status, priority, category, propertyId, unitId, assignedToUserId, search } = req.query;
        const requests = await getMaintenanceRequestsByAccount(req.accountId, {
            status,
            priority,
            category,
            propertyId,
            unitId,
            assignedToUserId,
            search,
        });
        return res.status(200).json({ data: requests });
    } catch (err) {
        next(err);
    }
};

export const getSingleMaintenanceRequest = async (req, res, next) => {
    try {
        const request = await getMaintenanceRequestById(req.accountId, req.params.id);
        if (!request) return res.status(404).json({ error: 'Maintenance request not found' });
        return res.status(200).json({ data: request });
    } catch (err) {
        next(err);
    }
};

export const handleCreateMaintenanceRequest = async (req, res, next) => {
    try {
        const validated = maintenanceRequestSchema.parse(req.body);
        const created = await createMaintenanceRequest(req.accountId, req.user.id, validated);
        return res.status(201).json({ message: 'Maintenance ticket created successfully', data: created });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleUpdateMaintenanceRequest = async (req, res, next) => {
    try {
        const validated = maintenanceRequestSchema.partial().parse(req.body);
        const updated = await updateMaintenanceRequest(req.accountId, req.params.id, validated);
        return res.status(200).json({ message: 'Maintenance ticket updated', data: updated });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleUpdateMaintenanceStatus = async (req, res, next) => {
    try {
        const validated = statusUpdateSchema.parse(req.body);
        const updated = await updateMaintenanceStatus(req.accountId, req.params.id, validated);
        return res.status(200).json({ message: `Status updated to ${validated.status}`, data: updated });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleAssignStaff = async (req, res, next) => {
    try {
        const validated = assignStaffSchema.parse(req.body);
        const updated = await assignMaintenanceStaff(req.accountId, req.params.id, validated.assignedToUserId);
        return res.status(200).json({ message: 'Staff member assigned successfully', data: updated });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleDeleteMaintenanceRequest = async (req, res, next) => {
    try {
        await deleteMaintenanceRequest(req.accountId, req.params.id);
        return res.status(200).json({ message: 'Maintenance request deleted' });
    } catch (err) {
        next(err);
    }
};

export const getStaffDirectory = async (req, res, next) => {
    try {
        const staff = await getWorkspaceStaff(req.accountId);
        return res.status(200).json({ data: staff });
    } catch (err) {
        next(err);
    }
};
