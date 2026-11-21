const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? null : 'nexora_local_development_only_change_me');
const isJwtSecretConfigured = typeof JWT_SECRET === 'string' && Buffer.byteLength(JWT_SECRET, 'utf8') >= 32;

function persistentDatabaseAvailable(env = process.env) {
  // The current app is wired only to node:sqlite. Its /tmp copy is not durable
  // or shared between Vercel serverless instances. Do not enable commerce just
  // by setting an env flag; this must change only alongside a real DB adapter.
  return !(env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME);
}

function persistentStoreUnavailable(res) {
  return res.status(503).json({
    error: 'Accounts and ordering are temporarily disabled on this deployment. The store needs a connected persistent database before customer data can be saved safely.'
  });
}

function requirePersistentDatabase(req, res, next) {
  if (!persistentDatabaseAvailable()) return persistentStoreUnavailable(res);
  next();
}

function requireJwtSecret(req, res, next) {
  if (!persistentDatabaseAvailable()) return persistentStoreUnavailable(res);
  if (!isJwtSecretConfigured) {
    return res.status(503).json({
      error: 'Account features are temporarily unavailable. The site administrator must configure JWT_SECRET.'
    });
  }
  next();
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid authorization header.' });
  }

  if (!persistentDatabaseAvailable()) return persistentStoreUnavailable(res);

  if (!JWT_SECRET) {
    return res.status(503).json({
      error: 'Account features are temporarily unavailable until a private JWT_SECRET of at least 32 bytes is configured.'
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is missing.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch (err) {
    req.user = null;
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }
}

function requireAuth(req, res, next) {
  if (!persistentDatabaseAvailable()) return persistentStoreUnavailable(res);
  if (!JWT_SECRET) {
    return res.status(503).json({
      error: 'Account features are temporarily unavailable until JWT_SECRET is configured.'
    });
  }
  if (!req.user || !req.user.id || !req.user.email) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!persistentDatabaseAvailable()) return persistentStoreUnavailable(res);
  if (!JWT_SECRET) {
    return res.status(503).json({
      error: 'Administrator features are unavailable until JWT_SECRET is configured.'
    });
  }
  if (!req.user || !req.user.id || !req.user.email) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access is required.' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  isJwtSecretConfigured,
  authMiddleware,
  requireAuth,
  requireAdmin,
  requireJwtSecret,
  requirePersistentDatabase,
  persistentDatabaseAvailable
};
