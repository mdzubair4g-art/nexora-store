const express = require('express');
const { db, logApiCall } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET database statistics and live traffic logs
router.get('/', requireAuth, requireRole('admin'), (req, res) => {
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const reviewCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get().count;

  const logs = db.prepare('SELECT * FROM api_logs ORDER BY id DESC LIMIT 25').all();

  res.json({
    counts: {
      products: prodCount,
      users: userCount,
      orders: orderCount,
      reviews: reviewCount
    },
    logs: logs.map(l => ({
      id: l.id,
      method: l.method,
      endpoint: l.endpoint,
      statusCode: l.status_code,
      details: l.details,
      timestamp: new Date(l.created_at).toLocaleTimeString()
    }))
  });
});

module.exports = router;
