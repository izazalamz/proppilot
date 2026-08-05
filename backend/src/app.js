import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import propertyRoutes from './routes/property.routes.js';
import tenantRoutes from './routes/tenant.routes.js';

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'PropPilot API is up and running!',
        timestamp: new Date().toISOString(),
    });
});

// Register API Routes
app.use('/api/auth', authRoutes);
// Property API Routes
app.use('/api/properties', propertyRoutes);
// Tenant API Routes
app.use('/api/tenants', tenantRoutes);

// Global 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

export default app;