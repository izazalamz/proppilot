import prisma from '../config/db.js';

// ==========================================
// 1. WORKSPACE STAFF DIRECTORY
// ==========================================

export const getWorkspaceStaff = async (accountId) => {
    // Get all memberships in workspace with roles OWNER, MANAGER, STAFF
    const memberships = await prisma.membership.findMany({
        where: {
            accountId,
            role: { in: ['OWNER', 'MANAGER', 'STAFF'] },
            status: 'ACTIVE',
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });

    // Compute active maintenance workload for each staff member
    const staffWithWorkload = await Promise.all(
        memberships.map(async (m) => {
            const openTicketsCount = await prisma.maintenanceRequest.count({
                where: {
                    property: { accountId },
                    assignedToUserId: m.user.id,
                    status: { in: ['REQUESTED', 'REVIEWED', 'IN_PROGRESS'] },
                },
            });

            return {
                id: m.user.id,
                name: `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() || m.user.email,
                email: m.user.email,
                phone: m.user.phone,
                role: m.role,
                openTicketsCount,
            };
        })
    );

    return staffWithWorkload;
};

// ==========================================
// 2. MAINTENANCE WORK ORDERS LIST & RETRIEVAL
// ==========================================

export const getMaintenanceRequestsByAccount = async (accountId, filters = {}) => {
    const whereClause = {
        property: { accountId },
    };

    if (filters.status && filters.status !== 'ALL') {
        whereClause.status = filters.status;
    }

    if (filters.priority && filters.priority !== 'ALL') {
        whereClause.priority = filters.priority;
    }

    if (filters.category && filters.category !== 'ALL') {
        whereClause.category = filters.category;
    }

    if (filters.propertyId && filters.propertyId !== 'ALL') {
        whereClause.propertyId = filters.propertyId;
    }

    if (filters.unitId) {
        whereClause.unitId = filters.unitId;
    }

    if (filters.assignedToUserId && filters.assignedToUserId !== 'ALL') {
        whereClause.assignedToUserId = filters.assignedToUserId;
    }

    if (filters.search) {
        const q = filters.search.trim();
        whereClause.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { problemDescription: { contains: q, mode: 'insensitive' } },
            { unit: { name: { contains: q, mode: 'insensitive' } } },
            { property: { name: { contains: q, mode: 'insensitive' } } },
        ];
    }

    return await prisma.maintenanceRequest.findMany({
        where: whereClause,
        include: {
            property: {
                select: { id: true, name: true, city: true, currency: true },
            },
            unit: {
                include: {
                    unitGroup: true,
                    unitType: true,
                },
            },
            tenant: true,
            createdBy: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            },
            assignedTo: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            },
            documents: true,
        },
        orderBy: [
            { priority: 'desc' },
            { requestedAt: 'desc' },
        ],
    });
};

export const getMaintenanceRequestById = async (accountId, id) => {
    return await prisma.maintenanceRequest.findFirst({
        where: {
            id,
            property: { accountId },
        },
        include: {
            property: true,
            unit: {
                include: {
                    unitGroup: true,
                    unitType: true,
                },
            },
            tenant: true,
            createdBy: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            },
            assignedTo: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            },
            documents: true,
        },
    });
};

// ==========================================
// 3. MUTATIONS & STATE LIFECYCLE TRANSITIONS
// ==========================================

export const createMaintenanceRequest = async (accountId, userId, data) => {
    // Verify property belongs to account
    const property = await prisma.property.findFirst({
        where: { id: data.propertyId, accountId },
    });
    if (!property) throw new Error('Property not found in workspace.');

    // If unitId is provided, verify it belongs to property and find active tenant if not specified
    let tenantId = data.tenantId || null;
    if (data.unitId) {
        const unit = await prisma.unit.findFirst({
            where: { id: data.unitId, propertyId: data.propertyId },
            include: {
                leases: {
                    where: { status: 'ACTIVE' },
                    take: 1,
                },
            },
        });
        if (!unit) throw new Error('Unit not found under specified property.');
        if (!tenantId && unit.leases.length > 0) {
            tenantId = unit.leases[0].tenantId;
        }
    }

    return await prisma.maintenanceRequest.create({
        data: {
            propertyId: data.propertyId,
            unitId: data.unitId || null,
            tenantId,
            createdByUserId: userId,
            assignedToUserId: data.assignedToUserId || null,
            title: data.title,
            problemDescription: data.problemDescription,
            category: data.category || 'General Upkeep',
            priority: data.priority || 'MEDIUM',
            status: data.status || 'REQUESTED',
            requestedAt: data.requestedAt ? new Date(data.requestedAt) : new Date(),
        },
        include: {
            property: true,
            unit: true,
            tenant: true,
            createdBy: true,
            assignedTo: true,
        },
    });
};

export const updateMaintenanceRequest = async (accountId, id, data) => {
    const existing = await prisma.maintenanceRequest.findFirst({
        where: { id, property: { accountId } },
    });
    if (!existing) throw new Error('Maintenance request not found.');

    return await prisma.maintenanceRequest.update({
        where: { id },
        data: {
            title: data.title !== undefined ? data.title : undefined,
            problemDescription: data.problemDescription !== undefined ? data.problemDescription : undefined,
            category: data.category !== undefined ? data.category : undefined,
            priority: data.priority !== undefined ? data.priority : undefined,
            unitId: data.unitId !== undefined ? data.unitId : undefined,
            assignedToUserId: data.assignedToUserId !== undefined ? data.assignedToUserId : undefined,
            reviewNotes: data.reviewNotes !== undefined ? data.reviewNotes : undefined,
            resolutionNotes: data.resolutionNotes !== undefined ? data.resolutionNotes : undefined,
        },
        include: {
            property: true,
            unit: true,
            tenant: true,
            assignedTo: true,
        },
    });
};

/**
 * State Machine Transition:
 * REQUESTED -> REVIEWED -> IN_PROGRESS -> COMPLETED (or CANCELLED)
 */
export const updateMaintenanceStatus = async (accountId, id, { status, reviewNotes, resolutionNotes }) => {
    const existing = await prisma.maintenanceRequest.findFirst({
        where: { id, property: { accountId } },
    });
    if (!existing) throw new Error('Maintenance request not found.');

    const updateData = {
        status,
    };

    if (reviewNotes !== undefined) updateData.reviewNotes = reviewNotes;
    if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;

    if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
    } else if (status !== 'COMPLETED' && existing.completedAt) {
        updateData.completedAt = null;
    }

    return await prisma.maintenanceRequest.update({
        where: { id },
        data: updateData,
        include: {
            property: true,
            unit: true,
            tenant: true,
            assignedTo: true,
        },
    });
};

export const assignMaintenanceStaff = async (accountId, id, assignedToUserId) => {
    const existing = await prisma.maintenanceRequest.findFirst({
        where: { id, property: { accountId } },
    });
    if (!existing) throw new Error('Maintenance request not found.');

    // If request was in REQUESTED state, automatically transition to REVIEWED or IN_PROGRESS
    let newStatus = existing.status;
    if (existing.status === 'REQUESTED') {
        newStatus = 'REVIEWED';
    }

    return await prisma.maintenanceRequest.update({
        where: { id },
        data: {
            assignedToUserId,
            status: newStatus,
        },
        include: {
            property: true,
            unit: true,
            tenant: true,
            assignedTo: true,
        },
    });
};

export const deleteMaintenanceRequest = async (accountId, id) => {
    const existing = await prisma.maintenanceRequest.findFirst({
        where: { id, property: { accountId } },
    });
    if (!existing) throw new Error('Maintenance request not found.');

    return await prisma.maintenanceRequest.delete({
        where: { id },
    });
};
