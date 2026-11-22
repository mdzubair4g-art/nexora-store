const jwt = require('jsonwebtoken');

const DEVELOPMENT_JWT_SECRET = 'nexora_local_development_secret_only';
const JWT_SECRET = process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production' ? null : DEVELOPMENT_JWT_SECRET);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production. Set it in your deployment environment.');
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid authorization header' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is missing' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Session is invalid or expired. Please sign in again.' });
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    return next();
  };
}

module.exports = {
  JWT_SECRET,
  authMiddleware,
  requireAuth,
  requireRole
};
