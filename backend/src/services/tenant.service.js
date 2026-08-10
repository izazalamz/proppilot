import prisma from '../config/db.js';

export const getTenantsByAccount = async (accountId) => {
    return await prisma.tenant.findMany({
        where: { accountId },
        include: {
            leases: {
                include: {
                    unit: {
                        include: {
                            property: true,
                            unitGroup: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const createTenant = async (accountId, data) => {
    return await prisma.tenant.create({
        data: {
            accountId,
            tenantType: data.tenantType || 'INDIVIDUAL',
            firstName: data.firstName,
            lastName: data.lastName,
            businessName: data.businessName,
            email: data.email,
            phone: data.phone,
            governmentId: data.governmentId,
            emergencyContact: data.emergencyContact,
            notes: data.notes,
        },
    });
};

export const getLeasesByAccount = async (accountId) => {
    return await prisma.lease.findMany({
        where: { tenant: { accountId } },
        include: {
            tenant: true,
            unit: {
                include: {
                    property: true,
                    unitGroup: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const createLease = async (accountId, data) => {
    return await prisma.$transaction(async (tx) => {
        const unit = await tx.unit.findFirst({
            where: { id: data.unitId, property: { accountId } },
        });

        if (!unit) {
            throw new Error('Unit not found in this workspace.');
        }

        const lease = await tx.lease.create({
            data: {
                tenantId: data.tenantId,
                unitId: data.unitId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                rentAmount: data.rentAmount,
                securityDeposit: data.securityDeposit || 0,
                billingCycle: data.billingCycle || 'MONTHLY',
                status: data.status || 'ACTIVE',
                notes: data.notes,
            },
        });

        if (lease.status === 'ACTIVE') {
            await tx.unit.update({
                where: { id: data.unitId },
                data: { status: 'OCCUPIED' },
            });

            await tx.occupancy.create({
                data: {
                    unitId: data.unitId,
                    tenantId: data.tenantId,
                    leaseId: lease.id,
                    moveIn: new Date(data.startDate),
                },
            });
        }

        return lease;
    });
};