const path = require('node:path');
const fs = require('node:fs');

// In serverless environments (Vercel / AWS Lambda), the deployment bundle is read-only.
// Writable storage is in /tmp.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dbDir = isServerless ? '/tmp' : __dirname;
const dbPath = path.join(dbDir, 'nexora.db');

// If on serverless and db doesn't exist in /tmp yet, copy seed database if present
if (isServerless && !fs.existsSync(dbPath)) {
  const sourceDb = path.join(__dirname, 'nexora.db');
  if (fs.existsSync(sourceDb)) {
    try {
      fs.copyFileSync(sourceDb, dbPath);
    } catch (e) {
      console.warn('Could not copy seed db to /tmp, will initialize fresh:', e);
    }
  }
}

let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch (err) {
  console.error('node:sqlite DatabaseSync not found in current Node runtime:', err);
}

let db;
if (DatabaseSync) {
  db = new DatabaseSync(dbPath);

  // Initialize schema
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'shopper',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      collection TEXT NOT NULL,
      price INTEGER NOT NULL,
      mrp INTEGER NOT NULL,
      rating REAL DEFAULT 4.5,
      reviews_count INTEGER DEFAULT 0,
      flash_deal INTEGER DEFAULT 0,
      variants_json TEXT DEFAULT '["Standard"]',
      image TEXT NOT NULL,
      highlights_json TEXT DEFAULT '[]',
      stock INTEGER DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      user_email TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      discount INTEGER NOT NULL DEFAULT 0,
      total_amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'COMPLETED',
      payment_id TEXT,
      shipping_address TEXT NOT NULL,
      city TEXT,
      state TEXT,
      pincode TEXT,
      status TEXT DEFAULT 'Confirmed',
      tracking_stage TEXT DEFAULT 'Packed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_email, product_id)
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_percent INTEGER NOT NULL,
      max_discount INTEGER,
      min_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS api_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      method TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Auto-seed if products table is empty (e.g. fresh cold start on Vercel)
  try {
    const countCheck = db.prepare('SELECT count(*) as count FROM products').get();
    if (!countCheck || countCheck.count === 0) {
      console.log('Database empty, auto-seeding products...');
      const { seed } = require('./seed');
      seed();
    }
  } catch (err) {
    console.error('Auto-seed check error:', err);
  }

  // The committed SQLite file includes local demo accounts. Never expose those
  // predictable credentials in a public serverless deployment.
  if (isServerless) {
    const configuredAdminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const configuredAdminPassword = String(process.env.ADMIN_PASSWORD || '');

    for (const demoEmail of ['alex@nexora.in', 'admin@nexora.in']) {
      if (demoEmail !== configuredAdminEmail) {
        db.prepare('DELETE FROM wishlist WHERE LOWER(user_email) = ?').run(demoEmail);
        db.prepare('DELETE FROM users WHERE LOWER(email) = ?').run(demoEmail);
      }
    }

    if (configuredAdminEmail || configuredAdminPassword) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredAdminEmail) || configuredAdminPassword.length < 16) {
        throw new Error('Set a valid ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters.');
      }

      const bcrypt = require('bcryptjs');
      const passwordHash = bcrypt.hashSync(configuredAdminPassword, 12);
      const existingAdmin = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(configuredAdminEmail);

      if (existingAdmin) {
        db.prepare('UPDATE users SET name = ?, password_hash = ?, role = ? WHERE id = ?')
          .run('NEXORA Admin', passwordHash, 'admin', existingAdmin.id);
      } else {
        db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
          .run('NEXORA Admin', configuredAdminEmail, passwordHash, 'admin');
      }
    }
  }
}

function logApiCall(method, endpoint, statusCode, details = '') {
  if (!db) return;
  try {
    const stmt = db.prepare(`
      INSERT INTO api_logs (method, endpoint, status_code, details)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(method, endpoint, statusCode, String(details).slice(0, 200));

    // Keep log table pruned to latest 100 entries
    db.exec(`
      DELETE FROM api_logs WHERE id NOT IN (
        SELECT id FROM api_logs ORDER BY id DESC LIMIT 100
      )
    `);
  } catch (err) {
    console.error('Failed to log API call:', err);
  }
}

module.exports = {
  db,
  logApiCall
};
