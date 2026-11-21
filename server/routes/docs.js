const express = require('express');

const router = express.Router();

const DOCS_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b1020">
  <title>NEXORA API Reference</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #080d1a; color: #e8eefc; }
    * { box-sizing: border-box; }
    body { margin: 0; min-width: 320px; background: radial-gradient(circle at 15% 0%, rgba(8,145,178,.16), transparent 34rem), radial-gradient(circle at 90% 5%, rgba(124,58,237,.16), transparent 32rem), #080d1a; }
    .shell { max-width: 1080px; margin: auto; padding: 28px 18px 64px; }
    header { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:8px 0 22px; border-bottom:1px solid #263248; }
    .brand { color:#f8fafc; font-size:20px; font-weight:900; letter-spacing:.04em; text-decoration:none; }
    .brand span { color:#22d3ee; }
    .status { border:1px solid #334155; border-radius:999px; padding:7px 12px; color:#a5f3fc; font-size:12px; }
    .hero { padding:42px 0 26px; }
    .eyebrow { color:#67e8f9; text-transform:uppercase; letter-spacing:.16em; font-size:11px; font-weight:800; }
    h1 { margin:12px 0; font-size:clamp(30px,5vw,48px); line-height:1.08; letter-spacing:-.04em; }
    .hero p { max-width:720px; color:#9aa9c1; line-height:1.7; font-size:15px; }
    .readiness { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin:18px 0 34px; }
    .metric { border:1px solid #27354a; border-radius:16px; background:rgba(15,23,42,.7); padding:16px; }
    .metric span { display:block; color:#8da0bb; font-size:12px; margin-bottom:7px; }
    .metric strong { font-size:14px; color:#e2e8f0; }
    section { margin-top:24px; }
    h2 { font-size:19px; margin:0 0 10px; }
    .muted { color:#8da0bb; font-size:13px; line-height:1.65; }
    .endpoint-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:15px; }
    .endpoint { min-width:0; border:1px solid #27354a; border-radius:14px; padding:15px; background:rgba(15,23,42,.7); }
    .endpoint-top { display:flex; flex-wrap:wrap; align-items:center; gap:9px; margin-bottom:8px; }
    .verb { font:800 10px ui-monospace,monospace; border-radius:6px; padding:4px 7px; color:#082f49; background:#67e8f9; }
    .verb.post { color:#451a03; background:#fdba74; }
    code { color:#bae6fd; font:12px ui-monospace,SFMono-Regular,monospace; overflow-wrap:anywhere; }
    .endpoint p { margin:0; color:#9aa9c1; font-size:12px; line-height:1.6; }
    .try { margin-top:10px; border:1px solid #3c516d; background:#14213a; color:#dbeafe; padding:7px 10px; border-radius:8px; font-size:11px; cursor:pointer; }
    .try:hover { background:#1d3153; }
    .note { border:1px solid rgba(245,158,11,.3); background:rgba(120,53,15,.16); color:#fcd34d; padding:14px 16px; border-radius:14px; font-size:13px; line-height:1.7; margin-top:14px; }
    .panel { margin-top:22px; border:1px solid #27354a; border-radius:16px; background:#050914; overflow:hidden; }
    .panel-head { padding:12px 15px; border-bottom:1px solid #27354a; color:#9aa9c1; font-size:11px; }
    pre { margin:0; padding:16px; min-height:110px; max-height:360px; overflow:auto; color:#a7f3d0; white-space:pre-wrap; overflow-wrap:anywhere; font:12px/1.6 ui-monospace,SFMono-Regular,monospace; }
    footer { margin-top:32px; padding-top:18px; border-top:1px solid #263248; color:#71829d; font-size:11px; }
    @media (max-width:640px) { .shell {padding:18px 13px 42px;} .readiness {grid-template-columns:1fr;} .endpoint-grid {grid-template-columns:1fr;} header {align-items:flex-start; flex-direction:column;} .hero {padding-top:30px;} }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <a class="brand" href="/"><span>N</span> NEXORA <small style="color:#71829d;font-size:10px;">API</small></a>
      <span class="status" id="api-status">Checking API…</span>
    </header>

    <div class="hero">
      <div class="eyebrow">Developer reference</div>
      <h1>Storefront API</h1>
      <p>Current API routes, access requirements, and deployment readiness for NEXORA. Public catalogue routes can be used without an account. Customer and admin data is protected.</p>
    </div>

    <div class="readiness">
      <div class="metric"><span>Public catalogue</span><strong id="catalogue-state">Checking…</strong></div>
      <div class="metric"><span>Customer accounts</span><strong id="account-state">Checking…</strong></div>
      <div class="metric"><span>Orders</span><strong id="orders-state">Checking…</strong></div>
    </div>

    <section>
      <h2>Public endpoints</h2>
      <p class="muted">These routes do not expose customer records or require a sign-in.</p>
      <div class="endpoint-grid">
        <article class="endpoint">
          <div class="endpoint-top"><span class="verb">GET</span><code>/api/health</code></div>
          <p>Shows API status and whether account/order features are ready.</p>
          <button class="try" data-path="/api/health">Try endpoint</button>
        </article>
        <article class="endpoint">
          <div class="endpoint-top"><span class="verb">GET</span><code>/api/products</code></div>
          <p>Lists the public product catalogue. Supports category, collection, search, price, and sort filters.</p>
          <button class="try" data-path="/api/products">Try endpoint</button>
        </article>
        <article class="endpoint">
          <div class="endpoint-top"><span class="verb">GET</span><code>/api/products/:id</code></div>
          <p>Returns a product and its customer-submitted reviews.</p>
          <button class="try" data-path="/api/products/1">Try example</button>
        </article>
        <article class="endpoint">
          <div class="endpoint-top"><span class="verb">GET</span><code>/api/shipping/pincode/:pincode</code></div>
          <p>Checks a PIN code against the India Post directory. This does not confirm courier serviceability, COD coverage, fees, or delivery time.</p>
          <button class="try" data-path="/api/shipping/pincode/560001">Try example</button>
        </article>
        <article class="endpoint">
          <div class="endpoint-top"><span class="verb post">POST</span><code>/api/coupons/apply</code></div>
          <p>Checks a coupon code against the seeded/local coupon catalogue. Order totals are recalculated again by the server.</p>
        </article>
        <article class="endpoint">
          <div class="endpoint-top"><span class="verb">GET</span><code>/api/payments/methods</code></div>
          <p>Lists currently supported payment methods. Online payment creation and verification remain disabled.</p>
          <button class="try" data-path="/api/payments/methods">Try endpoint</button>
        </article>
      </div>
    </section>

    <section>
      <h2>Protected endpoints</h2>
      <p class="muted">These routes require an authenticated account. Administrator routes also require the admin role.</p>
      <div class="endpoint-grid">
        <article class="endpoint"><div class="endpoint-top"><span class="verb post">POST</span><code>/api/auth/register</code></div><p>Create a customer account. Requires a durable database and a private JWT secret.</p></article>
        <article class="endpoint"><div class="endpoint-top"><span class="verb post">POST</span><code>/api/auth/login</code></div><p>Sign in and receive a signed account token. Disabled on Vercel until persistent storage is connected.</p></article>
        <article class="endpoint"><div class="endpoint-top"><span class="verb">GET</span><code>/api/orders</code></div><p>Returns only the signed-in customer's order history. Admins can inspect all orders.</p></article>
        <article class="endpoint"><div class="endpoint-top"><span class="verb post">POST</span><code>/api/orders</code></div><p>Creates a Cash on Delivery order with server-side price, coupon, and inventory checks.</p></article>
        <article class="endpoint"><div class="endpoint-top"><span class="verb">GET</span><code>/api/wishlist</code></div><p>Returns the signed-in customer's saved products.</p></article>
        <article class="endpoint"><div class="endpoint-top"><span class="verb">GET</span><code>/api/stats</code></div><p>Administrator-only database and request statistics.</p></article>
      </div>
      <div class="note"><strong>Deployment note:</strong> This project currently uses native SQLite. Vercel serverless storage is temporary and isolated, so sign-in, wishlists, reviews, seller tools, admin stats, and orders stay disabled there until a real persistent database adapter is installed and verified. A JWT secret alone is not sufficient.</div>
    </section>

    <section class="panel">
      <div class="panel-head">API response inspector</div>
      <pre id="output">Choose a public endpoint above to view its live JSON response.</pre>
    </section>

    <footer>NEXORA API reference · No passwords, access tokens, or demo login credentials are published on this page.</footer>
  </main>

  <script>
    async function runEndpoint(path) {
      const output = document.getElementById('output');
      output.textContent = 'Loading ' + path + ' …';
      try {
        const response = await fetch(path, { headers: { Accept: 'application/json' } });
        const body = await response.json();
        output.textContent = 'HTTP ' + response.status + ' ' + response.statusText + '\n\n' + JSON.stringify(body, null, 2);
      } catch (error) {
        output.textContent = 'Request failed: ' + error.message;
      }
    }

    document.querySelectorAll('[data-path]').forEach(function(button) {
      button.addEventListener('click', function() {
        runEndpoint(button.getAttribute('data-path'));
      });
    });

    async function checkReadiness() {
      try {
        const response = await fetch('/api/health');
        const health = await response.json();
        document.getElementById('api-status').textContent = health.status === 'online' ? 'API online' : 'API unavailable';
        document.getElementById('catalogue-state').textContent = health.capabilities?.catalogue || 'Unknown';
        document.getElementById('account-state').textContent = health.capabilities?.accounts || 'Unknown';
        document.getElementById('orders-state').textContent = health.capabilities?.orders || 'Unknown';
      } catch (error) {
        document.getElementById('api-status').textContent = 'API unavailable';
        document.getElementById('catalogue-state').textContent = 'Unavailable';
        document.getElementById('account-state').textContent = 'Unavailable';
        document.getElementById('orders-state').textContent = 'Unavailable';
      }
    }

    checkReadiness();
  </script>
</body>
</html>`;

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(DOCS_HTML);
});

module.exports = router;
