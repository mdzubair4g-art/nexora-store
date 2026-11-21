const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authMiddleware, requireAuth, requireAdmin, persistentDatabaseAvailable } = require('../middleware/auth');

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    }
  };
}

test('requests without a token remain public and have no user identity', () => {
  const req = { headers: {} };
  const res = response();
  let nextCalled = false;

  authMiddleware(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.user, null);
});

test('malformed bearer headers are rejected', () => {
  const req = { headers: { authorization: 'Basic abc' } };
  const res = response();

  authMiddleware(req, res, () => assert.fail('next should not be called'));

  assert.equal(res.statusCode, 401);
  assert.match(res.body.error, /authorization/i);
});

test('invalid JWTs are rejected', () => {
  const req = { headers: { authorization: 'Bearer invalid.token.value' } };
  const res = response();

  authMiddleware(req, res, () => assert.fail('next should not be called'));

  assert.equal(res.statusCode, 401);
});

test('valid JWT claims are attached to the request', () => {
  const token = jwt.sign({ id: 7, email: 'shopper@example.com', role: 'shopper' }, JWT_SECRET);
  const req = { headers: { authorization: 'Bearer ' + token } };
  const res = response();
  let nextCalled = false;

  authMiddleware(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, 7);
  assert.equal(req.user.email, 'shopper@example.com');
});

test('requireAuth rejects anonymous requests', () => {
  const req = { user: null };
  const res = response();

  requireAuth(req, res, () => assert.fail('next should not be called'));

  assert.equal(res.statusCode, 401);
});

test('requireAuth accepts a signed-in account', () => {
  const req = { user: { id: 7, email: 'shopper@example.com', role: 'shopper' } };
  const res = response();
  let nextCalled = false;

  requireAuth(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});

test('requireAdmin blocks shoppers', () => {
  const req = { user: { id: 7, email: 'shopper@example.com', role: 'shopper' } };
  const res = response();

  requireAdmin(req, res, () => assert.fail('next should not be called'));

  assert.equal(res.statusCode, 403);
});

test('requireAdmin accepts administrator accounts', () => {
  const req = { user: { id: 1, email: 'admin@example.com', role: 'admin' } };
  const res = response();
  let nextCalled = false;

  requireAdmin(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});


test('serverless deployments are never treated as durable SQLite storage', () => {
  assert.equal(persistentDatabaseAvailable({ VERCEL: '1' }), false);
  assert.equal(persistentDatabaseAvailable({ AWS_LAMBDA_FUNCTION_NAME: 'nexora-api' }), false);
});

test('a local database file is available for local development', () => {
  assert.equal(persistentDatabaseAvailable({}), true);
});
