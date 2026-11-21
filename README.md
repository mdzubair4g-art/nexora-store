# NEXORA.in — E-commerce Storefront

NEXORA is a responsive marketplace demo built with React, Vite, Tailwind CSS, Express, and SQLite. It includes product browsing, search and filters, a shopping bag, coupons, account registration, wishlists, order history, and an administrator-only seller area.

> **Deployment note:** The current Vercel adapter copies SQLite into /tmp. That storage is temporary and isolated between serverless instances. This project is suitable for development and demos, but it is not ready to process real customer orders until SQLite is replaced with a managed persistent database (for example, Neon Postgres or another hosted database).

## Stack

- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express REST API
- Local database: Node.js native SQLite
- Authentication: JWT bearer tokens and bcrypt password hashing
- Hosting configuration: Vercel

## Main features

- Responsive product catalogue with department, collection, price, search, and sort filters
- Product details, cart, and coupon validation
- Account registration and sign-in
- Per-account wishlist and order history
- Administrator-only product publishing and API statistics
- Indian PIN-code lookup via the India Post postal API, with a small verified fallback directory
- Cash on Delivery checkout

## Security notes

- Order and wishlist routes require a signed-in account. The server derives the account identity from the JWT; clients cannot select another customer's email.
- Order item prices and coupon discounts are recalculated on the server.
- Product publishing and internal statistics require an administrator account.
- Online payment endpoints are intentionally disabled. The previous mock verification flow did not process a real payment, so checkout now supports Cash on Delivery only.
- Production requires a private JWT_SECRET. Vercel deployments remove the public local demo accounts.
- Never commit .env files or production credentials.

## Local setup

Use Node.js 22.13 or newer for native SQLite support.

Install dependencies:

~~~powershell
npm install
cd client
npm install
cd ..
~~~

Start the Express server:

~~~powershell
npm start
~~~

Open http://localhost:5000.

For Vite hot reload, use two terminals:

~~~powershell
# Terminal 1 — API
npm run server

# Terminal 2 — frontend
npm run client
~~~

Open http://localhost:3000.

## Environment variables

Create a local .env file for local-only overrides. Do not commit it.

~~~env
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=use-a-unique-password-at-least-16-characters-long
~~~

For Vercel, add JWT_SECRET, ADMIN_EMAIL, and ADMIN_PASSWORD as encrypted environment variables for the Production and Preview environments. Set them in Project Settings → Environment Variables. The configured admin email is promoted to the administrator role at startup.

## Local demo accounts

The local seed script creates these demo accounts when run outside Vercel:

- Shopper: alex@nexora.in / nexora123
- Admin: admin@nexora.in / nexora123

These credentials are for local demos only. Do not use them on a public deployment.

## Useful commands

~~~powershell
npm run seed
npm run build
~~~

The seed command resets the local catalogue, reviews, coupons, and local demo users. It should not be run against a database containing customer data.

## Before accepting real orders

1. Replace the temporary serverless SQLite copy with a managed persistent database.
2. Configure a real payment provider only after implementing server-side signature verification and webhooks. Until then, keep Cash on Delivery only.
3. Configure delivery partners and verify serviceability and estimated delivery with a real shipping service.
4. Add automated tests, monitoring, backups, and privacy/terms pages.
5. Review product images, prices, inventory, and marketplace legal requirements.
