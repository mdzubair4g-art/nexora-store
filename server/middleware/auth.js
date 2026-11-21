const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in the production environment.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'nexora_local_development_only_change_me';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid authorization header.' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is missing.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    req.user = null;
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }
}

function requireAuth(req, res, next) {
  if (!req.user || !req.user.id || !req.user.email) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }
  next();
}

function requireAdmin(req, res, next) {
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
  authMiddleware,
  requireAuth,
  requireAdmin
};
