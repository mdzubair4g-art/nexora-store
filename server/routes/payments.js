const express = require('express');
const { logApiCall } = require('../db');

const router = express.Router();

// Online payment providers are unavailable until a real gateway account,
// server-side signature verification, and webhook handling are configured.
router.get('/methods', (req, res) => {
  res.json({
    currency: 'INR',
    methods: [
      {
        id: 'cod',
        name: 'Cash on Delivery (COD)',
        providers: ['Cash at delivery'],
        instant: false,
        fee: 0,
        available: true
      }
    ],
    onlinePaymentsAvailable: false,
    message: 'Online payments will be enabled after a verified payment gateway is configured.'
  });
});

router.post('/create-order', (req, res) => {
  logApiCall('POST', '/api/payments/create-order', 503, 'Online gateway not configured');
  res.status(503).json({
    error: 'Online payments are not enabled. Please choose Cash on Delivery.'
  });
});

router.post('/verify', (req, res) => {
  logApiCall('POST', '/api/payments/verify', 503, 'Online gateway not configured');
  res.status(503).json({
    verified: false,
    error: 'Payment verification is unavailable because no real payment gateway is configured.'
  });
});

module.exports = router;
