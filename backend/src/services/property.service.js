import prisma from '../config/db.js';

/**
 * Get all properties for a workspace
 */
export const getPropertiesByAccount = async (accountId) => {
    return await prisma.property.findMany({
        where: { accountId },
        include: {
            _count: {
                select: { units: true, unitGroups: true },
            },
        },
        orderBy: { createdAt: 'desc' },
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
            },
            units: {
                where: { unitGroupId: null }, // Units without a group
                include: { unitType: true },
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