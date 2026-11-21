require('dotenv').config();
const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const { authMiddleware, isJwtSecretConfigured } = require('./middleware/auth');
const { logApiCall, isServerless } = require('./db');

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

// The storefront and API share one origin (Vercel rewrites and the Vite dev proxy).
// Do not enable wildcard cross-origin access for account or checkout endpoints.
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use(express.json({ limit: '64kb', strict: true }));
app.use(authMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  logApiCall('GET', '/api/health', 200, 'Server healthy');
  res.json({
    status: 'online',
    platform: 'NEXORA.in Full-Stack Engine',
    database: 'SQLite (Node.js native DatabaseSync)',
    persistence: isServerless ? 'Temporary serverless SQLite; customer data cannot be stored safely.' : 'Local SQLite file storage',
    commerceReady: !isServerless && isJwtSecretConfigured,
    capabilities: { catalogue: 'available', accounts: !isServerless && Boolean(JWT_SECRET) ? 'available' : 'disabled', orders: !isServerless && Boolean(JWT_SECRET) ? 'available' : 'disabled' },
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
  res.status(500).json({ error: 'Internal server error. Please try again later.' });
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
