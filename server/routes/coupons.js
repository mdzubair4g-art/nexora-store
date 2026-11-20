const express = require('express');
const { db, logApiCall } = require('../db');

const router = express.Router();

// Validate and apply coupon
router.post('/apply', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required' });
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(cleanCode);

  if (!coupon) {
    logApiCall('POST', '/api/coupons/apply', 404, `Invalid code: ${cleanCode}`);
    return res.status(404).json({ error: `Code ${cleanCode} is invalid or has expired.` });
  }

  const orderSubtotal = Number(subtotal) || 0;
  if (orderSubtotal < coupon.min_order) {
    logApiCall('POST', '/api/coupons/apply', 400, `Min order ₹${coupon.min_order} required`);
    return res.status(400).json({
      error: `Coupon ${cleanCode} requires a minimum order of ₹${coupon.min_order.toLocaleString('en-IN')}.`
    });
  }

  let discount = Math.round((orderSubtotal * coupon.discount_percent) / 100);
  if (coupon.max_discount && discount > coupon.max_discount) {
    discount = coupon.max_discount;
  }

  logApiCall('POST', '/api/coupons/apply', 200, `Applied: ${cleanCode} (-₹${discount})`);
  res.json({
    valid: true,
    code: coupon.code,
    discountPercent: coupon.discount_percent,
    discountAmount: discount,
    message: `Applied ${coupon.code}! You save ₹${discount.toLocaleString('en-IN')}.`
  });
});

module.exports = router;
