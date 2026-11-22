const express = require('express');
const { db, logApiCall } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Helper to format product row
function formatProduct(p) {
  return {
    id: p.id,
    title: p.title,
    brand: p.brand,
    category: p.category,
    collection: p.collection,
    price: p.price,
    mrp: p.mrp,
    rating: p.rating,
    reviewsCount: p.reviews_count,
    flashDeal: Boolean(p.flash_deal),
    variants: JSON.parse(p.variants_json || '["Standard"]'),
    image: p.image,
    highlights: JSON.parse(p.highlights_json || '[]'),
    stock: p.stock
  };
}

// GET all products with filtering, searching, and sorting
router.get('/', (req, res) => {
  const { category, collection, flashOnly, search, priceRange, sort } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (collection) {
    query += ' AND collection = ?';
    params.push(collection);
  }

  if (flashOnly === 'true' || flashOnly === '1') {
    query += ' AND flash_deal = 1';
  }

  if (search && search.trim()) {
    query += ' AND (LOWER(title) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ?)';
    const term = `%${search.trim().toLowerCase()}%`;
    params.push(term, term, term);
  }

  if (priceRange === 'under2000') {
    query += ' AND price < 2000';
  } else if (priceRange === '2000to10000') {
    query += ' AND price >= 2000 AND price <= 10000';
  } else if (priceRange === 'above10000') {
    query += ' AND price > 10000';
  }

  if (sort === 'low') {
    query += ' ORDER BY price ASC';
  } else if (sort === 'high') {
    query += ' ORDER BY price DESC';
  } else if (sort === 'rating') {
    query += ' ORDER BY rating DESC, reviews_count DESC';
  } else {
    query += ' ORDER BY id ASC';
  }

  const rows = db.prepare(query).all(...params);
  const products = rows.map(formatProduct);

  logApiCall('GET', '/api/products', 200, `${products.length} products returned`);
  res.json({ count: products.length, products });
});

// GET single product by ID with reviews
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

  if (!p) {
    logApiCall('GET', `/api/products/${id}`, 404, 'Product not found');
    return res.status(404).json({ error: 'Product not found' });
  }

  const reviews = db.prepare('SELECT id, user_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY id DESC').all(id);

  const product = formatProduct(p);
  product.reviews = reviews.map(r => ({
    id: r.id,
    user: r.user_name,
    rating: r.rating,
    comment: r.comment,
    date: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }));

  logApiCall('GET', `/api/products/${id}`, 200, product.title.slice(0, 25));
  res.json(product);
});

// POST new product (Seller Studio)
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { title, brand, category, collection, price, mrp, image, highlights, variants } = req.body;

  if (!title || !price || !category) {
    logApiCall('POST', '/api/products', 400, 'Missing required fields');
    return res.status(400).json({ error: 'Title, category, and price are required' });
  }

  const offerPrice = Number(price);
  const maxPrice = mrp ? Number(mrp) : offerPrice + Math.round(offerPrice * 0.25);
  const brandName = brand ? brand.trim() : 'NEXORA Studio';
  const defaultImg = image && image.trim() ? image.trim() : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
  const highlightList = Array.isArray(highlights) ? highlights : (highlights ? [highlights] : ['Verified Marketplace Listing']);
  const variantList = Array.isArray(variants) && variants.length > 0 ? variants : ['Standard Edition'];

  const stmt = db.prepare(`
    INSERT INTO products (
      title, brand, category, collection, price, mrp,
      rating, reviews_count, flash_deal, variants_json, image, highlights_json, stock
    ) VALUES (?, ?, ?, ?, ?, ?, 4.9, 1, 1, ?, ?, ?, 25)
  `);

  const info = stmt.run(
    title.trim(),
    brandName,
    category,
    collection || 'Work From Home Setup',
    offerPrice,
    maxPrice,
    JSON.stringify(variantList),
    defaultImg,
    JSON.stringify(highlightList)
  );

  const newId = Number(info.lastInsertRowid);
  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(newId);

  logApiCall('POST', '/api/products', 201, `Published: ${title.slice(0, 25)}`);
  res.status(201).json(formatProduct(created));
});

// POST user review for a product
router.post('/:id/reviews', requireAuth, (req, res) => {
  const productId = Number(req.params.id);
  const { rating, comment } = req.body;

  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || typeof comment !== 'string' || !comment.trim() || comment.length > 1000) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  const prod = db.prepare('SELECT id, rating, reviews_count FROM products WHERE id = ?').get(productId);
  if (!prod) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const userName = String(req.user.name || 'Verified Buyer').slice(0, 80);
  const numRating = Number(rating);

  const insertStmt = db.prepare(`
    INSERT INTO reviews (product_id, user_name, rating, comment)
    VALUES (?, ?, ?, ?)
  `);
  insertStmt.run(productId, userName, numRating, comment.trim());

  // Update product aggregated rating and review count
  const newCount = prod.reviews_count + 1;
  const newRating = Number(((prod.rating * prod.reviews_count + numRating) / newCount).toFixed(1));

  db.prepare(`
    UPDATE products SET reviews_count = ?, rating = ? WHERE id = ?
  `).run(newCount, newRating, productId);

  logApiCall('POST', `/api/products/${productId}/reviews`, 201, `Review by ${userName}`);
  res.status(201).json({ message: 'Review added successfully', rating: newRating, reviewsCount: newCount });
});

module.exports = router;
