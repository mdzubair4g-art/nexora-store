const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const app = require('../server');
const { databaseReady, query, transaction, close, isPostgres } = require('../db');

test('PostgreSQL API integration: accounts, COD orders, stock, ownership, and disabled online payments', async () => {
  assert.equal(isPostgres, true, 'CI integration tests must run against PostgreSQL');
  await databaseReady;

  const savedStocks = new Map();
  const emails = [
    `e2e-shopper-a-${randomUUID()}@example.invalid`,
    `e2e-shopper-b-${randomUUID()}@example.invalid`
  ];
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  let tokenA = '';
  let tokenB = '';
  let userA = null;
  let userB = null;

  const call = async (pathname, options = {}) => {
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    if (options.token) headers.Authorization = `Bearer ${options.token}`;
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(baseUrl + pathname, {
      method: options.method || 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    const data = await response.json();
    return { status: response.status, data };
  };

  try {
    const health = await call('/api/health');
    assert.equal(health.status, 200);
    assert.equal(health.data.database, 'PostgreSQL');
    assert.equal(health.data.commerceReady, true);

    const catalogue = await call('/api/products');
    assert.equal(catalogue.status, 200);
    assert.ok(catalogue.data.count >= 2, 'seed catalogue should contain products');

    const products = await query(
      'SELECT id, title, price, stock, variants_json FROM products WHERE id IN (1, 2) ORDER BY id'
    );
    assert.equal(products.rows.length, 2, 'integration tests expect seeded products 1 and 2');
    for (const product of products.rows) savedStocks.set(Number(product.id), Number(product.stock));

    const registrationA = await call('/api/auth/register', {
      method: 'POST',
      body: { name: 'Integration Shopper A', email: emails[0], password: 'Strong-CI-Password-123!' }
    });
    assert.equal(registrationA.status, 201);
    assert.ok(registrationA.data.token);
    tokenA = registrationA.data.token;
    userA = registrationA.data.user;

    const registrationB = await call('/api/auth/register', {
      method: 'POST',
      body: { name: 'Integration Shopper B', email: emails[1], password: 'Strong-CI-Password-456!' }
    });
    assert.equal(registrationB.status, 201);
    tokenB = registrationB.data.token;
    userB = registrationB.data.user;

    const duplicateRegistration = await call('/api/auth/register', {
      method: 'POST',
      body: { name: 'Duplicate', email: emails[0], password: 'Strong-CI-Password-123!' }
    });
    assert.equal(duplicateRegistration.status, 409);

    const login = await call('/api/auth/login', {
      method: 'POST',
      body: { email: emails[0].toUpperCase(), password: 'Strong-CI-Password-123!' }
    });
    assert.equal(login.status, 200);
    assert.equal(login.data.user.id, userA.id);

    const invalidLogin = await call('/api/auth/login', {
      method: 'POST',
      body: { email: emails[0], password: 'incorrect-password-123' }
    });
    assert.equal(invalidLogin.status, 401);

    const currentUser = await call('/api/auth/me', { token: tokenA });
    assert.equal(currentUser.status, 200);
    assert.equal(currentUser.data.user.email, emails[0]);

    const anonymousWishlist = await call('/api/wishlist');
    assert.equal(anonymousWishlist.status, 401);

    const firstProduct = products.rows.find(product => Number(product.id) === 1);
    const variants = JSON.parse(firstProduct.variants_json || '["Standard"]');
    const firstVariant = Array.isArray(variants) && variants.length ? variants[0] : 'Standard';
    const idempotencyKey = `e2e-order-${randomUUID()}`;
    const orderPayload = {
      items: [{
        id: Number(firstProduct.id),
        qty: 2,
        variant: firstVariant,
        price: 1,
        title: 'CLIENT-SUPPLIED-FAKE-TITLE'
      }],
      idempotencyKey,
      recipientName: 'Integration Test',
      recipientPhone: '9876543210',
      addressLine: '10 Test Street, Test Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001'
    };

    const order = await call('/api/orders', { method: 'POST', token: tokenA, body: orderPayload });
    assert.equal(order.status, 201);
    assert.match(order.data.orderId, /^NX-/);
    assert.equal(order.data.paymentMethod, 'Cash on Delivery (COD)');
    assert.equal(order.data.totalAmount, Number(firstProduct.price) * 2);
    assert.equal(order.data.items[0].title, firstProduct.title);
    assert.equal(Number(order.data.items[0].price), Number(firstProduct.price));

    const afterFirstOrder = await query('SELECT stock FROM products WHERE id=?', [Number(firstProduct.id)]);
    assert.equal(Number(afterFirstOrder.rows[0].stock), Number(savedStocks.get(Number(firstProduct.id))) - 2);

    const replay = await call('/api/orders', { method: 'POST', token: tokenA, body: orderPayload });
    assert.equal(replay.status, 200);
    assert.equal(replay.data.orderId, order.data.orderId);
    const afterReplay = await query('SELECT stock FROM products WHERE id=?', [Number(firstProduct.id)]);
    assert.equal(Number(afterReplay.rows[0].stock), Number(afterFirstOrder.rows[0].stock));

    const customerOrders = await call('/api/orders', { token: tokenA });
    assert.equal(customerOrders.status, 200);
    assert.ok(customerOrders.data.orders.some(item => item.orderId === order.data.orderId));

    const otherCustomerOrder = await call(`/api/orders/${encodeURIComponent(order.data.orderId)}`, { token: tokenB });
    assert.equal(otherCustomerOrder.status, 404);
    const otherCustomerList = await call('/api/orders', { token: tokenB });
    assert.equal(otherCustomerList.status, 200);
    assert.ok(!otherCustomerList.data.orders.some(item => item.orderId === order.data.orderId));

    const secondProduct = products.rows.find(product => Number(product.id) === 2);
    const secondVariants = JSON.parse(secondProduct.variants_json || '["Standard"]');
    const secondVariant = Array.isArray(secondVariants) && secondVariants.length ? secondVariants[0] : 'Standard';
    await query('UPDATE products SET stock=1 WHERE id=?', [Number(secondProduct.id)]);

    const makeConcurrentOrder = (token, suffix) => call('/api/orders', {
      method: 'POST',
      token,
      body: {
        items: [{ id: Number(secondProduct.id), qty: 1, variant: secondVariant }],
        idempotencyKey: `e2e-race-${suffix}-${randomUUID()}`,
        recipientName: 'Stock Race Test',
        recipientPhone: '9876543210',
        addressLine: '20 Race Street, Test Layout',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    });

    const competing = await Promise.all([
      makeConcurrentOrder(tokenA, 'a'),
      makeConcurrentOrder(tokenB, 'b')
    ]);
    assert.deepEqual(competing.map(result => result.status).sort((a, b) => a - b), [201, 409]);
    const remaining = await query('SELECT stock FROM products WHERE id=?', [Number(secondProduct.id)]);
    assert.equal(Number(remaining.rows[0].stock), 0, 'stock must never become negative');

    const paymentMethods = await call('/api/payments/methods');
    assert.equal(paymentMethods.status, 200);
    assert.equal(paymentMethods.data.onlinePaymentsAvailable, false);
    assert.ok(paymentMethods.data.methods.some(method => method.id === 'cod' && method.available));

    const createOnlinePayment = await call('/api/payments/create-order', {
      method: 'POST',
      body: { amount: 100, receipt: 'ci-test' }
    });
    assert.equal(createOnlinePayment.status, 503);
    const verifyOnlinePayment = await call('/api/payments/verify', {
      method: 'POST',
      body: { paymentId: 'fake-payment', signature: 'fake-signature' }
    });
    assert.equal(verifyOnlinePayment.status, 503);
  } finally {
    try {
      await transaction(async tx => {
        await tx.query(
          'DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE email IN (?, ?)) OR user_email IN (?, ?)',
          [...emails, ...emails]
        );
        await tx.query(
          'DELETE FROM reviews WHERE user_id IN (SELECT id FROM users WHERE email IN (?, ?))',
          emails
        );
        await tx.query('DELETE FROM wishlist WHERE user_email IN (?, ?)', emails);
        await tx.query('DELETE FROM users WHERE email IN (?, ?)', emails);
        for (const [productId, stock] of savedStocks) {
          await tx.query('UPDATE products SET stock=? WHERE id=?', [stock, productId]);
        }
      });
    } finally {
      server.closeAllConnections?.();
      await new Promise(resolve => server.close(resolve));
      await new Promise(resolve => setTimeout(resolve, 150));
      await close();
    }
  }
});
