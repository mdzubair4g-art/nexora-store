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

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'no-store');
  next();
});

// Enable CORS for frontend development
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5000').split(',').map(origin => origin.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error('Origin is not allowed by CORS');
    error.status = 403;
    return callback(error);
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '64kb', strict: true }));
app.use(authMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  logApiCall('GET', '/api/health', 200, 'Server healthy');
  res.json({
    status: 'online',
    platform: 'NEXORA.in Full-Stack Engine',
    database: 'SQLite (Node.js native DatabaseSync)',
    persistence: process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      ? 'Temporary serverless storage; records may be lost after a cold start.'
      : 'Local SQLite file on the host disk.',
    checkoutMode: 'Portfolio simulation only; no real payment or courier is connected.',
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
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status >= 500) console.error('Server error:', err);
  const message = status === 413
    ? 'Request body is too large.'
    : status === 403
      ? 'This request origin is not allowed.'
      : status === 400
        ? 'The request body is invalid.'
        : 'Internal server error. Please try again later.';
  res.status(status).json({ error: message });
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
