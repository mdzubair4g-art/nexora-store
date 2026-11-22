require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const { authMiddleware } = require('./middleware/auth');
const { logApiCall } = require('./db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const couponRoutes = require('./routes/coupons');
const shippingRoutes = require('./routes/shipping');
const paymentRoutes = require('./routes/payments');
const statsRoutes = require('./routes/stats');
const docsRoutes = require('./routes/docs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5000').split(',').map(origin => origin.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(authMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  logApiCall('GET', '/api/health', 200, 'Server healthy');
  res.json({
    status: 'online',
    platform: 'NEXORA.in Full-Stack Engine',
    database: 'SQLite (Node.js native DatabaseSync)',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api-docs', docsRoutes);
app.get('/api', (req, res) => res.redirect('/api-docs'));

// Static Client Serving (Production Bundle)
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  NEXORA.in REST API Engine running on :${PORT} `);
    console.log(`  Database: SQLite (server/nexora.db)          `);
    console.log(`  Ready for Client & Payment/Shipping Requests `);
    console.log(`===============================================`);
  });
}

module.exports = app;
