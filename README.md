# NEXORA.in — Full-Stack E-Commerce Marketplace Platform

A modern, production-grade e-commerce application ported from a single-file prototype into a decoupled, modular full-stack architecture with **React 18 + Vite + Tailwind CSS**, **Node.js Express REST API**, **native SQLite database**, and **Payment & PIN Code Shipping Integrations**.

---

## Architecture Overview

```text
nexora-store/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Modular UI Components
│   │   │   ├── Navbar.jsx
│   │   │   ├── CategoryBar.jsx
│   │   │   ├── HeroBanner.jsx
│   │   │   ├── DepartmentGrid.jsx
│   │   │   ├── CuratedCollections.jsx
│   │   │   ├── FlashDeals.jsx
│   │   │   ├── ProductCatalog.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductDetailModal.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── CheckoutModal.jsx      # PIN code resolver & multi-gateway payments
│   │   │   ├── AuthModal.jsx          # JWT authentication
│   │   │   ├── WishlistModal.jsx
│   │   │   ├── OrdersModal.jsx        # Live milestone order tracking
│   │   │   ├── SellerModal.jsx        # Direct database catalog publisher
│   │   │   └── ApiDrawer.jsx          # Live SQLite stats & REST traffic inspector
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── WishlistContext.jsx
│   │   └── services/
│   │       └── api.js                 # Centralized fetch client
│   └── dist/                          # Compiled production assets
│
├── server/                     # Backend (Node.js Express + Native SQLite)
│   ├── db.js                   # Node 26 node:sqlite DatabaseSync & schema
│   ├── seed.js                 # 24 products, coupons, and test user seeder
│   ├── nexora.db               # SQLite database file
│   ├── middleware/
│   │   └── auth.js             # JWT bearer verification middleware
│   └── routes/
│       ├── auth.js             # /api/auth (register, login, me)
│       ├── products.js         # /api/products (filter, sort, search, review)
│       ├── orders.js           # /api/orders (placement, tracking, history)
│       ├── wishlist.js         # /api/wishlist (toggle, get by user)
│       ├── coupons.js          # /api/coupons (apply code, validation)
│       ├── shipping.js         # /api/shipping (pincode lookup & delivery ETA)
│       ├── payments.js         # /api/payments (Razorpay/Stripe order & verify)
│       └── stats.js            # /api/stats (database metrics & traffic logs)
│
├── standalone.html             # Original self-contained single-file prototype
└── package.json                # Project root runner scripts
```

---

## Features Implemented

### 1. Modern Frontend (React 18 + Vite + Tailwind CSS)
* **Modular React Components**: Reusable components separated cleanly with typed prop contracts.
* **Context State Management**: `CartContext`, `AuthContext`, and `WishlistContext` managing real-time states across tabs and modals.
* **Responsive UI**: Tailwind CSS glassmorphic header, custom gradients, slide-over drawer animations, and mobile-friendly layouts.

### 2. Real Backend & Native SQLite Database
* **Zero External Build Tool Requirement**: Uses Node.js's built-in `node:sqlite` (`DatabaseSync`), ensuring lightning-fast startup with zero `node-gyp` or Python compiler dependencies on Windows.
* **Persistent Relational Tables**: `products`, `users`, `orders`, `reviews`, `wishlist`, `coupons`, and `api_logs`.
* **JWT Authentication & Bcrypt Password Hashing**: Secure user registration and session management.

### 3. Shipping & Payment Integrations
* **Indian PIN Code Lookup (`/api/shipping/pincode/:pincode`)**:
  * Real-time resolution of 6-digit PIN codes to City, District, State, and Fulfillment Hub.
  * Live integration with India Post Postal Pincode API with instant fallback for major metro hubs (Bengaluru, Delhi, Mumbai, Hyderabad, Chennai, Pune, Kolkata).
  * Automated delivery date calculation (Next-Day Express vs Standard).
* **Payment Gateway Workflow (`/api/payments`)**:
  * Gateway order creation compatible with Razorpay / Stripe formats (`create-order`).
  * Instant UPI integration (Google Pay, PhonePe, Paytm, CRED).
  * Card authorization simulation with transaction references (`verify`).
  * Cash on Delivery (COD) order management.

---

## Quickstart Guide

### 1. Start the Server & Application
From the `nexora-store` root folder:
```powershell
# Run the complete server (serves API on :5000 and compiled React app)
npm start
```
Open **`http://localhost:5000`** in your browser.

### 2. Development Mode (Hot-Reloading)
To run with live Vite HMR:
```powershell
# Terminal 1: Run Backend API
npm run server

# Terminal 2: Run Vite Dev Server
npm run client
```
Open **`http://localhost:3000`** in your browser.

### 3. Re-seed Database
```powershell
npm run seed
```

### 4. Test Accounts
* **Shopper**: `alex@nexora.in` / `nexora123`
* **Admin**: `admin@nexora.in` / `nexora123`
* **Demo Promo Codes**: `NEXORA10` (10% off), `WELCOME20` (20% off), `FESTIVE500` (₹500 off)


---

## Security & Demo Notes

- **Payments are simulated.** The UPI and card options are portfolio demonstrations only; they do not connect to Razorpay or Stripe and never charge money.
- **Authentication is required** to place orders, view personal order history, save wishlist items, and access administrator tools.
- Product publishing and the API/database inspector are restricted to accounts with the `admin` role.
- Set a strong `JWT_SECRET` in your environment before production deployment. The server intentionally refuses to start in production without it.
- Configure `CORS_ORIGINS` as a comma-separated list of trusted frontend origins. For local development, the defaults allow `http://localhost:3000` and `http://localhost:5000`.
- The demo shopper and administrator accounts are created only outside production: `alex@nexora.in` and `admin@nexora.in`, both with the local demo password `nexora123`. Change or remove demo accounts before sharing a development deployment.
- Native `node:sqlite` requires Node.js 22.5 or newer. Use a persistent database service for a real production deployment; serverless `/tmp` storage is temporary and is not a durable order database.

### Environment variables

```env
NODE_ENV=production
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=https://your-frontend-domain.example
NEXORA_DISABLE_DEMO_USERS=true
```

Do not commit real secrets or customer data.
