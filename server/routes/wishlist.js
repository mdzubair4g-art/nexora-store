const express = require('express');
const { db, logApiCall } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function currentEmail(req) {
  return req.user.email.toLowerCase();
}

router.get('/', requireAuth, (req, res) => {
  const email = currentEmail(req);
  const rows = db.prepare(
    "SELECT p.* FROM wishlist w JOIN products p ON w.product_id = p.id WHERE LOWER(w.user_email) = ? ORDER BY w.id DESC"
  ).all(email);

  const productIds = rows.map(row => row.id);
  logApiCall('GET', '/api/wishlist', 200, productIds.length + ' items for authenticated account');

  res.json({
    count: productIds.length,
    productIds,
    items: rows.map(product => ({
      id: product.id,
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      mrp: product.mrp,
      rating: product.rating,
      image: product.image
    }))
  });
});

router.post('/toggle', requireAuth, (req, res) => {
  const productId = Number(req.body && req.body.productId);
  if (!Number.isInteger(productId) || productId < 1) {
    return res.status(400).json({ error: 'A valid productId is required.' });
  }

  const email = currentEmail(req);
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const existing = db.prepare('SELECT id FROM wishlist WHERE LOWER(user_email) = ? AND product_id = ?').get(email, productId);
  let wished = false;
  if (existing) {
    db.prepare('DELETE FROM wishlist WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO wishlist (user_email, product_id) VALUES (?, ?)').run(email, productId);
    wished = true;
  }

  const allWished = db.prepare('SELECT product_id FROM wishlist WHERE LOWER(user_email) = ?').all(email);
  const productIds = allWished.map(row => row.product_id);

  logApiCall('POST', '/api/wishlist/toggle', 200, 'Wishlist updated for authenticated account');
  res.json({ wished, productIds });
});

module.exports = router;
