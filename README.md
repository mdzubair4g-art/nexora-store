# NEXORA — Full-Stack Marketplace Portfolio Project

NEXORA is an e-commerce marketplace portfolio project built with **React 18, Vite, Tailwind CSS, Node.js, Express, and SQLite**. It demonstrates a frontend connected to a backend REST API, account authentication, catalogue search and filters, cart and wishlist flows, administrator-only product publishing, and demo order records.

> **Demo notice:** product listings, prices, ratings, stock and discounts are sample data. UPI/card checkout simulates a response only; no real payment provider is connected and no money is charged. PIN lookup identifies a postal area only; it does not verify courier availability, COD coverage, shipping fees or delivery dates. On Vercel, SQLite is stored in temporary `/tmp` space, so account, wishlist and order records are not durable across serverless cold starts. This deployment is for portfolio demonstration, not a live store.

## Architecture

```text
Browser → React + Vite + Tailwind CSS → /api → Node.js + Express → SQLite
```

- **Frontend:** reusable React components, responsive styling, and Context API for account, cart and wishlist state.
- **Backend:** Express REST routes for authentication, products, orders, wishlist, coupons, postal-area lookup, simulated payments and admin statistics.
- **Database:** SQLite tables for users, products, orders, reviews, wishlist, coupons and API logs.
- **Authentication:** JWT bearer tokens and bcrypt password hashing.

## Features

- Browse departments and curated collections.
- Search, filter by price and sort products.
- Open product details and view sample review information.
- Add products to cart and adjust quantities.
- Register, sign in and manage a personal wishlist.
- Admin-only product publishing and statistics.
- View demo order records for the signed-in account.
- Resolve an Indian postal PIN to its postal area.
- Try simulated payment and demo Cash on Delivery flows.

## Run locally

Requires **Node.js 22.13 or newer** and npm.

Install the dependencies:

```powershell
npm install
npm install --prefix client
```

Start the backend in Terminal 1:

```powershell
npm run server
```

Start the frontend in Terminal 2:

```powershell
npm run client
```

Open **http://localhost:3000**. Vite proxies `/api` requests to the Express backend on port 5000.

Build the frontend:

```powershell
npm run build --prefix client
```

To serve the compiled frontend and API together locally, build first and then run `npm start`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Private JWT signing secret; required in production and should be at least 32 bytes. |
| `CORS_ORIGINS` | Comma-separated trusted origins when frontend and API use different domains. |
| `NODE_ENV` | Use `production` to enable production-mode settings. |

Never commit real `.env` files, database credentials, JWT secrets or customer data.

## API examples

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Backend health and runtime information |
| POST | `/api/auth/register` | Register a shopper account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/auth/me` | Read the current signed-in account |
| GET | `/api/products` | Browse and filter the catalogue |
| GET | `/api/products/:id` | Read a product and its reviews |
| POST | `/api/orders` | Create a demo order (authenticated) |
| GET | `/api/orders` | Read the signed-in user's order history |
| GET/POST | `/api/wishlist` | Read or update the signed-in user's wishlist |
| GET | `/api/shipping/pincode/:pincode` | Resolve a postal area only |
| GET | `/api/payments/methods` | List demo payment methods |

Administrator endpoints require an authenticated administrator account.

## Security and known limitations

- Order placement, order history and wishlist routes require authentication.
- Customer identity is derived from the signed JWT, not trusted from a supplied email.
- Order totals, product prices, coupon discounts and stock are recalculated by the backend.
- Product publishing and database statistics are administrator-only.
- Passwords are hashed with bcrypt; production startup requires a private `JWT_SECRET`.
- UPI/card payment endpoints are simulations. They do not contact Razorpay, Stripe, UPI apps or banks.
- PIN lookup does not integrate a courier partner or provide verified delivery promises.
- Vercel's temporary SQLite storage is not durable. A persistent database is required before accounts and orders can be used in real deployments.
- Seed catalogue data is not verified supplier inventory, pricing or real promotional data.

## Roadmap

1. Connect persistent PostgreSQL storage for deployed accounts, wishlists and orders.
2. Add automated API tests and deployment smoke tests.
3. Integrate a payment provider only if the project is intentionally prepared for real transactions.
4. Integrate a courier service before offering delivery dates, shipping fees or serviceability.
5. Add verified inventory, admin stock management and genuine store policies before any public store launch.

## Repository

- GitHub: https://github.com/mdzubair4g-art/nexora-store
