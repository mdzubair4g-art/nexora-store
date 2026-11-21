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
    date: new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  };
}

// Create an authenticated Cash on Delivery order.
// Product prices and coupon discounts are recalculated on the server.
router.post('/', requireAuth, (req, res) => {
  const {
    items, couponCode, recipientName, recipientPhone,
    addressLine, city, state, pincode
  } = req.body || {};

  if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
    return res.status(400).json({ error: 'Add between 1 and 30 valid items to your order.' });
  }

  const cleanIdempotencyKey = String(req.body.idempotencyKey || '').trim();
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(cleanIdempotencyKey)) {
    return res.status(400).json({ error: 'A valid order request key is required. Please retry checkout.' });
  }

  const priorOrder = db.prepare(
    'SELECT * FROM orders WHERE user_id = ? AND idempotency_key = ?'
  ).get(Number(req.user.id), cleanIdempotencyKey);
  if (priorOrder) {
    return res.status(200).json(formatOrder(priorOrder));
  }

  const cleanRecipientName = typeof recipientName === 'string' ? recipientName.trim() : '';
  if (!cleanRecipientName || cleanRecipientName.length > 80) {
    return res.status(400).json({ error: 'Enter a valid recipient name (up to 80 characters).' });
  }

  const cleanPhone = String(recipientPhone || '').trim();
  if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number.' });
  }

  const cleanAddressLine = typeof addressLine === 'string' ? addressLine.trim() : '';
  if (cleanAddressLine.length < 5 || cleanAddressLine.length > 350) {
    return res.status(400).json({ error: 'Enter a delivery address between 5 and 350 characters.' });
  }

  const cleanPincode = String(pincode || '').trim();
  if (!/^[0-9]{6}$/.test(cleanPincode)) {
    return res.status(400).json({ error: 'Enter a valid 6-digit Indian PIN code.' });
  }

  const cleanCity = typeof city === 'string' ? city.trim().slice(0, 100) : '';
  const cleanState = typeof state === 'string' ? state.trim().slice(0, 100) : '';
  if (!cleanCity || !cleanState) {
    return res.status(400).json({ error: 'Verify your PIN code before placing the order.' });
  }

  const shippingAddress = `${cleanRecipientName} (${cleanPhone}), ${cleanAddressLine}, ${cleanCity}, ${cleanState} - ${cleanPincode}`;
  if (shippingAddress.length > 500) {
    return res.status(400).json({ error: 'Delivery address is too long.' });
  }

  const trustedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const productId = Number(item && item.id);
    const quantity = Number(item && item.qty);

    if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return res.status(400).json({ error: 'One or more cart items are invalid.' });
    }

    const product = db.prepare('SELECT id, title, brand, price, image, stock, variants_json FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(400).json({ error: 'A product in your cart is no longer available. Refresh your cart.' });
    }
    if (Number(product.stock) < quantity) {
      return res.status(409).json({ error: product.title + ' does not have enough stock for this quantity.' });
    }

    let variants = ['Standard'];
    try {
      variants = JSON.parse(product.variants_json || '["Standard"]');
    } catch (err) {
      variants = ['Standard'];
    }

    const requestedVariant = String((item && item.variant) || (variants[0] || 'Standard'));
    if (Array.isArray(variants) && !variants.includes(requestedVariant)) {
      return res.status(400).json({ error: 'The selected variant for ' + product.title + ' is unavailable.' });
    }

    const unitPrice = Number(product.price);
    subtotal += unitPrice * quantity;
    trustedItems.push({
      id: product.id,
      title: product.title,
      brand: product.brand,
      price: unitPrice,
      image: product.image,
      variant: requestedVariant,
      qty: quantity
    });
  }

  let discount = 0;
  const cleanCoupon = String(couponCode || '').trim().toUpperCase();
  if (cleanCoupon) {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(cleanCoupon);
    if (!coupon) {
      return res.status(400).json({ error: 'The coupon is invalid or has expired.' });
    }
    if (subtotal < Number(coupon.min_order || 0)) {
      return res.status(400).json({ error: 'This coupon requires a minimum order of ₹' + Number(coupon.min_order).toLocaleString('en-IN') + '.' });
    }
    discount = Math.round((subtotal * Number(coupon.discount_percent)) / 100);
    if (coupon.max_discount && discount > Number(coupon.max_discount)) {
      discount = Number(coupon.max_discount);
    }
  }

  const total = Math.max(0, subtotal - discount);
  const orderId = 'NX-' + crypto.randomBytes(8).toString('hex').toUpperCase();
  const email = req.user.email.toLowerCase();

  const stmt = db.prepare(
    "INSERT INTO orders (order_id, user_id, idempotency_key, user_email, items_json, subtotal, discount, total_amount, payment_method, payment_status, payment_id, shipping_address, city, state, pincode, status, tracking_stage) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Cash on Delivery (COD)', 'PENDING_ON_DELIVERY', NULL, ?, ?, ?, ?, 'Confirmed', 'Confirmed')"
  );

  let info;
  db.exec('BEGIN IMMEDIATE');
  try {
    // Decrement stock inside the same transaction as order creation.
    for (const item of trustedItems) {
      const stockUpdate = db.prepare(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?'
      ).run(item.qty, item.id, item.qty);

      if (stockUpdate.changes !== 1) {
        const stockError = new Error('A product in your cart no longer has enough stock.');
        stockError.code = 'INSUFFICIENT_STOCK';
        throw stockError;
      }
    }

    info = stmt.run(
      orderId,
      Number(req.user.id),
      cleanIdempotencyKey,
      email,
      JSON.stringify(trustedItems),
      subtotal,
      discount,
      total,
      shippingAddress.trim(),
      cleanCity,
      cleanState,
      cleanPincode
    );
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    if (err.code === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({ error: err.message + ' Please refresh your cart.' });
    }
    if (String(err.message || '').includes('orders.user_id, orders.idempotency_key')) {
      const existingOrder = db.prepare(
        'SELECT * FROM orders WHERE user_id = ? AND idempotency_key = ?'
      ).get(Number(req.user.id), cleanIdempotencyKey);
      if (existingOrder) return res.status(200).json(formatOrder(existingOrder));
    }
    throw err;
  }

  const orderRecord = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid);
  logApiCall('POST', '/api/orders', 201, 'COD order ' + orderId + ' by ' + email);
  res.status(201).json(formatOrder(orderRecord));
});

// Customers can only see their own order history. Admins can inspect all orders.
router.get('/', requireAuth, (req, res) => {
  let rows;
  if (req.user.role === 'admin') {
    rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  } else {
    rows = db.prepare('SELECT * FROM orders WHERE user_id = ? OR LOWER(user_email) = ? ORDER BY id DESC')
      .all(Number(req.user.id), req.user.email.toLowerCase());
  }

  const orders = rows.map(formatOrder);
  logApiCall('GET', '/api/orders', 200, orders.length + ' orders for authenticated account');
  res.json({ count: orders.length, orders });
});

// Order references are not public lookup keys; ownership is always checked.
router.get('/:orderId', requireAuth, (req, res) => {
  let row;
  if (req.user.role === 'admin') {
    row = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(req.params.orderId);
  } else {
    row = db.prepare('SELECT * FROM orders WHERE order_id = ? AND (user_id = ? OR LOWER(user_email) = ?)')
      .get(req.params.orderId, Number(req.user.id), req.user.email.toLowerCase());
  }

  if (!row) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json(formatOrder(row));
});

module.exports = router;
