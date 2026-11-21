# NEXORA.in — E-commerce Storefront

NEXORA is a responsive marketplace built with React, Vite, Tailwind CSS, Express, PostgreSQL for persistent deployments, and SQLite for local development. It includes product browsing, search and filters, a shopping bag, coupons, account registration, wishlists, order history, and an administrator-only seller area.

> **Deployment note:** Vercel deployments use the managed PostgreSQL database configured through Neon. The backend uses SQLite only for local development; it does not store customer data in the ephemeral Vercel filesystem. Configure `DATABASE_URL` and a private `JWT_SECRET` before enabling account and checkout features.

## Stack

- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express REST API
- Production database: PostgreSQL (Neon) via `pg`
- Local database: Node.js native SQLite
- Authentication: JWT bearer tokens and bcrypt password hashing
- Hosting configuration: Vercel

## Main features

- Responsive product catalogue with department, collection, price, search, and sort filters
- Product details, cart, and coupon validation
- Account registration and sign-in
- Per-account wishlist and order history
- Administrator-only product publishing and API statistics
- India Post PIN-code lookup for postal-area verification only; courier coverage and delivery estimates are not claimed
- Cash on Delivery checkout

## Security notes

- Order and wishlist routes require a signed-in account. The server derives the account identity from the JWT; clients cannot select another customer's email.
- Order item prices and coupon discounts are recalculated on the server.
- Product publishing and internal statistics require an administrator account.
- Online payment endpoints are intentionally disabled. The previous mock verification flow did not process a real payment, so checkout now supports Cash on Delivery only.
- Production requires `DATABASE_URL` and a private `JWT_SECRET` of at least 32 bytes. New customer passwords must be at least 10 characters and no more than 72 UTF-8 bytes (the bcrypt input limit).
- PostgreSQL schema setup and initial catalogue seeding run at startup; a PostgreSQL advisory lock prevents simultaneous serverless cold starts from seeding duplicate catalogues.
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

Copy the safe template to a local .env file and replace the placeholders. Do not commit .env.

~~~powershell
Copy-Item .env.example .env
~~~

Then set these values in .env:

~~~env
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=use-a-unique-password-at-least-16-characters-long
~~~

For Vercel, set `DATABASE_URL` and `JWT_SECRET` as encrypted environment variables for Preview and Production. Optional `ADMIN_EMAIL` and `ADMIN_PASSWORD` provision the administrator account. See [PostgreSQL deployment setup](docs/POSTGRESQL_SETUP.md).

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

1. Verify the Preview deployment reports PostgreSQL and `commerceReady: true` at `/api/health`; test account registration, sign-in, COD checkout, stock updates, and order history before promoting.
2. Connect a real payment provider only after implementing server-side signature verification and webhooks. Until then, keep Cash on Delivery only.
3. Configure delivery partners and verify serviceability and estimated delivery with a real shipping service.
4. Add automated tests, monitoring, backups, and privacy/terms pages.
5. Review product images, prices, inventory, and marketplace legal requirements.
