const express = require('express');
const { db, logApiCall } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const email = String(req.user.email || '').toLowerCase();
  const rows = db.prepare(`
    SELECT p.* FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE LOWER(w.user_email) = ?
    ORDER BY w.id DESC
  `).all(email);

  const productIds = rows.map(row => row.id);
  logApiCall('GET', '/api/wishlist', 200, productIds.length + ' items for signed-in user');
  return res.json({
    count: productIds.length,
    productIds,
    items: rows.map(p => ({
      id: p.id, title: p.title, brand: p.brand, category: p.category,
      price: p.price, mrp: p.mrp, rating: p.rating, image: p.image
    }))
  });
});

router.post('/toggle', requireAuth, (req, res) => {
  const productId = Number(req.body?.productId);
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: 'A valid productId is required.' });
  }

  const email = String(req.user.email || '').toLowerCase();
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const existing = db.prepare(
    'SELECT id FROM wishlist WHERE LOWER(user_email) = ? AND product_id = ?'
  ).get(email, productId);

  const wished = !existing;
  if (existing) {
    db.prepare('DELETE FROM wishlist WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO wishlist (user_email, product_id) VALUES (?, ?)').run(email, productId);
  }

  const productIds = db.prepare(
    'SELECT product_id FROM wishlist WHERE LOWER(user_email) = ?'
  ).all(email).map(row => row.product_id);

  logApiCall('POST', '/api/wishlist/toggle', 200, 'Wishlist updated for signed-in user');
  return res.json({ wished, productIds });
});

module.exports = router;
