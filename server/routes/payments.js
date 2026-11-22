const express = require('express');
const crypto = require('node:crypto');
const { logApiCall } = require('../db');

const router = express.Router();

// These endpoints intentionally simulate a payment flow for the portfolio demo.
// No real payment provider is configured and no money is charged.
router.get('/methods', (req, res) => {
  res.json({
    mode: 'demo',
    currency: 'INR',
    methods: [
      { id: 'upi', name: 'UPI (demo)', providers: ['Google Pay', 'PhonePe', 'Paytm'], instant: true, fee: 0 },
      { id: 'card', name: 'Card (demo)', providers: ['Visa', 'Mastercard', 'RuPay'], instant: true, fee: 0 },
      { id: 'cod', name: 'Cash on Delivery', providers: ['Pay on delivery'], instant: false, fee: 0 }
    ]
  });
});

router.post('/create-order', (req, res) => {
  const amount = Number(req.body?.amount);
  const currency = req.body?.currency || 'INR';

  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
    logApiCall('POST', '/api/payments/create-order', 400, 'Invalid demo amount');
    return res.status(400).json({ error: 'Enter a valid order amount.' });
  }

  if (currency !== 'INR') {
    return res.status(400).json({ error: 'The demo checkout supports INR only.' });
  }

  const amountInPaise = Math.round(amount * 100);
  const demoOrderId = 'demo_order_' + crypto.randomBytes(8).toString('hex');

  logApiCall('POST', '/api/payments/create-order', 200, 'Demo payment order created');
  return res.json({
    id: demoOrderId,
    entity: 'demo_order',
    amount: amountInPaise,
    amount_due: amountInPaise,
    currency,
    receipt: String(req.body?.receipt || ('demo_rcpt_' + Date.now())).slice(0, 40),
    status: 'created',
    mode: 'demo',
    note: 'This is a simulated payment order. No money is charged.',
    created_at: Math.floor(Date.now() / 1000)
  });
});

router.post('/verify', (req, res) => {
  const { razorpay_order_id, method } = req.body || {};

  if (typeof razorpay_order_id !== 'string' || !razorpay_order_id.startsWith('demo_order_')) {
    return res.status(400).json({ error: 'A valid demo payment order is required.' });
  }

  const paymentId = 'demo_pay_' + crypto.randomBytes(8).toString('hex');

  logApiCall('POST', '/api/payments/verify', 200, 'Demo payment simulated');
  return res.json({
    verified: true,
    mode: 'demo',
    paymentId,
    orderId: razorpay_order_id,
    method: method || 'upi',
    timestamp: new Date().toISOString(),
    status: 'simulated',
    note: 'Demo only. This response is not proof of a real payment.'
  });
});

module.exports = router;
