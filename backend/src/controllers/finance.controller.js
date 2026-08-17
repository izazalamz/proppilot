import { z } from 'zod';
import {
    getChargeTypesByAccount,
    createChargeType,
    updateChargeType,
    deleteChargeType,
    getInvoicesByAccount,
    getInvoiceById,
    createInvoice,
    addInvoiceItem,
    updateInvoiceItem,
    deleteInvoiceItem,
    updateInvoiceDetails,
    generateMonthlyInvoices,
    recordPayment,
    getPaymentsByAccount,
    initSSLCommerzSession,
    handleSSLCommerzPaymentCallback,
} from '../services/finance.service.js';


// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

const chargeTypeSchema = z.object({
    name: z.string().min(1, 'Charge type name is required'),
    description: z.string().optional(),
    isRecurring: z.boolean().optional(),
    defaultAmount: z.number().nullable().optional(),
});

const invoiceItemSchema = z.object({
    chargeTypeId: z.string().min(1, 'Charge type is required'),
    description: z.string().optional(),
    quantity: z.number().min(1).default(1),
    unitPrice: z.number().min(0, 'Unit price must be non-negative'),
});

const invoiceSchema = z.object({
    leaseId: z.string().min(1, 'Lease selection is required'),
    invoiceNumber: z.string().optional(),
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
    discount: z.number().min(0).optional(),
    notes: z.string().optional(),
    items: z.array(invoiceItemSchema).min(1, 'At least one charge item is required'),
});

const paymentSchema = z.object({
    amount: z.number().positive('Payment amount must be greater than 0'),
    paymentMethod: z.enum(['CASH', 'SSLCOMMERZ', 'BANK_TRANSFER', 'CHEQUE']).default('CASH'),
    paymentDate: z.string().optional(),
    transactionReference: z.string().optional(),
    remarks: z.string().optional(),
});

// ==========================================
// CONTROLLER HANDLERS
// ==========================================

export const getChargeTypes = async (req, res, next) => {
    try {
        const types = await getChargeTypesByAccount(req.accountId);
        return res.status(200).json({ data: types });
    } catch (err) {
        next(err);
    }
};

export const handleCreateChargeType = async (req, res, next) => {
    try {
        const validated = chargeTypeSchema.parse(req.body);
        const created = await createChargeType(req.accountId, validated);
        return res.status(201).json({ message: 'Charge type created successfully', data: created });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleUpdateChargeType = async (req, res, next) => {
    try {
        const validated = chargeTypeSchema.partial().parse(req.body);
        const updated = await updateChargeType(req.accountId, req.params.id, validated);
        return res.status(200).json({ message: 'Charge type updated', data: updated });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleDeleteChargeType = async (req, res, next) => {
    try {
        await deleteChargeType(req.accountId, req.params.id);
        return res.status(200).json({ message: 'Charge type deleted' });
    } catch (err) {
        next(err);
    }
};

export const getInvoices = async (req, res, next) => {
    try {
        const { status, propertyId, unitId, tenantId } = req.query;
        const invoices = await getInvoicesByAccount(req.accountId, { status, propertyId, unitId, tenantId });
        return res.status(200).json({ data: invoices });
    } catch (err) {
        next(err);
    }
};

export const getSingleInvoice = async (req, res, next) => {
    try {
        const invoice = await getInvoiceById(req.accountId, req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        return res.status(200).json({ data: invoice });
    } catch (err) {
        next(err);
    }
};

export const handleCreateInvoice = async (req, res, next) => {
    try {
        const validated = invoiceSchema.parse(req.body);
        const created = await createInvoice(req.accountId, validated);
        return res.status(201).json({ message: 'Invoice created successfully', data: created });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleAddInvoiceItem = async (req, res, next) => {
    try {
        const validated = invoiceItemSchema.parse(req.body);
        const updated = await addInvoiceItem(req.accountId, req.params.id, validated);
        return res.status(201).json({ message: 'Line item added successfully', data: updated });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleUpdateInvoiceItem = async (req, res, next) => {
    try {
        const validated = invoiceItemSchema.partial().parse(req.body);
        const updated = await updateInvoiceItem(req.accountId, req.params.id, req.params.itemId, validated);
        return res.status(200).json({ message: 'Line item updated successfully', data: updated });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const handleDeleteInvoiceItem = async (req, res, next) => {
    try {
        const updated = await deleteInvoiceItem(req.accountId, req.params.id, req.params.itemId);
        return res.status(200).json({ message: 'Line item removed', data: updated });
    } catch (err) {
        next(err);
    }
};

export const handleUpdateInvoice = async (req, res, next) => {
    try {
        const updated = await updateInvoiceDetails(req.accountId, req.params.id, req.body);
        return res.status(200).json({ message: 'Invoice updated successfully', data: updated });
    } catch (err) {
        next(err);
    }
};

export const handleGenerateMonthlyInvoices = async (req, res, next) => {
    try {
        const { billingMonth, dueDate } = req.body;
        const result = await generateMonthlyInvoices(req.accountId, { billingMonth, dueDate });
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};


export const handleRecordPayment = async (req, res, next) => {
    try {
        const validated = paymentSchema.parse(req.body);
        const result = await recordPayment(req.accountId, req.params.invoiceId, validated);
        return res.status(201).json({ message: 'Payment recorded successfully', data: result });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        next(err);
    }
};

export const getPayments = async (req, res, next) => {
    try {
        const payments = await getPaymentsByAccount(req.accountId);
        return res.status(200).json({ data: payments });
    } catch (err) {
        next(err);
    }
};

export const handleInitSSLCommerz = async (req, res, next) => {
    try {
        const originUrl = req.headers.origin || req.headers.referer;
        const session = await initSSLCommerzSession(req.accountId, req.params.invoiceId, { originUrl });
        return res.status(200).json({ data: session });
    } catch (err) {
        next(err);
    }
};

export const handleSSLCommerzCallback = async (req, res, next) => {
    try {
        const { status, invoiceId, tran_id, amount, frontend, returnPath } = { ...req.query, ...req.body };
        const result = await handleSSLCommerzPaymentCallback({ status, invoiceId, tran_id, amount });

        const redirectBase = frontend || process.env.FRONTEND_URL || 'http://localhost:5173';
        const targetPath = returnPath || '/portal';

        if (result.success) {
            return res.redirect(`${redirectBase}${targetPath}?payment=success&invoiceId=${invoiceId}&tranId=${tran_id || ''}`);
        } else {
            return res.redirect(`${redirectBase}${targetPath}?payment=failed&invoiceId=${invoiceId}`);
        }
    } catch (err) {
        console.error('SSLCommerz callback error:', err);
        const redirectBase = req.query.frontend || process.env.FRONTEND_URL || 'http://localhost:5173';
        const targetPath = req.query.returnPath || '/portal';
        return res.redirect(`${redirectBase}${targetPath}?payment=error`);
    }
};

