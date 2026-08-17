import { z } from 'zod';
import {
    getDocumentsByAccount,
    getDocumentById,
    createDocument,
    updateDocument,
    deleteDocument,
    getAnnouncementsByAccount,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from '../services/document.service.js';

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

const documentSchema = z.object({
    fileName: z.string().min(1, 'File name is required'),
    fileUrl: z.string().optional(),
    fileSize: z.number().optional(),
    mimeType: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    propertyId: z.string().nullable().optional(),
    leaseId: z.string().nullable().optional(),
    tenantId: z.string().nullable().optional(),
    maintenanceRequestId: z.string().nullable().optional(),
});

const announcementSchema = z.object({
    propertyId: z.string().min(1, 'Property selection is required'),
    unitId: z.string().nullable().optional(),
    title: z.string().min(3, 'Announcement title must be at least 3 characters'),
    message: z.string().min(5, 'Announcement message is required'),
    isPublished: z.boolean().optional(),
    publishedAt: z.string().optional(),
    expiresAt: z.string().nullable().optional(),
});

// ==========================================
// CONTROLLER HANDLERS
// ==========================================

export const getDocuments = async (req, res, next) => {
    try {
        const { category, propertyId, tenantId, leaseId, search } = req.query;
        const docs = await getDocumentsByAccount(req.accountId, { category, propertyId, tenantId, leaseId, search });
        return res.status(200).json({ data: docs });
    } catch (err) {
        next(err);
    }
};

export const getSingleDocument = async (req, res, next) => {
    try {
        const doc = await getDocumentById(req.accountId, req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        return res.status(200).json({ data: doc });
    } catch (err) {
        next(err);
    }
};

export const handleCreateDocument = async (req, res, next) => {
    try {
        const validated = documentSchema.parse(req.body);
        const created = await createDocument(req.accountId, req.user.id, validated);
        return res.status(201).json({ message: 'Document registered successfully', data: created });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleUpdateDocument = async (req, res, next) => {
    try {
        const validated = documentSchema.partial().parse(req.body);
        const updated = await updateDocument(req.accountId, req.params.id, validated);
        return res.status(200).json({ message: 'Document updated', data: updated });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleDeleteDocument = async (req, res, next) => {
    try {
        await deleteDocument(req.accountId, req.params.id);
        return res.status(200).json({ message: 'Document deleted' });
    } catch (err) {
        next(err);
    }
};

export const getAnnouncements = async (req, res, next) => {
    try {
        const { propertyId, isPublished, search } = req.query;
        const notices = await getAnnouncementsByAccount(req.accountId, { propertyId, isPublished, search });
        return res.status(200).json({ data: notices });
    } catch (err) {
        next(err);
    }
};

export const handleCreateAnnouncement = async (req, res, next) => {
    try {
        const validated = announcementSchema.parse(req.body);
        const created = await createAnnouncement(req.accountId, req.user.id, validated);
        return res.status(201).json({ message: 'Notice published successfully', data: created });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleUpdateAnnouncement = async (req, res, next) => {
    try {
        const validated = announcementSchema.partial().parse(req.body);
        const updated = await updateAnnouncement(req.accountId, req.params.id, validated);
        return res.status(200).json({ message: 'Notice updated', data: updated });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleDeleteAnnouncement = async (req, res, next) => {
    try {
        await deleteAnnouncement(req.accountId, req.params.id);
        return res.status(200).json({ message: 'Notice deleted' });
    } catch (err) {
        next(err);
    }
};
