const express = require('express');
const { logApiCall } = require('../db');

const router = express.Router();

// India Post can confirm that a PIN code exists. It does not confirm a
// courier partner's delivery coverage, COD availability, fees, or ETA.
router.get('/pincode/:pincode', async (req, res) => {
  const pin = String(req.params.pincode || '').trim();

  if (!/^[0-9]{6}$/.test(pin)) {
    logApiCall('GET', '/api/shipping/pincode', 400, 'Invalid PIN code format');
    return res.status(400).json({ error: 'Enter a valid 6-digit Indian PIN code.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Postal lookup returned an unsuccessful response.');
    }

    const data = await response.json();
    const postOffices = data?.[0]?.PostOffice;

    if (data?.[0]?.Status !== 'Success' || !Array.isArray(postOffices) || postOffices.length === 0) {
      logApiCall('GET', '/api/shipping/pincode', 404, 'PIN code not found');
      return res.status(404).json({ error: 'This PIN code was not found in the India Post directory.' });
    }

    const office = postOffices[0];
    const result = {
      pincode: pin,
      postalCodeValid: true,
      city: office.Name || office.District || '',
      district: office.District || '',
      state: office.State || '',
      serviceability: 'unconfirmed',
      deliveryDays: null,
      deliveryDate: null,
      expressAvailable: false,
      standardFee: null,
      hub: null,
      message: 'Postal area verified only. Courier serviceability, COD coverage, delivery fees, and delivery dates are not confirmed.'
    };

    logApiCall('GET', '/api/shipping/pincode', 200, 'India Post postal-area lookup succeeded');
    return res.json(result);
  } catch (error) {
    logApiCall('GET', '/api/shipping/pincode', 503, 'India Post lookup unavailable');
    return res.status(503).json({
      error: 'Postal verification is temporarily unavailable. Please try again.'
    });
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;
