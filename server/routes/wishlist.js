const express = require('express');
const { db, logApiCall } = require('../db');

const router = express.Router();

// GET user wishlist
router.get('/', (req, res) => {
  const email = (req.query.email && req.query.email.toLowerCase().trim()) || 'alex@nexora.in';

  const rows = db.prepare(`
    SELECT p.* FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE LOWER(w.user_email) = ?
    ORDER BY w.id DESC
  `).all(email);

  const productIds = rows.map(r => r.id);
  logApiCall('GET', '/api/wishlist', 200, `${productIds.length} items for ${email}`);

  res.json({
    email,
    count: productIds.length,
    productIds,
    items: rows.map(p => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      rating: p.rating,
      image: p.image
    }))
  });
});

// POST toggle wishlist item
router.post('/toggle', (req, res) => {
  const { email, productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  const userEmail = (email && email.toLowerCase().trim()) || 'alex@nexora.in';
  const prodId = Number(productId);

  const existing = db.prepare('SELECT id FROM wishlist WHERE LOWER(user_email) = ? AND product_id = ?').get(userEmail, prodId);

  let wished = false;
  if (existing) {
    db.prepare('DELETE FROM wishlist WHERE id = ?').run(existing.id);
    wished = false;
  } else {
    db.prepare('INSERT INTO wishlist (user_email, product_id) VALUES (?, ?)').run(userEmail, prodId);
    wished = true;
  }

  const allWished = db.prepare('SELECT product_id FROM wishlist WHERE LOWER(user_email) = ?').all(userEmail);
  const productIds = allWished.map(r => r.product_id);

  logApiCall('POST', '/api/wishlist/toggle', 200, `Product ${prodId} ${wished ? 'added' : 'removed'}`);
  res.json({ wished, productIds });
});

module.exports = router;
