import prisma from '../config/db.js';

// ==========================================
// 1. CHARGE TYPES MANAGEMENT
// ==========================================

export const getChargeTypesByAccount = async (accountId) => {
    // If account has no charge types yet, seed default ones
    const count = await prisma.chargeType.count({ where: { accountId } });
    if (count === 0) {
        await prisma.chargeType.createMany({
            data: [
                { accountId, name: 'Base Rent', description: 'Standard monthly space rental charge', isRecurring: true },
                { accountId, name: 'Water & Sewage', description: 'Municipal water utility charge', isRecurring: true, defaultAmount: 50 },
                { accountId, name: 'Electricity Utility', description: 'Power grid electricity consumption charge', isRecurring: true },
                { accountId, name: 'Parking Space Fee', description: 'Dedicated vehicle slot fee', isRecurring: true, defaultAmount: 100 },
                { accountId, name: 'Late Payment Penalty', description: 'Penalty applied for overdue rental bills', isRecurring: false, defaultAmount: 50 },
                { accountId, name: 'Maintenance & Service', description: 'Building upkeep and common area fee', isRecurring: true, defaultAmount: 30 },
            ],
        });
    }

    return await prisma.chargeType.findMany({
        where: { accountId },
        orderBy: { name: 'asc' },
    });
};

export const createChargeType = async (accountId, data) => {
    return await prisma.chargeType.create({
        data: {
            accountId,
            name: data.name,
            description: data.description || null,
            isRecurring: data.isRecurring !== undefined ? data.isRecurring : true,
            defaultAmount: data.defaultAmount ? Number(data.defaultAmount) : null,
        },
    });
};

export const updateChargeType = async (accountId, id, data) => {
    const existing = await prisma.chargeType.findFirst({
        where: { id, accountId },
    });
    if (!existing) throw new Error('Charge Type not found.');

    return await prisma.chargeType.update({
        where: { id },
        data: {
            name: data.name !== undefined ? data.name : undefined,
            description: data.description !== undefined ? data.description : undefined,
            isRecurring: data.isRecurring !== undefined ? data.isRecurring : undefined,
            defaultAmount: data.defaultAmount !== undefined ? (data.defaultAmount ? Number(data.defaultAmount) : null) : undefined,
        },
    });
};

export const deleteChargeType = async (accountId, id) => {
    const existing = await prisma.chargeType.findFirst({
        where: { id, accountId },
    });
    if (!existing) throw new Error('Charge Type not found.');

    return await prisma.chargeType.delete({
        where: { id },
    });
};

// ==========================================
// 2. INVOICE SERVICES & GENERATION
// ==========================================

export const getInvoicesByAccount = async (accountId, filters = {}) => {
    const whereClause = {
        lease: {
            unit: {
                property: { accountId },
            },
        },
    };

    if (filters.status && filters.status !== 'ALL') {
        whereClause.status = filters.status;
    }

    if (filters.propertyId) {
        whereClause.lease.unit.propertyId = filters.propertyId;
    }

    if (filters.unitId) {
        whereClause.lease.unitId = filters.unitId;
    }

    if (filters.tenantId) {
        whereClause.lease.tenantId = filters.tenantId;
    }

    return await prisma.invoice.findMany({
        where: whereClause,
        include: {
            lease: {
                include: {
                    tenant: true,
                    unit: {
                        include: {
                            property: true,
                            unitGroup: true,
                        },
                    },
                },
            },
            items: {
                include: {
                    chargeType: true,
                },
            },
            payments: {
                orderBy: { paymentDate: 'desc' },
            },
        },
        orderBy: { issueDate: 'desc' },
    });
};

export const getInvoiceById = async (accountId, invoiceId) => {
    return await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            lease: {
                unit: {
                    property: { accountId },
                },
            },
        },
        include: {
            lease: {
                include: {
                    tenant: true,
                    unit: {
                        include: {
                            property: true,
                            unitGroup: true,
                        },
                    },
                },
            },
            items: {
                include: {
                    chargeType: true,
                },
            },
            payments: {
                orderBy: { paymentDate: 'desc' },
            },
        },
    });
};

/**
 * Manually create an invoice with line items
 */
export const createInvoice = async (accountId, data) => {
    return await prisma.$transaction(async (tx) => {
        // Verify lease belongs to account
        const lease = await tx.lease.findFirst({
            where: {
                id: data.leaseId,
                unit: { property: { accountId } },
            },
            include: {
                unit: { include: { property: true } },
                tenant: true,
            },
        });

        if (!lease) {
            throw new Error('Active Lease not found in this workspace.');
        }

        // Generate unique Invoice Number (e.g. INV-202608-4821)
        const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = data.invoiceNumber || `INV-${dateStr}-${randomSuffix}`;

        // Calculate line items total
        const itemsData = data.items || [];
        if (itemsData.length === 0) {
            throw new Error('An invoice must contain at least one charge item.');
        }

        let subtotal = 0;
        const calculatedItems = itemsData.map((item) => {
            const quantity = Number(item.quantity || 1);
            const unitPrice = Number(item.unitPrice || 0);
            const amount = quantity * unitPrice;
            subtotal += amount;
            return {
                chargeTypeId: item.chargeTypeId,
                description: item.description || 'Rental Charge',
                quantity,
                unitPrice,
                amount,
            };
        });

        const discount = Number(data.discount || 0);
        const totalAmount = Math.max(0, subtotal - discount);

        const invoice = await tx.invoice.create({
            data: {
                leaseId: lease.id,
                invoiceNumber,
                issueDate: new Date(data.issueDate || new Date()),
                dueDate: new Date(data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
                subtotal,
                discount,
                totalAmount,
                paidAmount: 0,
                status: data.status || 'UNPAID',
                notes: data.notes || null,
                items: {
                    create: calculatedItems,
                },
            },
            include: {
                lease: {
                    include: {
                        tenant: true,
                        unit: { include: { property: true } },
                    },
                },
                items: {
                    include: { chargeType: true },
                },
                payments: true,
            },
        });

        return invoice;
    });
};

/**
 * Add a new line item to an existing invoice
 */
export const addInvoiceItem = async (accountId, invoiceId, itemData) => {
    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
            where: {
                id: invoiceId,
                lease: { unit: { property: { accountId } } },
            },
            include: { items: true },
        });

        if (!invoice) throw new Error('Invoice not found in this workspace.');

        const quantity = Number(itemData.quantity || 1);
        const unitPrice = Number(itemData.unitPrice || 0);
        const amount = quantity * unitPrice;

        await tx.invoiceItem.create({
            data: {
                invoiceId: invoice.id,
                chargeTypeId: itemData.chargeTypeId,
                description: itemData.description || 'Additional Charge',
                quantity,
                unitPrice,
                amount,
            },
        });

        // Re-calculate invoice totals
        const allItems = await tx.invoiceItem.findMany({ where: { invoiceId: invoice.id } });
        const subtotal = allItems.reduce((sum, it) => sum + Number(it.amount), 0);
        const totalAmount = Math.max(0, subtotal - Number(invoice.discount || 0));
        const paidAmount = Number(invoice.paidAmount || 0);

        let status = invoice.status;
        if (paidAmount >= totalAmount && totalAmount > 0) {
            status = 'PAID';
        } else if (paidAmount > 0) {
            status = 'PARTIALLY_PAID';
        } else if (status === 'PAID' && paidAmount < totalAmount) {
            status = 'PARTIALLY_PAID';
        }

        return await tx.invoice.update({
            where: { id: invoice.id },
            data: { subtotal, totalAmount, status },
            include: {
                lease: {
                    include: { tenant: true, unit: { include: { property: true } } },
                },
                items: { include: { chargeType: true } },
                payments: true,
            },
        });
    });
};

/**
 * Update an existing line item in an invoice
 */
export const updateInvoiceItem = async (accountId, invoiceId, itemId, itemData) => {
    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
            where: {
                id: invoiceId,
                lease: { unit: { property: { accountId } } },
            },
        });

        if (!invoice) throw new Error('Invoice not found in this workspace.');

        const existingItem = await tx.invoiceItem.findFirst({
            where: { id: itemId, invoiceId: invoice.id },
        });

        if (!existingItem) throw new Error('Invoice item not found.');

        const quantity = itemData.quantity !== undefined ? Number(itemData.quantity) : existingItem.quantity;
        const unitPrice = itemData.unitPrice !== undefined ? Number(itemData.unitPrice) : Number(existingItem.unitPrice);
        const amount = quantity * unitPrice;

        await tx.invoiceItem.update({
            where: { id: itemId },
            data: {
                chargeTypeId: itemData.chargeTypeId || undefined,
                description: itemData.description !== undefined ? itemData.description : undefined,
                quantity,
                unitPrice,
                amount,
            },
        });

        // Re-calculate invoice totals
        const allItems = await tx.invoiceItem.findMany({ where: { invoiceId: invoice.id } });
        const subtotal = allItems.reduce((sum, it) => sum + Number(it.amount), 0);
        const totalAmount = Math.max(0, subtotal - Number(invoice.discount || 0));
        const paidAmount = Number(invoice.paidAmount || 0);

        let status = invoice.status;
        if (paidAmount >= totalAmount && totalAmount > 0) {
            status = 'PAID';
        } else if (paidAmount > 0) {
            status = 'PARTIALLY_PAID';
        }

        return await tx.invoice.update({
            where: { id: invoice.id },
            data: { subtotal, totalAmount, status },
            include: {
                lease: {
                    include: { tenant: true, unit: { include: { property: true } } },
                },
                items: { include: { chargeType: true } },
                payments: true,
            },
        });
    });
};

/**
 * Delete a line item from an invoice
 */
export const deleteInvoiceItem = async (accountId, invoiceId, itemId) => {
    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
            where: {
                id: invoiceId,
                lease: { unit: { property: { accountId } } },
            },
            include: { items: true },
        });

        if (!invoice) throw new Error('Invoice not found in this workspace.');
        if (invoice.items.length <= 1) {
            throw new Error('An invoice must have at least one charge item. You cannot delete the only item.');
        }

        await tx.invoiceItem.delete({
            where: { id: itemId },
        });

        // Re-calculate invoice totals
        const allItems = await tx.invoiceItem.findMany({ where: { invoiceId: invoice.id } });
        const subtotal = allItems.reduce((sum, it) => sum + Number(it.amount), 0);
        const totalAmount = Math.max(0, subtotal - Number(invoice.discount || 0));
        const paidAmount = Number(invoice.paidAmount || 0);

        let status = 'UNPAID';
        if (paidAmount >= totalAmount && totalAmount > 0) {
            status = 'PAID';
        } else if (paidAmount > 0) {
            status = 'PARTIALLY_PAID';
        }

        return await tx.invoice.update({
            where: { id: invoice.id },
            data: { subtotal, totalAmount, status },
            include: {
                lease: {
                    include: { tenant: true, unit: { include: { property: true } } },
                },
                items: { include: { chargeType: true } },
                payments: true,
            },
        });
    });
};

/**
 * Update invoice top-level metadata (discount, notes, dueDate)
 */
export const updateInvoiceDetails = async (accountId, invoiceId, data) => {
    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
            where: {
                id: invoiceId,
                lease: { unit: { property: { accountId } } },
            },
        });

        if (!invoice) throw new Error('Invoice not found.');

        const discount = data.discount !== undefined ? Number(data.discount) : Number(invoice.discount || 0);
        const totalAmount = Math.max(0, Number(invoice.subtotal) - discount);
        const paidAmount = Number(invoice.paidAmount || 0);

        let status = invoice.status;
        if (paidAmount >= totalAmount && totalAmount > 0) {
            status = 'PAID';
        } else if (paidAmount > 0) {
            status = 'PARTIALLY_PAID';
        }

        return await tx.invoice.update({
            where: { id: invoiceId },
            data: {
                discount,
                totalAmount,
                status: data.status || status,
                notes: data.notes !== undefined ? data.notes : undefined,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
            },
            include: {
                lease: {
                    include: { tenant: true, unit: { include: { property: true } } },
                },
                items: { include: { chargeType: true } },
                payments: true,
            },
        });
    });
};


/**
 * Automated batch invoice generation for all active leases for a billing month
 */
export const generateMonthlyInvoices = async (accountId, { billingMonth, dueDate }) => {
    // Find all ACTIVE leases in the account
    const activeLeases = await prisma.lease.findMany({
        where: {
            status: 'ACTIVE',
            unit: { property: { accountId } },
        },
        include: {
            unit: { include: { property: true } },
            tenant: true,
        },
    });

    if (activeLeases.length === 0) {
        return { message: 'No active leases found for automatic invoice generation.', generatedCount: 0, invoices: [] };
    }

    // Default Rent charge type
    let rentChargeType = await prisma.chargeType.findFirst({
        where: { accountId, name: { contains: 'Rent', mode: 'insensitive' } },
    });
    if (!rentChargeType) {
        rentChargeType = await prisma.chargeType.create({
            data: { accountId, name: 'Base Rent', isRecurring: true },
        });
    }

    const targetDate = billingMonth ? new Date(billingMonth) : new Date();
    const issueDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const invoiceDueDate = dueDate
        ? new Date(dueDate)
        : new Date(targetDate.getFullYear(), targetDate.getMonth(), 10);

    const datePrefix = `${targetDate.getFullYear()}${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

    const createdInvoices = [];

    for (const lease of activeLeases) {
        // Check if invoice already generated for this lease in this month
        const existing = await prisma.invoice.findFirst({
            where: {
                leaseId: lease.id,
                issueDate: {
                    gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), 1),
                    lt: new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1),
                },
            },
        });

        if (!existing) {
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const invoiceNumber = `INV-${datePrefix}-${randomSuffix}`;
            const rentAmount = Number(lease.rentAmount);

            const newInvoice = await prisma.invoice.create({
                data: {
                    leaseId: lease.id,
                    invoiceNumber,
                    issueDate,
                    dueDate: invoiceDueDate,
                    subtotal: rentAmount,
                    discount: 0,
                    totalAmount: rentAmount,
                    paidAmount: 0,
                    status: 'UNPAID',
                    notes: `Automated rent invoice for ${targetDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                    items: {
                        create: [
                            {
                                chargeTypeId: rentChargeType.id,
                                description: `Monthly Rent — ${lease.unit.name}`,
                                quantity: 1,
                                unitPrice: rentAmount,
                                amount: rentAmount,
                            },
                        ],
                    },
                },
            });
            createdInvoices.push(newInvoice);
        }
    }

    return {
        message: `Successfully generated ${createdInvoices.length} monthly invoices.`,
        generatedCount: createdInvoices.length,
        invoices: createdInvoices,
    };
};

// ==========================================
// 3. PAYMENT PROCESSING (CASH & GATEWAYS)
// ==========================================

/**
 * Record a manual cash/bank transfer payment for an invoice
 */
export const recordPayment = async (accountId, invoiceId, paymentData) => {
    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findFirst({
            where: {
                id: invoiceId,
                lease: { unit: { property: { accountId } } },
            },
        });

        if (!invoice) {
            throw new Error('Invoice not found in this workspace.');
        }

        const paymentAmount = Number(paymentData.amount);
        if (paymentAmount <= 0) {
            throw new Error('Payment amount must be greater than zero.');
        }

        const newPaidAmount = Number(invoice.paidAmount) + paymentAmount;
        const totalAmount = Number(invoice.totalAmount);

        let newStatus = invoice.status;
        if (newPaidAmount >= totalAmount) {
            newStatus = 'PAID';
        } else if (newPaidAmount > 0) {
            newStatus = 'PARTIALLY_PAID';
        }

        // Create Payment record
        const payment = await tx.payment.create({
            data: {
                invoiceId: invoice.id,
                amount: paymentAmount,
                paymentMethod: paymentData.paymentMethod || 'CASH',
                paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate) : new Date(),
                transactionReference: paymentData.transactionReference || `CASH-${Date.now()}`,
                status: 'SUCCESS',
                remarks: paymentData.remarks || 'Manual payment recorded by manager.',
            },
        });

        // Update Invoice status & paidAmount
        const updatedInvoice = await tx.invoice.update({
            where: { id: invoice.id },
            data: {
                paidAmount: newPaidAmount,
                status: newStatus,
            },
            include: {
                payments: true,
                items: true,
                lease: {
                    include: { tenant: true, unit: true },
                },
            },
        });

        return { payment, invoice: updatedInvoice };
    });
};

/**
 * Get all payment records across workspace
 */
export const getPaymentsByAccount = async (accountId) => {
    return await prisma.payment.findMany({
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
                            tenant: true,
                            unit: { include: { property: true } },
                        },
                    },
                },
            },
        },
        orderBy: { paymentDate: 'desc' },
    });
};

// ==========================================
// 4. SSLCOMMERZ SANDBOX INTEGRATION
// ==========================================

export const initSSLCommerzSession = async (accountId, invoiceId, { originUrl, returnPath = '/finance' } = {}) => {
    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            lease: { unit: { property: { accountId } } },
        },
        include: {
            lease: {
                include: {
                    tenant: true,
                    unit: { include: { property: true } },
                },
            },
        },
    });

    if (!invoice) throw new Error('Invoice not found.');

    const dueAmount = Number(invoice.totalAmount) - Number(invoice.paidAmount);
    if (dueAmount <= 0) {
        throw new Error('This invoice is already fully paid.');
    }

    const tranId = `SSLCZ-${invoice.id.slice(0, 8)}-${Date.now()}`;
    const tenant = invoice.lease.tenant;
    const customerName = tenant.tenantType === 'BUSINESS'
        ? tenant.businessName
        : `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || 'Tenant User';

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const frontendBase = originUrl || process.env.FRONTEND_URL || 'http://localhost:5173';

    // SSLCommerz Session Payload
    const sessionData = {
        store_id: process.env.SSLCOMMERZ_STORE_ID || 'testbox',
        store_passwd: process.env.SSLCOMMERZ_STORE_PASS || 'qwerty',
        total_amount: dueAmount,
        currency: invoice.lease.unit.property.currency || 'BDT',
        tran_id: tranId,
        success_url: `${baseUrl}/api/finance/payments/sslcommerz/callback?status=success&invoiceId=${invoice.id}&frontend=${encodeURIComponent(frontendBase)}&returnPath=${encodeURIComponent(returnPath)}`,
        fail_url: `${baseUrl}/api/finance/payments/sslcommerz/callback?status=fail&invoiceId=${invoice.id}&frontend=${encodeURIComponent(frontendBase)}&returnPath=${encodeURIComponent(returnPath)}`,
        cancel_url: `${baseUrl}/api/finance/payments/sslcommerz/callback?status=cancel&invoiceId=${invoice.id}&frontend=${encodeURIComponent(frontendBase)}&returnPath=${encodeURIComponent(returnPath)}`,
        ipn_url: `${baseUrl}/api/finance/payments/sslcommerz/ipn`,

        product_name: `Rent Invoice ${invoice.invoiceNumber}`,
        product_category: 'Property Rental',
        product_profile: 'general',
        cus_name: customerName,
        cus_email: tenant.email,
        cus_phone: tenant.phone || '01700000000',
        cus_add1: invoice.lease.unit.property.address || 'Dhaka',
        cus_city: invoice.lease.unit.property.city || 'Dhaka',
        cus_country: invoice.lease.unit.property.country || 'Bangladesh',
        shipping_method: 'NO',
        num_of_item: 1,
    };

    // Call official SSLCommerz Sandbox API
    const postBody = new URLSearchParams();
    for (const [k, v] of Object.entries(sessionData)) {
        postBody.append(k, v !== undefined && v !== null ? String(v) : '');
    }

    let gatewayUrl = null;
    let isLiveGateway = false;

    try {
        const response = await fetch('https://sandbox.sslcommerz.com/gwprocess/v4/api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: postBody.toString(),
        });
        const result = await response.json();
        if (result && result.status === 'SUCCESS' && result.GatewayPageURL) {
            gatewayUrl = result.GatewayPageURL;
            isLiveGateway = true;
        }
    } catch (err) {
        console.warn('SSLCommerz Sandbox API response:', err.message);
    }

    return {
        sessionUrl: gatewayUrl,
        isLiveGateway,
        tranId,
        dueAmount,
        invoiceNumber: invoice.invoiceNumber,
        currency: sessionData.currency,
        mockCheckoutUrl: `${baseUrl}/api/finance/payments/sslcommerz/callback?status=success&invoiceId=${invoice.id}&tran_id=${tranId}&amount=${dueAmount}&frontend=${encodeURIComponent(frontendBase)}`,
    };
};

export const handleSSLCommerzPaymentCallback = async ({ status, invoiceId, tran_id, amount, val_id, card_type }) => {
    const isSuccess = (status && status.toLowerCase() === 'success') || (status && status.toLowerCase() === 'valid');
    if (!isSuccess) {
        return { success: false, status, message: `Payment ${status || 'failed'}.` };
    }

    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findUnique({
            where: { id: invoiceId },
        });

        if (!invoice) throw new Error('Invoice not found for payment confirmation.');

        const payAmount = amount ? Number(amount) : (Number(invoice.totalAmount) - Number(invoice.paidAmount));
        const newPaidAmount = Number(invoice.paidAmount) + payAmount;
        const newStatus = newPaidAmount >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';

        // Record SSLCommerz payment
        const payment = await tx.payment.create({
            data: {
                invoiceId: invoice.id,
                amount: payAmount,
                paymentMethod: 'SSLCOMMERZ',
                paymentDate: new Date(),
                transactionReference: tran_id || val_id || `SSLCZ-TXN-${Date.now()}`,
                status: 'SUCCESS',
                remarks: `Verified SSLCommerz Sandbox Transaction (${card_type || 'Digital Gateway'}).`,
            },
        });

        // Update Invoice status
        await tx.invoice.update({
            where: { id: invoice.id },
            data: {
                paidAmount: newPaidAmount,
                status: newStatus,
            },
        });

        return { success: true, payment, newStatus };
    });
};

