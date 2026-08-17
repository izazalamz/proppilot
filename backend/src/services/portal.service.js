import prisma from '../config/db.js';
import { initSSLCommerzSession } from './finance.service.js';

export const getTenantPortalOverview = async (userId, userEmail, accountId = null, leaseId = null) => {
    // 1. Fetch ALL active leases for this user/email across all workspaces
    const allLeases = await prisma.lease.findMany({
        where: {
            status: 'ACTIVE',
            tenant: {
                OR: [
                    { userId },
                    { email: { equals: userEmail, mode: 'insensitive' } },
                ],
            },
        },
        include: {
            tenant: {
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                    maintenanceRequests: {
                        include: {
                            property: { select: { name: true } },
                            unit: { select: { name: true } },
                            assignedTo: { select: { firstName: true, lastName: true, email: true, phone: true } },
                        },
                        orderBy: { requestedAt: 'desc' },
                    },
                    documents: true,
                },
            },
            unit: {
                include: {
                    property: {
                        include: {
                            account: { select: { id: true, name: true } },
                        },
                    },
                    unitGroup: true,
                    unitType: true,
                },
            },
            invoices: {
                include: {
                    items: { include: { chargeType: true } },
                    payments: { orderBy: { paymentDate: 'desc' } },
                },
                orderBy: { issueDate: 'desc' },
            },
            documents: true,
        },
        orderBy: { startDate: 'desc' },
    });

    if (allLeases.length === 0) {
        // Check if there are any non-active leases
        const fallbackTenant = await prisma.tenant.findFirst({
            where: {
                OR: [
                    { userId },
                    { email: { equals: userEmail, mode: 'insensitive' } },
                ],
            },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                leases: {
                    include: {
                        unit: { include: { property: true, unitGroup: true, unitType: true } },
                        invoices: true,
                        documents: true,
                    },
                },
                maintenanceRequests: true,
                documents: true,
            },
        });

        if (!fallbackTenant || fallbackTenant.leases.length === 0) {
            return {
                hasActiveLease: false,
                availableLeases: [],
                message: 'No tenant lease record found for this user account.',
            };
        }
    }

    const availableLeases = allLeases.map((l) => ({
        id: l.id,
        unitId: l.unit.id,
        unitName: l.unit.name,
        propertyName: l.unit.property.name,
        propertyAddress: l.unit.property.address,
        propertyCity: l.unit.property.city,
        rentAmount: Number(l.rentAmount),
        accountId: l.unit.property.accountId,
        accountName: l.unit.property.account?.name,
        startDate: l.startDate,
        endDate: l.endDate,
        status: l.status,
    }));

    // 2. Determine selected lease
    let selectedLease = null;
    if (leaseId) {
        selectedLease = allLeases.find((l) => l.id === leaseId);
    }
    if (!selectedLease && accountId) {
        selectedLease = allLeases.find((l) => l.unit.property.accountId === accountId);
    }
    if (!selectedLease) {
        selectedLease = allLeases[0];
    }

    const tenant = selectedLease.tenant;
    const property = selectedLease.unit.property;

    // Fetch announcements for this property
    const announcements = await prisma.announcement.findMany({
        where: {
            propertyId: property.id,
            isPublished: true,
        },
        orderBy: { publishedAt: 'desc' },
    });

    // Invoices for selected lease
    const invoices = selectedLease.invoices || [];
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
    const outstandingDue = Math.max(0, totalInvoiced - totalPaid);

    // Maintenance requests for this unit / property
    const maintenanceRequests = (tenant.maintenanceRequests || []).filter(
        (m) => m.unitId === selectedLease.unitId || m.propertyId === property.id
    );

    // Documents (lease docs + tenant docs)
    const leaseDocs = selectedLease.documents || [];
    const tenantDocs = tenant.documents || [];
    const allDocs = [...leaseDocs, ...tenantDocs];

    return {
        hasActiveLease: true,
        availableLeases,
        selectedLeaseId: selectedLease.id,
        tenant: {
            id: tenant.id,
            name:
                tenant.tenantType === 'BUSINESS'
                    ? tenant.businessName
                    : `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.email,
            email: tenant.email,
            phone: tenant.phone,
            tenantType: tenant.tenantType,
            emergencyContact: tenant.emergencyContact,
        },
        space: {
            leaseId: selectedLease.id,
            startDate: selectedLease.startDate,
            endDate: selectedLease.endDate,
            monthlyRent: Number(selectedLease.rentAmount),
            securityDeposit: Number(selectedLease.securityDeposit),
            billingCycle: selectedLease.billingCycle,
            unitName: selectedLease.unit.name,
            unitGroupName: selectedLease.unit.unitGroup?.name,
            unitTypeName: selectedLease.unit.unitType?.name,
            propertyName: property.name,
            propertyAddress: property.address,
            propertyCity: property.city,
            currency: property.currency,
            accountId: property.accountId,
            accountName: property.account?.name,
        },
        financials: {
            totalInvoiced,
            totalPaid,
            outstandingDue,
            invoices,
        },
        maintenanceRequests,
        announcements,
        documents: allDocs,
    };
};

export const createTenantMaintenanceTicket = async (userId, userEmail, data) => {
    // Find tenant active lease
    const tenant = await prisma.tenant.findFirst({
        where: {
            OR: [
                { userId },
                { email: { equals: userEmail, mode: 'insensitive' } },
            ],
        },
        include: {
            leases: {
                where: { status: 'ACTIVE' },
                include: { unit: { include: { property: true } } },
            },
        },
    });

    if (!tenant || !tenant.leases?.[0]) {
        throw new Error('You must have an active lease to submit a maintenance request.');
    }

    const lease = tenant.leases[0];

    return await prisma.maintenanceRequest.create({
        data: {
            propertyId: lease.unit.property.id,
            unitId: lease.unit.id,
            tenantId: tenant.id,
            createdByUserId: userId,
            title: data.title,
            problemDescription: data.problemDescription,
            category: data.category || 'General Upkeep',
            priority: data.priority || 'MEDIUM',
            status: 'REQUESTED',
            requestedAt: new Date(),
        },
        include: {
            property: true,
            unit: true,
        },
    });
};

export const initTenantPayment = async (userId, userEmail, invoiceId, { originUrl }) => {
    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            lease: {
                tenant: {
                    OR: [
                        { userId },
                        { email: { equals: userEmail, mode: 'insensitive' } },
                    ],
                },
            },
        },
        include: {
            lease: {
                include: {
                    unit: { include: { property: true } },
                },
            },
        },
    });

    if (!invoice) throw new Error('Invoice not found or does not belong to your lease.');

    return await initSSLCommerzSession(invoice.lease.unit.property.accountId, invoiceId, {
        originUrl,
        returnPath: '/portal',
    });
};

