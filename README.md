<!-- NEXORA brand mark -->
<p align="center">
  <img src="client/public/nexora-mark.svg" alt="NEXORA brand mark" width="88" />
</p>

<h1 align="center">NEXORA.in — Curated Marketplace</h1>

<p align="center">
  A responsive e-commerce storefront for discovering products across tech, fashion, home, beauty, fitness and more.
</p>

<p align="center">
  <a href="https://nexora-store-zeta.vercel.app/">Live storefront</a> ·
  <a href="https://github.com/mdzubair4g-art/nexora-store/pull/1">Development pull request</a>
</p>

> **Project status:** Development changes are on `improve/nexora-storefront` in [PR #1](https://github.com/mdzubair4g-art/nexora-store/pull/1), which remains a draft. Production has not been promoted. An earlier Vercel Preview confirmed PostgreSQL health and the seeded catalogue; the latest branch changes still require a fresh Preview build and end-to-end checkout checks before launch.

## Overview

NEXORA is built with React, Vite, Tailwind CSS, Node.js, and Express. It uses PostgreSQL for persistent Preview/Production deployments and native SQLite for local development. The storefront includes product discovery, account features, a wishlist, a shopping bag, coupon validation, and Cash on Delivery checkout.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express REST API |
| Production database | PostgreSQL (Neon) using `pg` |
| Local development database | Node.js native SQLite |
| Authentication | JWT bearer tokens and bcrypt password hashing |
| Hosting | Vercel |
| Automated checks | GitHub Actions, Node test runner, Vite build |

## Features

- Responsive product catalogue with department, collection, price, search, and sort filters
- Product details, shopping bag, and coupon validation
- Customer registration and sign-in
- Account-scoped wishlists and order history
- Administrator-only product publishing and API statistics
- Cash on Delivery (COD) checkout
- India Post PIN-code lookup for postal-area verification only
- Shared NEXORA logo mark and browser SVG favicon

## Requirements

- Node.js **22.13 or newer** (for the native SQLite module)
- npm
- A PostgreSQL database such as Neon for persistent Preview/Production deployments

## Run locally

Clone the repository and install dependencies:

```powershell
git clone https://github.com/mdzubair4g-art/nexora-store.git
cd nexora-store
npm install
cd client
npm install
cd ..
```

Create a local environment file:

```powershell
Copy-Item .env.example .env
```

Set the values in `.env`:

```env
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-unique-password-at-least-16-characters
```

For local development, the backend uses SQLite. Start the combined Express server:

```powershell
npm start
```

Open [http://localhost:5000](http://localhost:5000).

For Vite hot reload, run the API and frontend in separate terminals from the repository root:

```powershell
# Terminal 1 — API
npm run server
```

```powershell
# Terminal 2 — frontend
npm run client
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Configure these values locally in `.env` and as encrypted environment variables in Vercel. Never commit secrets.

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | Yes for accounts | Private random signing secret of at least 32 bytes |
| `DATABASE_URL` | Preview/Production | PostgreSQL connection string |
| `ADMIN_EMAIL` | Optional | Email for the provisioned administrator account |
| `ADMIN_PASSWORD` | Optional | Strong administrator password; 16–72 UTF-8 bytes |

Set both administrator variables together or leave both unset. See [PostgreSQL deployment setup](docs/POSTGRESQL_SETUP.md) for Vercel and Neon configuration.

## Useful commands

The GitHub Actions workflow starts an isolated PostgreSQL 16 service and exercises registration, login, authenticated profiles, server-calculated COD totals, idempotent order retries, customer order ownership, concurrent stock protection, and disabled online-payment endpoints. These integration tests run only against the disposable CI database, not customer data.\n\nRun automated tests:

```powershell
npm test
```

Build the frontend:

```powershell
npm run build
```

Seed the local development database:

```powershell
npm run seed
```

**Warning:** the seed command resets the local catalogue, reviews, coupons, and local demo users. Do not run it against a database containing customer data.

## API health checks

- `GET /api/health` — reports service and database readiness
- `GET /api/products` — returns the product catalogue

Before testing accounts and orders on a deployment, confirm that `/api/health` reports PostgreSQL and `commerceReady: true`.

## Security and checkout

- Customer order and wishlist routes require authentication. The server derives customer identity from the signed token.
- Order item prices and coupon discounts are recalculated on the server.
- Stock changes and order creation run inside a database transaction; order idempotency helps prevent duplicate submissions.
- PostgreSQL startup seeding uses an advisory lock to avoid duplicate initial seeding during concurrent serverless starts.
- Product publishing and internal statistics are restricted to administrators.
- Passwords must be at least 10 characters and no more than 72 UTF-8 bytes for bcrypt compatibility.
- Online payment endpoints are disabled. The current checkout option is Cash on Delivery only; no real online payment is processed.
- PIN-code lookup is only for postal-area verification. Courier coverage, COD availability, shipping charges, and delivery estimates require a shipping-partner integration.
- Do not expose database URLs, JWT secrets, administrator credentials, or local `.env` files.

## Local demo accounts

The local seed script creates demo accounts when running outside Vercel:

- Shopper: `alex@nexora.in` / `nexora123`
- Admin: `admin@nexora.in` / `nexora123`

These credentials are for local demos only. Never use them on a public deployment.

## Before production launch

1. Deploy the latest development branch to Vercel Preview and confirm PostgreSQL readiness at `/api/health`.
2. Test registration, login, COD checkout, stock updates under concurrent requests, duplicate-order protection, and customer order ownership end-to-end.
3. Verify the latest frontend build and check desktop and mobile layouts.
4. Integrate and test a real shipping partner before displaying delivery promises or shipping charges.
5. Keep online payments disabled until a payment provider, server-side signature verification, and verified webhooks are implemented.
6. Configure monitoring and database backups, publish privacy/terms pages, and review product images, prices, inventory, and applicable marketplace requirements.

## Project links

- [Live storefront](https://nexora-store-zeta.vercel.app/)
- [GitHub repository](https://github.com/mdzubair4g-art/nexora-store)
- [Open development pull request](https://github.com/mdzubair4g-art/nexora-store/pull/1)
- [PostgreSQL deployment guide](docs/POSTGRESQL_SETUP.md)
