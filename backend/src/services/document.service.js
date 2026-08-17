import prisma from '../config/db.js';

// ==========================================
// 1. DOCUMENTS VAULT SERVICES
// ==========================================

export const getDocumentsByAccount = async (accountId, filters = {}) => {
    const whereClause = {
        accountId,
    };

    if (filters.category && filters.category !== 'ALL') {
        whereClause.category = filters.category;
    }

    if (filters.propertyId && filters.propertyId !== 'ALL') {
        whereClause.propertyId = filters.propertyId;
    }

    if (filters.tenantId) {
        whereClause.tenantId = filters.tenantId;
    }

    if (filters.leaseId) {
        whereClause.leaseId = filters.leaseId;
    }

    if (filters.search) {
        const q = filters.search.trim();
        whereClause.OR = [
            { fileName: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
        ];
    }

    return await prisma.document.findMany({
        where: whereClause,
        include: {
            property: {
                select: { id: true, name: true, city: true },
            },
            lease: {
                include: {
                    unit: { select: { id: true, name: true } },
                    tenant: { select: { id: true, firstName: true, lastName: true, businessName: true } },
                },
            },
            tenant: {
                select: { id: true, firstName: true, lastName: true, businessName: true, email: true },
            },
            uploadedBy: {
                select: { id: true, firstName: true, lastName: true, email: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getDocumentById = async (accountId, id) => {
    return await prisma.document.findFirst({
        where: { id, accountId },
        include: {
            property: true,
            lease: {
                include: { unit: true, tenant: true },
            },
            tenant: true,
            uploadedBy: {
                select: { id: true, firstName: true, lastName: true, email: true },
            },
        },
    });
};

export const createDocument = async (accountId, userId, data) => {
    // If propertyId is passed, verify it belongs to account
    if (data.propertyId) {
        const prop = await prisma.property.findFirst({
            where: { id: data.propertyId, accountId },
        });
        if (!prop) throw new Error('Property not found in this workspace.');
    }

    return await prisma.document.create({
        data: {
            accountId,
            uploadedByUserId: userId,
            propertyId: data.propertyId || null,
            leaseId: data.leaseId || null,
            tenantId: data.tenantId || null,
            maintenanceRequestId: data.maintenanceRequestId || null,
            fileName: data.fileName,
            fileUrl: data.fileUrl || `https://storage.proppilot.io/docs/${encodeURIComponent(data.fileName)}`,
            fileSize: Number(data.fileSize || 102400),
            mimeType: data.mimeType || 'application/pdf',
            category: data.category || 'General Document',
            description: data.description || null,
        },
        include: {
            property: true,
            uploadedBy: {
                select: { id: true, firstName: true, lastName: true, email: true },
            },
        },
    });
};

export const updateDocument = async (accountId, id, data) => {
    const existing = await prisma.document.findFirst({
        where: { id, accountId },
    });
    if (!existing) throw new Error('Document not found in workspace.');

    return await prisma.document.update({
        where: { id },
        data: {
            fileName: data.fileName !== undefined ? data.fileName : undefined,
            category: data.category !== undefined ? data.category : undefined,
            description: data.description !== undefined ? data.description : undefined,
            propertyId: data.propertyId !== undefined ? data.propertyId : undefined,
        },
    });
};

export const deleteDocument = async (accountId, id) => {
    const existing = await prisma.document.findFirst({
        where: { id, accountId },
    });
    if (!existing) throw new Error('Document not found.');

    return await prisma.document.delete({
        where: { id },
    });
};

// ==========================================
// 2. NOTICE BOARD & ANNOUNCEMENTS
// ==========================================

export const getAnnouncementsByAccount = async (accountId, filters = {}) => {
    const whereClause = {
        property: { accountId },
    };

    if (filters.propertyId && filters.propertyId !== 'ALL') {
        whereClause.propertyId = filters.propertyId;
    }

    if (filters.isPublished !== undefined) {
        whereClause.isPublished = filters.isPublished === 'true' || filters.isPublished === true;
    }

    if (filters.search) {
        const q = filters.search.trim();
        whereClause.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { message: { contains: q, mode: 'insensitive' } },
        ];
    }

    return await prisma.announcement.findMany({
        where: whereClause,
        include: {
            property: {
                select: { id: true, name: true, city: true },
            },
            unit: {
                select: { id: true, name: true },
            },
            createdBy: {
                select: { id: true, firstName: true, lastName: true, email: true },
            },
        },
        orderBy: { publishedAt: 'desc' },
    });
};

export const createAnnouncement = async (accountId, userId, data) => {
    const property = await prisma.property.findFirst({
        where: { id: data.propertyId, accountId },
    });
    if (!property) throw new Error('Target property not found in this workspace.');

    return await prisma.announcement.create({
        data: {
            propertyId: data.propertyId,
            unitId: data.unitId || null,
            createdByUserId: userId,
            title: data.title,
            message: data.message,
            isPublished: data.isPublished !== undefined ? data.isPublished : true,
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
        include: {
            property: true,
            unit: true,
            createdBy: {
                select: { id: true, firstName: true, lastName: true, email: true },
            },
        },
    });
};

export const updateAnnouncement = async (accountId, id, data) => {
    const existing = await prisma.announcement.findFirst({
        where: { id, property: { accountId } },
    });
    if (!existing) throw new Error('Announcement not found.');

    return await prisma.announcement.update({
        where: { id },
        data: {
            title: data.title !== undefined ? data.title : undefined,
            message: data.message !== undefined ? data.message : undefined,
            isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
            expiresAt: data.expiresAt !== undefined ? (data.expiresAt ? new Date(data.expiresAt) : null) : undefined,
        },
        include: {
            property: true,
            createdBy: true,
        },
    });
};

export const deleteAnnouncement = async (accountId, id) => {
    const existing = await prisma.announcement.findFirst({
        where: { id, property: { accountId } },
    });
    if (!existing) throw new Error('Announcement not found.');

    return await prisma.announcement.delete({
        where: { id },
    });
};
