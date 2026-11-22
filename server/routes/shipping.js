const express = require('express');
const { logApiCall } = require('../db');

const router = express.Router();

// A small sample directory helps the portfolio demo work for common PINs.
// It identifies a postal area only; it does not represent courier coverage.
const PINCODE_DIRECTORY = {
  '560001': { city: 'Bengaluru', district: 'Bangalore Urban', state: 'Karnataka' },
  '560100': { city: 'Bengaluru (Electronic City)', district: 'Bangalore Urban', state: 'Karnataka' },
  '110001': { city: 'New Delhi (Connaught Place)', district: 'Central Delhi', state: 'Delhi' },
  '110020': { city: 'New Delhi (Okhla)', district: 'South Delhi', state: 'Delhi' },
  '400001': { city: 'Mumbai (Fort)', district: 'Mumbai City', state: 'Maharashtra' },
  '400050': { city: 'Mumbai (Bandra)', district: 'Mumbai Suburban', state: 'Maharashtra' },
  '500001': { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
  '500081': { city: 'Hyderabad (HITEC City)', district: 'Hyderabad', state: 'Telangana' },
  '600001': { city: 'Chennai (George Town)', district: 'Chennai', state: 'Tamil Nadu' },
  '700001': { city: 'Kolkata (BBD Bagh)', district: 'Kolkata', state: 'West Bengal' },
  '411001': { city: 'Pune (Camp)', district: 'Pune', state: 'Maharashtra' },
  '380001': { city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat' }
};

router.get('/pincode/:pincode', async (req, res) => {
  const pin = String(req.params.pincode || '').trim();

  if (!/^\d{6}$/.test(pin)) {
    logApiCall('GET', '/api/shipping/pincode', 400, 'Invalid PIN format');
    return res.status(400).json({ error: 'Please enter a valid 6-digit Indian PIN code.' });
  }

  const sample = PINCODE_DIRECTORY[pin];
  if (sample) {
    logApiCall('GET', '/api/shipping/pincode', 200, 'Sample postal-area lookup');
    return res.json({
      pincode: pin,
      ...sample,
      source: 'sample-directory',
      serviceabilityChecked: false
    });
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: AbortSignal.timeout(3500)
    });

    if (!response.ok) {
      throw new Error('Postal lookup service returned an unsuccessful response.');
    }

    const data = await response.json();
    const postOffices = data?.[0]?.PostOffice;
    if (data?.[0]?.Status !== 'Success' || !Array.isArray(postOffices) || postOffices.length === 0) {
      logApiCall('GET', '/api/shipping/pincode', 404, 'Postal PIN not found');
      return res.status(404).json({ error: 'No postal area was found for this PIN code.' });
    }

    const office = postOffices[0];
    const result = {
      pincode: pin,
      city: office.District || office.Name,
      district: office.District || '',
      state: office.State || '',
      source: 'India Post PIN directory',
      serviceabilityChecked: false
    };

    logApiCall('GET', '/api/shipping/pincode', 200, 'India Post postal-area lookup');
    return res.json(result);
  } catch (error) {
    logApiCall('GET', '/api/shipping/pincode', 503, 'Postal lookup temporarily unavailable');
    return res.status(503).json({
      error: 'Postal lookup is temporarily unavailable. Please try again shortly.'
    });
  }
});

module.exports = router;
