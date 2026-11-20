const express = require('express');
const crypto = require('node:crypto');
const { logApiCall } = require('../db');

const router = express.Router();

// Supported payment options
router.get('/methods', (req, res) => {
  res.json({
    currency: 'INR',
    methods: [
      {
        id: 'upi',
        name: 'Instant UPI',
        providers: ['Google Pay', 'PhonePe', 'Paytm', 'CRED UPI'],
        instant: true,
        fee: 0
      },
      {
        id: 'card',
        name: 'Credit / Debit Card',
        providers: ['Visa', 'Mastercard', 'RuPay', 'Amex'],
        instant: true,
        fee: 0
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        providers: ['HDFC', 'ICICI', 'SBI', 'Axis Bank', 'Kotak'],
        instant: true,
        fee: 0
      },
      {
        id: 'cod',
        name: 'Cash on Delivery (COD)',
        providers: ['Cash / Pay on Delivery via UPI QR to Delivery Agent'],
        instant: false,
        fee: 0
      }
    ]
  });
});

// Create Gateway Order (Razorpay / Gateway specification)
router.post('/create-order', (req, res) => {
  const { amount, currency = 'INR', receipt, notes } = req.body;

  if (!amount || Number(amount) <= 0) {
    logApiCall('POST', '/api/payments/create-order', 400, 'Invalid amount');
    return res.status(400).json({ error: 'Valid amount is required.' });
  }

  const amountInPaise = Math.round(Number(amount) * 100);
  const gatewayOrderId = 'order_nx_' + crypto.randomBytes(8).toString('hex');

  logApiCall('POST', '/api/payments/create-order', 200, `${gatewayOrderId} (₹${amount})`);
  res.json({
    id: gatewayOrderId,
    entity: 'order',
    amount: amountInPaise,
    amount_due: amountInPaise,
    currency: currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    status: 'created',
    attempts: 0,
    notes: notes || { store: 'NEXORA.in' },
    created_at: Math.floor(Date.now() / 1000)
  });
});

// Verify Payment
router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, method } = req.body;

  const paymentId = razorpay_payment_id || 'pay_' + crypto.randomBytes(8).toString('hex');
  const orderId = razorpay_order_id || 'order_nx_mock';

  // In production with real Razorpay credentials:
  // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  //   .update(orderId + '|' + paymentId)
  //   .digest('hex');
  // const isAuthentic = expectedSignature === razorpay_signature;

  const isAuthentic = true; // sandbox simulation

  logApiCall('POST', '/api/payments/verify', 200, `Verified: ${paymentId}`);
  res.json({
    verified: isAuthentic,
    paymentId,
    orderId,
    method: method || 'UPI',
    timestamp: new Date().toISOString(),
    status: 'captured'
  });
});

module.exports = router;
