// src/services/property.service.js
import prisma from '../config/db.js';

export const getPropertiesByAccount = async (accountId) => {
    return await prisma.property.findMany({
        where: { accountId },
        include: {
            unitGroups: {
                include: {
                    units: true,
                },
                orderBy: { displayOrder: 'asc' },
            },
            units: {
                include: {
                    unitType: true,
                    unitGroup: true,
                },
            },
            _count: {
                select: {
                    units: true,
                    unitGroups: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * Get all units across the workspace with property and group metadata
 */
export const getAllUnitsByAccount = async (accountId, { propertyId, groupId } = {}) => {
    const whereClause = {
        property: { accountId },
    };

    if (propertyId) whereClause.propertyId = propertyId;
    if (groupId) whereClause.unitGroupId = groupId;

    return await prisma.unit.findMany({
        where: whereClause,
        include: {
            property: { select: { id: true, name: true } },
            unitGroup: { select: { id: true, name: true } },
            unitType: { select: { id: true, name: true } },
            leases: { where: { status: 'ACTIVE' } },
        },
        orderBy: { name: 'asc' },
    });
};
/**
 * Get single property by ID with unit groups & units
 */
export const getPropertyById = async (propertyId, accountId) => {
    return await prisma.property.findFirst({
        where: { id: propertyId, accountId },
        include: {
            unitGroups: {
                include: {
                    units: {
                        include: { unitType: true },
                    },
                },
                orderBy: { displayOrder: 'asc' },
            },
            units: {
                include: { unitType: true, unitGroup: true },
            },
        },
    });
};

/**
 * Create a new Property
 */
export const createProperty = async (accountId, data) => {
    return await prisma.property.create({
        data: {
            accountId,
            name: data.name,
            description: data.description,
            address: data.address,
            city: data.city,
            country: data.country,
            postalCode: data.postalCode,
            currency: data.currency || 'USD',
            defaultGraceDays: data.defaultGraceDays || 5,
        },
    });
};

/**
 * Create a Unit Group inside a Property (e.g. Floor 1)
 */
export const createUnitGroup = async (propertyId, data) => {
    return await prisma.unitGroup.create({
        data: {
            propertyId,
            name: data.name,
            description: data.description,
            displayOrder: data.displayOrder || 0,
        },
    });
};

/**
 * Create or find default Unit Type
 */
export const getOrCreateUnitType = async (accountId, name) => {
    let unitType = await prisma.unitType.findFirst({
        where: { accountId, name },
    });

    if (!unitType) {
        unitType = await prisma.unitType.create({
            data: { accountId, name },
        });
    }

    return unitType;
};

/**
 * Create a Unit inside a Property
 */
export const createUnit = async (accountId, propertyId, data) => {
    const unitType = await getOrCreateUnitType(accountId, data.unitTypeName || 'Standard');

    return await prisma.unit.create({
        data: {
            propertyId,
            unitGroupId: data.unitGroupId || null,
            unitTypeId: unitType.id,
            name: data.name,
            description: data.description,
            status: data.status || 'VACANT',
        },
    });
};
export const updateProperty = async (propertyId, accountId, data) => {
    return await prisma.property.updateMany({
        where: { id: propertyId, accountId },
        data: {
            name: data.name,
            description: data.description,
            address: data.address,
            city: data.city,
            country: data.country,
            currency: data.currency,
            defaultGraceDays: data.defaultGraceDays ? Number(data.defaultGraceDays) : undefined,
        },
    });
};

export const updateUnitGroup = async (groupId, data) => {
    return await prisma.unitGroup.update({
        where: { id: groupId },
        data: {
            name: data.name,
            description: data.description,
        },
    });
};

/**
 * Get comprehensive 360 overview for a specific Unit
 */
export const getUnitOverview = async (accountId, propertyId, unitId) => {
    const unit = await prisma.unit.findFirst({
        where: {
            id: unitId,
            propertyId: propertyId,
            property: { accountId },
        },
        include: {
            property: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                    country: true,
                    currency: true,
                    defaultGraceDays: true,
                },
            },
            unitGroup: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
            },
            unitType: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
            },
            leases: {
                include: {
                    tenant: true,
                    invoices: {
                        include: {
                            items: {
                                include: {
                                    chargeType: true,
                                },
                            },
                            payments: true,
                        },
                        orderBy: { issueDate: 'desc' },
                    },
                    documents: true,
                },
                orderBy: { startDate: 'desc' },
            },
            maintenanceRequests: {
                include: {
                    createdBy: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                    documents: true,
                },
                orderBy: { requestedAt: 'desc' },
            },
            announcements: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!unit) return null;

    // Calculate aggregated metrics
    const activeLease = unit.leases.find((l) => l.status === 'ACTIVE') || null;
    const allInvoices = unit.leases.flatMap((l) => l.invoices || []);
    const totalInvoiced = allInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const totalPaid = allInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
    const outstandingBalance = Math.max(0, totalInvoiced - totalPaid);
    const openMaintenanceCount = unit.maintenanceRequests.filter(
        (m) => m.status !== 'COMPLETED' && m.status !== 'CLOSED'
    ).length;

    // Collect all documents connected to unit leases and maintenance
    const leaseDocuments = unit.leases.flatMap((l) => l.documents || []);
    const maintenanceDocuments = unit.maintenanceRequests.flatMap((m) => m.documents || []);
    const allDocuments = [...leaseDocuments, ...maintenanceDocuments];

    return {
        ...unit,
        activeLease,
        metrics: {
            totalInvoiced,
            totalPaid,
            outstandingBalance,
            openMaintenanceCount,
            totalLeasesCount: unit.leases.length,
            totalDocumentsCount: allDocuments.length,
        },
        documents: allDocuments,
    };
};

/**
 * Update a Unit with validation and workspace boundary check
 */
export const updateUnit = async (accountId, propertyId, unitId, data) => {
    const unit = await prisma.unit.findFirst({
        where: { id: unitId, propertyId, property: { accountId } },
    });

    if (!unit) throw new Error('Unit not found in this workspace.');

    let unitTypeId = unit.unitTypeId;
    if (data.unitTypeName) {
        const unitType = await getOrCreateUnitType(accountId, data.unitTypeName);
        unitTypeId = unitType.id;
    }

    return await prisma.unit.update({
        where: { id: unitId },
        data: {
            name: data.name !== undefined ? data.name : undefined,
            description: data.description !== undefined ? data.description : undefined,
            status: data.status !== undefined ? data.status : undefined,
            unitGroupId: data.unitGroupId !== undefined ? (data.unitGroupId || null) : undefined,
            unitTypeId: unitTypeId,
        },
        include: {
            unitGroup: true,
            unitType: true,
            property: true,
        },
    });
};

