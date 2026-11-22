const express = require('express');
const crypto = require('node:crypto');
const { db, logApiCall } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function formatOrder(o) {
  return {
    id: o.id,
    orderId: o.order_id,
    userEmail: o.user_email,
    items: JSON.parse(o.items_json || '[]'),
    subtotal: o.subtotal,
    discount: o.discount,
    totalAmount: o.total_amount,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    paymentId: o.payment_id,
    shippingAddress: o.shipping_address,
    city: o.city,
    state: o.state,
    pincode: o.pincode,
    status: o.status,
    trackingStage: o.tracking_stage,
    date: new Date(o.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  };
}

// Create an order. Prices, stock, and coupon discounts are recalculated on the server.
router.post('/', (req, res, next) => {
  const {
    userEmail,
    items,
    couponCode,
    paymentMethod,
    paymentId,
    shippingAddress,
    city,
    state,
    pincode
  } = req.body || {};

  if (!Array.isArray(items) || items.length === 0 || items.length > 25) {
    return res.status(400).json({ error: 'Add between 1 and 25 items to your order.' });
  }

  const email = req.user?.email || (typeof userEmail === 'string' ? userEmail.trim().toLowerCase() : '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid contact email is required.' });
  }

  const methods = {
    upi: 'Instant UPI (demo)',
    card: 'Credit / Debit Card (demo)',
    cod: 'Cash on Delivery (COD)'
  };
  if (!methods[paymentMethod]) {
    return res.status(400).json({ error: 'Choose a supported payment method.' });
  }

  if (typeof shippingAddress !== 'string' || !shippingAddress.trim() || shippingAddress.length > 500) {
    return res.status(400).json({ error: 'Enter a valid delivery address.' });
  }
  if (!/^\d{6}$/.test(String(pincode || ''))) {
    return res.status(400).json({ error: 'Enter a valid 6-digit PIN code.' });
  }

  let transactionOpen = false;

  try {
    db.exec('BEGIN IMMEDIATE');
    transactionOpen = true;

    const normalizedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const productId = Number(item?.id);
      const qty = Number(item?.qty);

      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(qty) || qty <= 0 || qty > 25) {
        const error = new Error('One of the cart items has an invalid product or quantity.');
        error.status = 400;
        throw error;
      }

      const product = db.prepare(
        'SELECT id, title, brand, price, mrp, image, variants_json, stock FROM products WHERE id = ?'
      ).get(productId);

      if (!product) {
        const error = new Error('A product in your cart is no longer available.');
        error.status = 404;
        throw error;
      }

      if (Number(product.stock) < qty) {
        const error = new Error('Not enough stock is available for ' + product.title + '.');
        error.status = 409;
        throw error;
      }

      let variants = ['Standard'];
      try {
        variants = JSON.parse(product.variants_json || '["Standard"]');
      } catch (err) {
        variants = ['Standard'];
      }

      const requestedVariant = typeof item.variant === 'string' ? item.variant : '';
      const variant = variants.includes(requestedVariant) ? requestedVariant : (variants[0] || 'Standard');
      subtotal += Number(product.price) * qty;

      normalizedItems.push({
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: Number(product.price),
        mrp: Number(product.mrp),
        image: product.image,
        variant,
        qty
      });
    }

    let discount = 0;
    const cleanCouponCode = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : '';
    if (cleanCouponCode) {
      const coupon = db.prepare(
        'SELECT * FROM coupons WHERE code = ? AND active = 1'
      ).get(cleanCouponCode);

      if (!coupon) {
        const error = new Error('The selected coupon is invalid or inactive.');
        error.status = 400;
        throw error;
      }
      if (subtotal < Number(coupon.min_order || 0)) {
        const error = new Error('This coupon does not meet the minimum order amount.');
        error.status = 400;
        throw error;
      }

      discount = Math.round((subtotal * Number(coupon.discount_percent)) / 100);
      if (coupon.max_discount && discount > Number(coupon.max_discount)) {
        discount = Number(coupon.max_discount);
      }
    }

    const totalAmount = Math.max(0, subtotal - discount);
    const orderId = 'NX-' + crypto.randomInt(100000, 1000000);
    const paymentStatus = paymentMethod === 'cod' ? 'PENDING_ON_DELIVERY' : 'DEMO_SIMULATED';
    const safePaymentId = paymentMethod === 'cod' || typeof paymentId !== 'string'
      ? null
      : paymentId.slice(0, 100);

    const insert = db.prepare(
      "INSERT INTO orders (order_id, user_email, items_json, subtotal, discount, total_amount, payment_method, payment_status, payment_id, shipping_address, city, state, pincode, status, tracking_stage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Packed')"
    );

    const result = insert.run(
      orderId,
      email,
      JSON.stringify(normalizedItems),
      subtotal,
      discount,
      totalAmount,
      methods[paymentMethod],
      paymentStatus,
      safePaymentId,
      shippingAddress.trim(),
      String(city || '').slice(0, 100),
      String(state || '').slice(0, 100),
      String(pincode)
    );

    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
    for (const item of normalizedItems) {
      const update = updateStock.run(item.qty, item.id, item.qty);
      if (Number(update.changes) !== 1) {
        const error = new Error('Stock changed while the order was being placed. Please review your cart.');
        error.status = 409;
        throw error;
      }
    }

    db.exec('COMMIT');
    transactionOpen = false;

    const orderRecord = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
    logApiCall('POST', '/api/orders', 201, 'Order ' + orderId + ' created');
    return res.status(201).json(formatOrder(orderRecord));
  } catch (err) {
    if (transactionOpen) {
      try { db.exec('ROLLBACK'); } catch (rollbackError) { /* preserve the original error */ }
    }
    if (err.status) {
      logApiCall('POST', '/api/orders', err.status, err.message);
      return res.status(err.status).json({ error: err.message });
    }
    return next(err);
  }
});

// Customers can only read their own order history.
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM orders WHERE LOWER(user_email) = ? ORDER BY id DESC'
  ).all(String(req.user.email || '').toLowerCase());

  const orders = rows.map(formatOrder);
  logApiCall('GET', '/api/orders', 200, orders.length + ' customer orders');
  return res.json({ count: orders.length, orders });
});

// An order reference alone is not sufficient to access another customer's address or items.
router.get('/:orderId', requireAuth, (req, res) => {
  const row = db.prepare(
    'SELECT * FROM orders WHERE order_id = ? AND LOWER(user_email) = ?'
  ).get(req.params.orderId, String(req.user.email || '').toLowerCase());

  if (!row) {
    logApiCall('GET', '/api/orders/' + req.params.orderId, 404, 'Order not found for current user');
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.json(formatOrder(row));
});

module.exports = router;
