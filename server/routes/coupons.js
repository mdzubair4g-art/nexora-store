const express = require('express');
const { db, logApiCall } = require('../db');

const router = express.Router();

// Validate a coupon for display. The order endpoint recalculates it independently.
router.post('/apply', (req, res) => {
  const { code, subtotal } = req.body || {};

  if (typeof code !== 'string' || !code.trim() || code.trim().length > 40) {
    return res.status(400).json({ error: 'Enter a valid coupon code.' });
  }

  const orderSubtotal = Number(subtotal);
  if (!Number.isSafeInteger(orderSubtotal) || orderSubtotal < 0 || orderSubtotal > 100000000) {
    return res.status(400).json({ error: 'Your basket total is invalid. Refresh the basket and try again.' });
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(cleanCode);

  if (!coupon) {
    logApiCall('POST', '/api/coupons/apply', 404, 'Invalid coupon code');
    return res.status(404).json({ error: 'This coupon is invalid or has expired.' });
  }

  if (orderSubtotal < Number(coupon.min_order || 0)) {
    logApiCall('POST', '/api/coupons/apply', 400, 'Coupon minimum not met');
    return res.status(400).json({
      error: `Coupon ${cleanCode} requires a minimum order of ₹${Number(coupon.min_order).toLocaleString('en-IN')}.`
    });
  }

  let discount = Math.round((orderSubtotal * Number(coupon.discount_percent)) / 100);
  if (coupon.max_discount && discount > Number(coupon.max_discount)) {
    discount = Number(coupon.max_discount);
  }

  logApiCall('POST', '/api/coupons/apply', 200, `Applied: ${cleanCode}`);
  return res.json({
    valid: true,
    code: coupon.code,
    discountPercent: coupon.discount_percent,
    discountAmount: discount,
    message: `Applied ${coupon.code}! You save ₹${discount.toLocaleString('en-IN')}.`
  });
});
module.exports = router;
