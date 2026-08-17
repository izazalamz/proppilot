import { Router } from 'express';
import {
    getChargeTypes,
    handleCreateChargeType,
    handleUpdateChargeType,
    handleDeleteChargeType,
    getInvoices,
    getSingleInvoice,
    handleCreateInvoice,
    handleAddInvoiceItem,
    handleUpdateInvoiceItem,
    handleDeleteInvoiceItem,
    handleUpdateInvoice,
    handleGenerateMonthlyInvoices,
    handleRecordPayment,
    getPayments,
    handleInitSSLCommerz,
    handleSSLCommerzCallback,
} from '../controllers/finance.controller.js';
import { authenticate, requireWorkspace } from '../middlewares/auth.js';

const router = Router();

// ==========================================
// 1. PUBLIC CALLBACK / GATEWAY ENDPOINTS
// ==========================================
router.get('/payments/sslcommerz/callback', handleSSLCommerzCallback);
router.post('/payments/sslcommerz/callback', handleSSLCommerzCallback);
router.post('/payments/sslcommerz/ipn', handleSSLCommerzCallback);

// ==========================================
// 2. AUTHENTICATED WORKSPACE ENDPOINTS
// ==========================================
router.use(authenticate, requireWorkspace());

// Charge Types CRUD
router.get('/charge-types', getChargeTypes);
router.post('/charge-types', handleCreateChargeType);
router.put('/charge-types/:id', handleUpdateChargeType);
router.delete('/charge-types/:id', handleDeleteChargeType);

// Invoices CRUD & Engine
router.get('/invoices', getInvoices);
router.post('/invoices', handleCreateInvoice);
router.post('/invoices/generate-monthly', handleGenerateMonthlyInvoices);
router.get('/invoices/:id', getSingleInvoice);
router.put('/invoices/:id', handleUpdateInvoice);

// Invoice Item Management
router.post('/invoices/:id/items', handleAddInvoiceItem);
router.put('/invoices/:id/items/:itemId', handleUpdateInvoiceItem);
router.delete('/invoices/:id/items/:itemId', handleDeleteInvoiceItem);

// Payments & Gateways
router.post('/invoices/:invoiceId/payments', handleRecordPayment);
router.post('/invoices/:invoiceId/sslcommerz/init', handleInitSSLCommerz);
router.get('/payments', getPayments);


export default router;
