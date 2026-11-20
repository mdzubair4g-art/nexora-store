const express = require('express');
const { db, logApiCall } = require('../db');

const router = express.Router();

// Helper to format order row
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

// POST create new order
router.post('/', (req, res) => {
  const {
    userEmail,
    items,
    subtotal,
    discount,
    totalAmount,
    paymentMethod,
    paymentStatus,
    paymentId,
    shippingAddress,
    city,
    state,
    pincode
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    logApiCall('POST', '/api/orders', 400, 'Empty items array');
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  const orderId = 'NX-' + Math.floor(100000 + Math.random() * 900000);
  const email = (userEmail && userEmail.trim().toLowerCase()) || 'guest@nexora.in';
  const finalSubtotal = Number(subtotal) || items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const finalDiscount = Number(discount) || 0;
  const finalPayable = Number(totalAmount) || Math.max(0, finalSubtotal - finalDiscount);

  const stmt = db.prepare(`
    INSERT INTO orders (
      order_id, user_email, items_json, subtotal, discount,
      total_amount, payment_method, payment_status, payment_id,
      shipping_address, city, state, pincode, status, tracking_stage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Packed')
  `);

  const info = stmt.run(
    orderId,
    email,
    JSON.stringify(items),
    finalSubtotal,
    finalDiscount,
    finalPayable,
    paymentMethod || 'UPI (GPay / PhonePe / Paytm)',
    paymentStatus || 'COMPLETED',
    paymentId || `TXN_${Date.now()}`,
    shippingAddress || 'Customer Address',
    city || '',
    state || '',
    pincode || ''
  );

  const orderRecord = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid);
  logApiCall('POST', '/api/orders', 201, `Order: ${orderId} by ${email}`);

  res.status(201).json(formatOrder(orderRecord));
});

// GET orders (optionally filter by email or query param)
router.get('/', (req, res) => {
  const { email } = req.query;

  let query = 'SELECT * FROM orders';
  const params = [];

  if (email && email.trim()) {
    query += ' WHERE LOWER(user_email) = ?';
    params.push(email.trim().toLowerCase());
  }

  query += ' ORDER BY id DESC';

  const rows = db.prepare(query).all(...params);
  const orders = rows.map(formatOrder);

  logApiCall('GET', '/api/orders', 200, `${orders.length} orders found`);
  res.json({ count: orders.length, orders });
});

// GET order by orderId
router.get('/:orderId', (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(req.params.orderId);
  if (!row) {
    logApiCall('GET', `/api/orders/${req.params.orderId}`, 404, 'Order not found');
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(formatOrder(row));
});

module.exports = router;
