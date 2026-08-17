import prisma from '../config/db.js';

export const getDashboardAnalytics = async (accountId) => {
    // 1. Properties & Units Aggregation
    const properties = await prisma.property.findMany({
        where: { accountId },
        include: {
            units: {
                include: {
                    unitGroup: true,
                    unitType: true,
                    leases: {
                        where: { status: 'ACTIVE' },
                        include: { tenant: true },
                    },
                },
            },
        },
    });

    const totalProperties = properties.length;
    const allUnits = properties.flatMap((p) => p.units || []);
    const totalUnits = allUnits.length;
    const occupiedUnits = allUnits.filter((u) => u.status === 'OCCUPIED').length;
    const vacantUnits = allUnits.filter((u) => u.status === 'VACANT').length;
    const maintenanceUnits = allUnits.filter((u) => u.status === 'UNDER_MAINTENANCE').length;
    const reservedUnits = allUnits.filter((u) => u.status === 'RESERVED').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    // Property-level occupancy breakdown
    const propertyOccupancyBreakdown = properties.map((p) => {
        const pUnits = p.units || [];
        const pOccupied = pUnits.filter((u) => u.status === 'OCCUPIED').length;
        const pRate = pUnits.length > 0 ? Math.round((pOccupied / pUnits.length) * 100) : 0;
        return {
            propertyId: p.id,
            propertyName: p.name,
            city: p.city,
            totalUnits: pUnits.length,
            occupiedUnits: pOccupied,
            occupancyRate: pRate,
        };
    });

    // 2. Financial Aggregation (Invoices & Payments)
    const invoices = await prisma.invoice.findMany({
        where: {
            lease: {
                unit: {
                    property: { accountId },
                },
            },
        },
        include: {
            payments: true,
            lease: {
                include: {
                    unit: { include: { property: true } },
                    tenant: true,
                },
            },
        },
        orderBy: { issueDate: 'desc' },
    });

    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
    const outstandingDue = Math.max(0, totalInvoiced - totalCollected);
    const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

    // Monthly 6-Month Trend Calculation
    const monthsMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthsMap[monthKey] = {
            month: monthKey,
            invoiced: 0,
            collected: 0,
        };
    }

    invoices.forEach((inv) => {
        const d = new Date(inv.issueDate);
        const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthsMap[monthKey]) {
            monthsMap[monthKey].invoiced += Number(inv.totalAmount || 0);
            monthsMap[monthKey].collected += Number(inv.paidAmount || 0);
        }
    });

    const monthlyRevenueTrend = Object.values(monthsMap);

    // 3. Active Leases & Expirations (Next 90 Days)
    const activeLeases = await prisma.lease.findMany({
        where: {
            status: 'ACTIVE',
            unit: {
                property: { accountId },
            },
        },
        include: {
            unit: {
                include: { property: true },
            },
            tenant: true,
        },
        orderBy: { endDate: 'asc' },
    });

    const today = new Date();
    const upcomingExpirations = activeLeases
        .map((lease) => {
            const end = new Date(lease.endDate);
            const diffTime = end - today;
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return {
                id: lease.id,
                leaseNumber: lease.id.substring(0, 8).toUpperCase(),
                tenantName: lease.tenant?.tenantType === 'BUSINESS'
                    ? lease.tenant.businessName
                    : `${lease.tenant?.firstName || ''} ${lease.tenant?.lastName || ''}`.trim(),
                tenantEmail: lease.tenant?.email,
                unitName: lease.unit?.name,
                propertyName: lease.unit?.property?.name,
                rentAmount: Number(lease.rentAmount || 0),
                startDate: lease.startDate,
                endDate: lease.endDate,
                daysLeft,
                isUrgent: daysLeft <= 30,
            };
        })
        .filter((l) => l.daysLeft <= 90);

    // 4. Maintenance Work Orders Queue
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
        where: {
            property: { accountId },
        },
        include: {
            property: { select: { name: true } },
            unit: { select: { name: true } },
            assignedTo: { select: { firstName: true, lastName: true } },
        },
        orderBy: { requestedAt: 'desc' },
    });

    const totalTickets = maintenanceRequests.length;
    const requestedTickets = maintenanceRequests.filter((m) => m.status === 'REQUESTED').length;
    const reviewedTickets = maintenanceRequests.filter((m) => m.status === 'REVIEWED').length;
    const inProgressTickets = maintenanceRequests.filter((m) => m.status === 'IN_PROGRESS').length;
    const completedTickets = maintenanceRequests.filter((m) => m.status === 'COMPLETED').length;
    const urgentTickets = maintenanceRequests.filter(
        (m) => (m.priority === 'URGENT' || m.priority === 'HIGH') && m.status !== 'COMPLETED'
    ).length;

    const maintenanceActionQueue = maintenanceRequests
        .filter((m) => m.status !== 'COMPLETED' && m.status !== 'CANCELLED')
        .slice(0, 5);

    // 5. Recent Activity Ledger (Latest Payments)
    const recentPayments = await prisma.payment.findMany({
        where: {
            invoice: {
                lease: {
                    unit: {
                        property: { accountId },
                    },
                },
            },
        },
        include: {
            invoice: {
                include: {
                    lease: {
                        include: {
                            unit: { select: { name: true, property: { select: { name: true } } } },
                            tenant: true,
                        },
                    },
                },
            },
        },
        orderBy: { paymentDate: 'desc' },
        take: 5,
    });

    const paymentsFeed = recentPayments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        paymentMethod: p.paymentMethod,
        transactionReference: p.transactionReference,
        paymentDate: p.paymentDate,
        status: p.status,
        invoiceNumber: p.invoice?.invoiceNumber,
        unitName: p.invoice?.lease?.unit?.name,
        propertyName: p.invoice?.lease?.unit?.property?.name,
        tenantName: p.invoice?.lease?.tenant?.tenantType === 'BUSINESS'
            ? p.invoice.lease.tenant.businessName
            : `${p.invoice?.lease?.tenant?.firstName || ''} ${p.invoice?.lease?.tenant?.lastName || ''}`.trim(),
    }));

    return {
        financials: {
            totalInvoiced,
            totalCollected,
            outstandingDue,
            collectionRate,
            monthlyRevenueTrend,
        },
        occupancy: {
            totalProperties,
            totalUnits,
            occupiedUnits,
            vacantUnits,
            maintenanceUnits,
            reservedUnits,
            occupancyRate,
            propertyOccupancyBreakdown,
        },
        leases: {
            totalActiveLeases: activeLeases.length,
            upcomingExpirations,
        },
        maintenance: {
            totalTickets,
            requestedTickets,
            reviewedTickets,
            inProgressTickets,
            completedTickets,
            urgentTickets,
            actionQueue: maintenanceActionQueue,
        },
        recentActivity: {
            paymentsFeed,
        },
    };
};
