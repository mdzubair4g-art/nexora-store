const express = require('express');
const { logApiCall } = require('../db');

const router = express.Router();

// Fallback directory of major Indian postal hubs & pin codes
const PINCODE_DIRECTORY = {
  '560001': { city: 'Bengaluru', district: 'Bangalore Urban', state: 'Karnataka', days: 1, hub: 'South Hub BLR-1' },
  '560100': { city: 'Bengaluru (Electronic City)', district: 'Bangalore Urban', state: 'Karnataka', days: 1, hub: 'South Hub BLR-2' },
  '110001': { city: 'New Delhi (Connaught Place)', district: 'Central Delhi', state: 'Delhi', days: 2, hub: 'North Hub DEL-1' },
  '110020': { city: 'New Delhi (Okhla)', district: 'South Delhi', state: 'Delhi', days: 2, hub: 'North Hub DEL-2' },
  '400001': { city: 'Mumbai (Fort)', district: 'Mumbai City', state: 'Maharashtra', days: 1, hub: 'West Hub BOM-1' },
  '400050': { city: 'Mumbai (Bandra)', district: 'Mumbai Suburban', state: 'Maharashtra', days: 1, hub: 'West Hub BOM-2' },
  '500001': { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', days: 2, hub: 'Deccan Hub HYD-1' },
  '500081': { city: 'Hyderabad (HITEC City)', district: 'Hyderabad', state: 'Telangana', days: 2, hub: 'Deccan Hub HYD-2' },
  '600001': { city: 'Chennai (George Town)', district: 'Chennai', state: 'Tamil Nadu', days: 2, hub: 'South Hub MAA-1' },
  '700001': { city: 'Kolkata (BBD Bagh)', district: 'Kolkata', state: 'West Bengal', days: 2, hub: 'East Hub CCU-1' },
  '411001': { city: 'Pune (Camp)', district: 'Pune', state: 'Maharashtra', days: 2, hub: 'West Hub PNQ-1' },
  '380001': { city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', days: 2, hub: 'West Hub AMD-1' }
};

// GET pincode lookup and shipping estimation
router.get('/pincode/:pincode', async (req, res) => {
  const pin = req.params.pincode ? req.params.pincode.trim() : '';

  if (!/^\d{6}$/.test(pin)) {
    logApiCall('GET', `/api/shipping/pincode/${pin}`, 400, 'Invalid pincode format');
    return res.status(400).json({ error: 'Please enter a valid 6-digit Indian PIN code.' });
  }

  // Check internal cache / fast directory first
  if (PINCODE_DIRECTORY[pin]) {
    const info = PINCODE_DIRECTORY[pin];
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + info.days);

    logApiCall('GET', `/api/shipping/pincode/${pin}`, 200, `Resolved: ${info.city}`);
    return res.json({
      pincode: pin,
      city: info.city,
      district: info.district,
      state: info.state,
      deliveryDays: info.days,
      deliveryDate: deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      expressAvailable: true,
      standardFee: 0, // Free delivery
      hub: info.hub
    });
  }

  // Otherwise, attempt query to India Post API with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 3);

        logApiCall('GET', `/api/shipping/pincode/${pin}`, 200, `Live IndiaPost: ${po.District}`);
        return res.json({
          pincode: pin,
          city: po.Name || po.District,
          district: po.District,
          state: po.State,
          deliveryDays: 3,
          deliveryDate: deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
          expressAvailable: false,
          standardFee: 0,
          hub: `${po.Circle || po.State} Logistics Hub`
        });
      }
    }
  } catch (err) {
    // API timeout or network block: gracefully compute based on first digit zonal mapping
  }

  logApiCall('GET', `/api/shipping/pincode/${pin}`, 503, 'Postal lookup unavailable; no fallback estimate returned');
  return res.status(503).json({ error: 'We could not verify this PIN code right now. Please try again in a moment.' });
});

module.exports = router;
