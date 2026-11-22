const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, logApiCall } = require('../db');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || password.length < 8 || password.length > 128 || !email.includes('@') || !email.split('@')[1]?.includes('.')) {
    logApiCall('POST', '/api/auth/register', 400, 'Missing email/password');
    return res.status(400).json({ error: 'Enter a valid email and a password between 8 and 128 characters.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    logApiCall('POST', '/api/auth/register', 409, 'Registration conflict');
    return res.status(409).json({ error: 'Email already registered. Please sign in.' });
  }

  const salt = bcrypt.genSaltSync(12);
  const passwordHash = bcrypt.hashSync(password, salt);
  const displayName = name ? name.trim() : cleanEmail.split('@')[0];

  const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
  const info = stmt.run(displayName, cleanEmail, passwordHash);

  const user = { id: Number(info.lastInsertRowid), name: displayName, email: cleanEmail, role: 'shopper' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

  logApiCall('POST', '/api/auth/register', 201, 'User registered');
  res.status(201).json({ user, token });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || password.length < 8 || password.length > 128 || !email.includes('@') || !email.split('@')[1]?.includes('.')) {
    logApiCall('POST', '/api/auth/login', 400, 'Missing credentials');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const userRecord = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
  if (!userRecord) {
    logApiCall('POST', '/api/auth/login', 401, 'Invalid login credentials');
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = bcrypt.compareSync(password, userRecord.password_hash);
  if (!isValid) {
    logApiCall('POST', '/api/auth/login', 401, 'Invalid login credentials');
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const user = { id: userRecord.id, name: userRecord.name, email: userRecord.email, role: userRecord.role };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

  logApiCall('POST', '/api/auth/login', 200, 'User authenticated');
  res.json({ user, token });
});

// Current user info
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  logApiCall('GET', '/api/auth/me', 200, 'Profile retrieved');
  res.json({ user });
});

module.exports = router;
