const express = require('express');
const { db } = require('../db');

const router = express.Router();

const DOCS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXORA.in — Backend REST API Explorer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <style>
    body { background-color: #0b0f19; font-family: 'Inter', system-ui, sans-serif; color: #e2e8f0; }
    .code-box { background: #030712; border: 1px solid #1f2937; }
  </style>
</head>
<body class="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

  <!-- Header -->
  <header class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-orange-500 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-cyan-500/20">
        N
      </div>
      <div>
        <h1 class="text-xl md:text-2xl font-black text-white flex items-center gap-2">
          NEXORA.in REST API Engine
          <span class="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">v2.0 • Online</span>
        </h1>
        <p class="text-xs text-slate-400 mt-0.5">
          Node.js + Express REST API with a SQLite demo database
        </p>
      </div>
    </div>
    <div class="flex gap-2">
      <a href="/" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5">
        <i class="fa-solid fa-store"></i> Open Storefront
      </a>
      <button onclick="refreshStats()" class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition">
        <i class="fa-solid fa-rotate-right mr-1"></i> Refresh
      </button>
    </div>
  </header>

  <!-- Database Statistics -->
  <section class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
      <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Products DB</div>
      <div id="statProducts" class="text-2xl font-black text-cyan-400 mt-1">...</div>
      <div class="text-[10px] text-slate-500 mt-0.5">8 Departments</div>
    </div>
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
      <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Users DB</div>
      <div id="statUsers" class="text-2xl font-black text-emerald-400 mt-1">...</div>
      <div class="text-[10px] text-slate-500 mt-0.5">JWT Auth Active</div>
    </div>
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
      <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Orders DB</div>
      <div id="statOrders" class="text-2xl font-black text-orange-400 mt-1">...</div>
      <div class="text-[10px] text-slate-500 mt-0.5">Demo Order Status</div>
    </div>
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
      <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Reviews DB</div>
      <div id="statReviews" class="text-2xl font-black text-purple-400 mt-1">...</div>
      <div class="text-[10px] text-slate-500 mt-0.5">Verified Shoppers</div>
    </div>
  </section>

  <!-- Interactive REST API Explorer -->
  <section class="space-y-4">
    <h2 class="text-lg font-black text-white flex items-center gap-2">
      <i class="fa-solid fa-code text-cyan-400"></i> Interactive Endpoint Console
    </h2>
    <p class="text-xs text-slate-400">
      Click "Execute" on any endpoint below to send a live HTTP request directly to the backend and inspect the backend response output.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- Endpoint 1 -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">GET</span>
            <span class="text-slate-200">/api/products</span>
          </div>
          <button onclick="runTest('GET', '/api/products?limit=3')" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Execute</button>
        </div>
        <p class="text-[11px] text-slate-400">List all 24 curated products with category, sort, and search filters.</p>
      </div>

      <!-- Endpoint 2 -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">GET</span>
            <span class="text-slate-200">/api/products/1</span>
          </div>
          <button onclick="runTest('GET', '/api/products/1')" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Execute</button>
        </div>
        <p class="text-[11px] text-slate-400">Get product by ID with variants, key highlights, and customer reviews.</p>
      </div>

      <!-- Endpoint 3: Pincode -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">GET</span>
            <span class="text-slate-200">/api/shipping/pincode/560001</span>
          </div>
          <button onclick="runTest('GET', '/api/shipping/pincode/560001')" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Execute</button>
        </div>
        <p class="text-[11px] text-slate-400">Real-time Indian postal PIN code resolution & delivery ETA calculation.</p>
      </div>

      <!-- Endpoint 4: Auth -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">POST</span>
            <span class="text-slate-200">/api/auth/login</span>
          </div>
          <button onclick="runTest('POST', '/api/auth/login', { email: 'alex@nexora.in', password: 'nexora123' })" class="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Execute</button>
        </div>
        <p class="text-[11px] text-slate-400">Authenticates user and returns signed JWT token + user profile.</p>
      </div>

      <!-- Endpoint 5: Coupon -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">POST</span>
            <span class="text-slate-200">/api/coupons/apply</span>
          </div>
          <button onclick="runTest('POST', '/api/coupons/apply', { code: 'NEXORA10', subtotal: 4999 })" class="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Execute</button>
        </div>
        <p class="text-[11px] text-slate-400">Validates coupon eligibility and computes discount amount.</p>
      </div>

      <!-- Endpoint 6: Payment Gateway -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">POST</span>
            <span class="text-slate-200">/api/payments/create-order</span>
          </div>
          <button onclick="runTest('POST', '/api/payments/create-order', { amount: 3195, currency: 'INR' })" class="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Execute</button>
        </div>
        <p class="text-[11px] text-slate-400">Creates Razorpay / Payment Gateway order in paise with currency INR.</p>
      </div>

      <!-- Endpoint 7: Orders List -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">GET</span>
            <span class="text-slate-200">/api/orders</span>
          </div>
          <button onclick="runTest('GET', '/api/orders')" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Execute</button>
        </div>
        <p class="text-[11px] text-slate-400">Fetch persistent customer orders with items, addresses & tracking stages.</p>
      </div>

      <!-- Endpoint 8: Stats & Logs -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">GET</span>
            <span class="text-slate-200">/api/stats</span>
          </div>
          <button onclick="runTest('GET', '/api/stats')" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Execute</button>
        </div>
        <p class="text-[11px] text-slate-400">Real-time table counts and the latest 25 REST API traffic log entries.</p>
      </div>

    </div>

    <!-- Output Console -->
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
      <div class="flex justify-between items-center text-xs">
        <span class="font-bold text-slate-300 font-mono flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Response Inspector Output:
        </span>
        <span id="responseStatus" class="font-mono text-slate-400">Ready</span>
      </div>
      <pre id="outputBox" class="h-64 overflow-y-auto p-3 code-box rounded-xl font-mono text-xs text-emerald-400 leading-relaxed">Select any endpoint above and click "Execute" to inspect the live response.</pre>
    </div>
  </section>

  <script>
    async function refreshStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('statProducts').textContent = data.counts.products;
        document.getElementById('statUsers').textContent = data.counts.users;
        document.getElementById('statOrders').textContent = data.counts.orders;
        document.getElementById('statReviews').textContent = data.counts.reviews;
      } catch (err) {
        console.error('Stats error:', err);
      }
    }

    async function runTest(method, url, body = null) {
      const statusEl = document.getElementById('responseStatus');
      const outEl = document.getElementById('outputBox');
      statusEl.textContent = 'Calling ' + method + ' ' + url + '...';
      outEl.textContent = 'Loading...';

      try {
        const t0 = performance.now();
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(url, opts);
        const data = await res.json();
        const duration = Math.round(performance.now() - t0);

        statusEl.innerHTML = \`<span class="text-emerald-400 font-bold">\${res.status} \${res.statusText}</span> • \${duration}ms\`;
        outEl.textContent = JSON.stringify(data, null, 2);
        refreshStats();
      } catch (err) {
        statusEl.innerHTML = \`<span class="text-rose-400 font-bold">Error</span>\`;
        outEl.textContent = 'Error: ' + err.message;
      }
    }

    refreshStats();
  </script>
</body>
</html>`;

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(DOCS_HTML);
});

module.exports = router;
