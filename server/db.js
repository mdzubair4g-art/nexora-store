const path = require('node:path');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const databaseUrl = String(process.env.DATABASE_URL || '').trim();
const isPostgres = Boolean(databaseUrl);
let sqlite = null;
let pool = null;

if (isPostgres) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: databaseUrl,
    max: isServerless ? 3 : 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 8000,
    allowExitOnIdle: true,
    keepAlive: true,
    ssl: process.env.DATABASE_SSL === 'disable' ? false : undefined
  });
  pool.on('error', error => console.error('PostgreSQL pool error:', error.message));
} else {
  let DatabaseSync;
  try {
    ({ DatabaseSync } = require('node:sqlite'));
  } catch (error) {
    throw new Error('DATABASE_URL is required when node:sqlite is unavailable.', { cause: error });
  }
  sqlite = new DatabaseSync(path.join(isServerless ? '/tmp' : __dirname, 'nexora.db'));
}

const postgresSchema = [
  "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'shopper', created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, title TEXT NOT NULL, brand TEXT NOT NULL, category TEXT NOT NULL, collection TEXT NOT NULL, price INTEGER NOT NULL, mrp INTEGER NOT NULL, rating DOUBLE PRECISION NOT NULL DEFAULT 0, reviews_count INTEGER NOT NULL DEFAULT 0, flash_deal INTEGER NOT NULL DEFAULT 0, variants_json TEXT NOT NULL DEFAULT '[\"Standard\"]', image TEXT NOT NULL, highlights_json TEXT NOT NULL DEFAULT '[]', stock INTEGER NOT NULL DEFAULT 50, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, user_name TEXT NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, order_id TEXT UNIQUE NOT NULL, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, idempotency_key TEXT, user_email TEXT NOT NULL, items_json TEXT NOT NULL, subtotal INTEGER NOT NULL, discount INTEGER NOT NULL DEFAULT 0, total_amount INTEGER NOT NULL, payment_method TEXT NOT NULL, payment_status TEXT NOT NULL DEFAULT 'PENDING_ON_DELIVERY', payment_id TEXT, shipping_address TEXT NOT NULL, city TEXT, state TEXT, pincode TEXT, status TEXT NOT NULL DEFAULT 'Confirmed', tracking_stage TEXT NOT NULL DEFAULT 'Confirmed', created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS wishlist (id SERIAL PRIMARY KEY, user_email TEXT NOT NULL, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_email, product_id))",
  "CREATE TABLE IF NOT EXISTS coupons (id SERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, discount_percent INTEGER NOT NULL, max_discount INTEGER, min_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1)",
  "CREATE TABLE IF NOT EXISTS api_logs (id SERIAL PRIMARY KEY, method TEXT NOT NULL, endpoint TEXT NOT NULL, status_code INTEGER NOT NULL, details TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_product_user ON reviews(product_id, user_id) WHERE user_id IS NOT NULL",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_user_idempotency ON orders(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL",
  "CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)",
  "CREATE INDEX IF NOT EXISTS idx_wishlist_email ON wishlist(user_email)"
];

const sqliteSchema = [
  'PRAGMA foreign_keys = ON',
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT DEFAULT 'shopper', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, brand TEXT NOT NULL, category TEXT NOT NULL, collection TEXT NOT NULL, price INTEGER NOT NULL, mrp INTEGER NOT NULL, rating REAL DEFAULT 0, reviews_count INTEGER DEFAULT 0, flash_deal INTEGER DEFAULT 0, variants_json TEXT DEFAULT '[\"Standard\"]', image TEXT NOT NULL, highlights_json TEXT DEFAULT '[]', stock INTEGER DEFAULT 50, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, user_id INTEGER, user_name TEXT NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL)",
  "CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT UNIQUE NOT NULL, user_id INTEGER, idempotency_key TEXT, user_email TEXT NOT NULL, items_json TEXT NOT NULL, subtotal INTEGER NOT NULL, discount INTEGER NOT NULL DEFAULT 0, total_amount INTEGER NOT NULL, payment_method TEXT NOT NULL, payment_status TEXT NOT NULL DEFAULT 'PENDING_ON_DELIVERY', payment_id TEXT, shipping_address TEXT NOT NULL, city TEXT, state TEXT, pincode TEXT, status TEXT DEFAULT 'Confirmed', tracking_stage TEXT DEFAULT 'Confirmed', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL)",
  "CREATE TABLE IF NOT EXISTS wishlist (id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT NOT NULL, product_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_email, product_id), FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE)",
  "CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, discount_percent INTEGER NOT NULL, max_discount INTEGER, min_order INTEGER DEFAULT 0, active INTEGER DEFAULT 1)",
  "CREATE TABLE IF NOT EXISTS api_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, method TEXT NOT NULL, endpoint TEXT NOT NULL, status_code INTEGER NOT NULL, details TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
];

function toPostgresPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => '$' + (++index));
}

async function query(sql, params = [], executor = null) {
  if (isPostgres) return (executor || pool).query(toPostgresPlaceholders(sql), params);
  const statement = sqlite.prepare(sql);
  if (/^\s*(SELECT|WITH|PRAGMA|EXPLAIN)\b/i.test(sql) || /\bRETURNING\b/i.test(sql)) {
    const rows = statement.all(...params);
    return { rows, rowCount: rows.length };
  }
  const result = statement.run(...params);
  return { rows: [], rowCount: Number(result.changes), lastInsertRowid: Number(result.lastInsertRowid) };
}

async function transaction(callback) {
  if (isPostgres) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback({ query: (sql, params = []) => query(sql, params, client) });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch (rollbackError) { console.error('PostgreSQL rollback failed:', rollbackError.message); }
      throw error;
    } finally {
      client.release();
    }
  }
  sqlite.exec('BEGIN IMMEDIATE');
  try {
    const result = await callback({ query });
    sqlite.exec('COMMIT');
    return result;
  } catch (error) {
    sqlite.exec('ROLLBACK');
    throw error;
  }
}

async function initialize() {
  if (isPostgres) {
    for (const statement of postgresSchema) await pool.query(statement);
  } else {
    for (const statement of sqliteSchema) sqlite.exec(statement);
    const reviewColumns = sqlite.prepare('PRAGMA table_info(reviews)').all().map(row => row.name);
    if (!reviewColumns.includes('user_id')) sqlite.exec('ALTER TABLE reviews ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
    const orderColumns = sqlite.prepare('PRAGMA table_info(orders)').all().map(row => row.name);
    if (!orderColumns.includes('idempotency_key')) sqlite.exec('ALTER TABLE orders ADD COLUMN idempotency_key TEXT');
    sqlite.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_product_user ON reviews(product_id, user_id) WHERE user_id IS NOT NULL');
    sqlite.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_user_idempotency ON orders(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL');
    sqlite.exec('CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC)');
    sqlite.exec('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');
    sqlite.exec('CREATE INDEX IF NOT EXISTS idx_wishlist_email ON wishlist(user_email)');
  }
}

async function bootstrapData() {
  let lockClient = null;
  if (isPostgres) {
    lockClient = await pool.connect();
    await lockClient.query('SELECT pg_advisory_lock($1)', [7842319]);
  }
  try {
    const productCount = await query('SELECT COUNT(*) AS count FROM products');
    if (Number(productCount.rows[0]?.count || 0) === 0) {
      const { seed } = require('./seed');
      await seed();
    }
    const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || '');
    if (adminEmail || adminPassword) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || adminPassword.length < 16 || Buffer.byteLength(adminPassword, 'utf8') > 72) {
        throw new Error('Set a valid ADMIN_EMAIL and ADMIN_PASSWORD between 16 and 72 UTF-8 bytes.');
      }
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin') ON CONFLICT(email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'admin'",
        ['NEXORA Admin', adminEmail, passwordHash]);
    }
  } finally {
    if (lockClient) {
      try { await lockClient.query('SELECT pg_advisory_unlock($1)', [7842319]); }
      finally { lockClient.release(); }
    }
  }
}

const databaseReady = initialize().then(bootstrapData);

async function logApiCall(method, endpoint, statusCode, details = '') {
  try {
    await databaseReady;
    await query('INSERT INTO api_logs (method, endpoint, status_code, details) VALUES (?, ?, ?, ?)',
      [method, endpoint, statusCode, String(details).slice(0, 200)]);
    await query('DELETE FROM api_logs WHERE id NOT IN (SELECT id FROM api_logs ORDER BY id DESC LIMIT 100)');
  } catch (error) {
    console.error('Failed to log API call:', error.message);
  }
}

function persistentDatabaseAvailable(env = process.env) {
  return !(env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME) || Boolean(String(env.DATABASE_URL || '').trim());
}

module.exports = {
  db: { query, transaction },
  query,
  transaction,
  databaseReady,
  logApiCall,
  isServerless,
  isPostgres,
  persistentDatabaseAvailable,
  close: async () => {
    if (pool) await pool.end();
    if (sqlite) sqlite.close();
  }
};
