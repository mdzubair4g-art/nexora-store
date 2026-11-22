# NEXORA — Full-Stack Marketplace Portfolio Project

NEXORA is an e-commerce marketplace portfolio project built with **React 18, Vite, Tailwind CSS, Node.js, Express, and SQLite**. It demonstrates a frontend connected to a backend REST API, user authentication, catalogue search and filters, shopping-cart state, wishlist management, administrator-only product publishing, and demo order flows.

> **Important demo notice:** The catalogue, prices, stock, discounts and ratings are sample data. UPI/card options simulate a payment response only; no payment provider is connected and no money is charged. PIN lookup identifies a postal area; it does not verify courier serviceability, COD coverage, delivery fees or delivery dates. On Vercel, the current SQLite database is stored in temporary `/tmp` space, so account, wishlist and order records are not durable across serverless cold starts. This project is a portfolio demonstration, not a live store.

## Technology and architecture

```text
Browser
  └── React 18 + Vite + Tailwind CSS
        └── /api requests
              └── Node.js + Express REST API
                    └── SQLite database (local file / temporary Vercel storage)
```

- **Frontend:** reusable React components, responsive Tailwind styling, and Context API for account, cart and wishlist state.
- **Backend:** Express routes for authentication, products, orders, wishlist, coupons, postal-area lookup, simulated payments and administrator statistics.
- **Database:** SQLite tables for users, products, orders, reviews, wishlist, coupons and API logs.
- **Authentication:** JWT bearer tokens and bcrypt password hashing.
- **Deployment:** Vercel configuration for the frontend and API entry point.

## Main features

- Browse product categories and curated collections.
- Search, filter by price and sort the catalogue.
- View product details and sample review information.
- Add items to a cart and manage quantities.
- Register, sign in and sign out using JWT authentication.
- Save wishlist items to the signed-in account.
- Restrict product publishing and admin statistics to administrator accounts.
- View demo order records associated with the signed-in user.
- Validate a six-digit Indian PIN and resolve a postal area.
- Explore a simulated UPI/card payment flow and Cash on Delivery demo flow. No real payment is taken.

## Run locally

You need **Node.js 22.13 or newer** and npm.

1. Clone the repository and open its folder in VS Code.
2. Install root dependencies:

   ```powershell
   npm install
   ```

3. Install frontend dependencies:

   ```powershell
   npm install --prefix client
   ```

4. Create a local `.env` file. For local development, the backend can use its development-only JWT secret, but set your own secret for a more realistic setup:

   ```env
   NODE_ENV=development
   JWT_SECRET=replace-this-with-a-long-random-local-secret
   ```

5. Start the backend in Terminal 1:

   ```powershell
   npm run server
   ```

6. Start the Vite frontend in Terminal 2:

   ```powershell
   npm run client
   ```

7. Open **http://localhost:3000**.

The Vite development server proxies `/api` requests to the Express backend on port 5000.

To build the frontend:

```powershell
npm run build --prefix client
```

To serve the built frontend and API together locally, build first and then run:

```powershell
npm start
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Private JWT signing secret. Required in production; use at least 32 bytes. |
| `CORS_ORIGINS` | Comma-separated trusted origins if the frontend and API use different domains. |
| `NODE_ENV` | Set to `production` for production-mode settings. |

Never commit a real `.env` file, database credentials, JWT secrets or customer data.

## Useful API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Basic backend health and runtime information |
| POST | `/api/auth/register` | Create a shopper account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/auth/me` | Read the current signed-in account |
| GET | `/api/products` | Browse and filter the catalogue |
| GET | `/api/products/:id` | Read a product and its reviews |
| POST | `/api/orders` | Create a demo order (authenticated) |
| GET | `/api/orders` | Read the signed-in user's order history |
| GET/POST | `/api/wishlist` | Read or update the signed-in user's wishlist |
| GET | `/api/shipping/pincode/:pincode` | Resolve a postal area, not courier delivery |
| GET | `/api/payments/methods` | List demo payment methods |

Administrator routes require an authenticated administrator account.

## Security and demo limitations

- Order placement, order history and wishlist access require authentication.
- Customer identity is taken from the verified JWT, not trusted from a client-supplied email.
- Order totals, product prices, coupon discounts and stock are recalculated on the server.
- Product publishing and statistics are administrator-only.
- Passwords are hashed with bcrypt; production startup requires a private `JWT_SECRET`.
- UPI/card payment endpoints are simulations only. They do not contact Razorpay, Stripe, UPI apps or banks.
- The postal PIN lookup does not integrate a courier partner or provide verified delivery promises.
- SQLite on Vercel uses temporary `/tmp` storage. A persistent database is required before this can handle real customer accounts or orders.
- Demo product information is not verified inventory, supplier pricing, stock or real promotional pricing.

## Next improvements

1. Connect a persistent database such as PostgreSQL for deployed accounts, wishlist and orders.
2. Add automated backend and frontend tests plus deployment smoke tests.
3. Add a secure real payment provider only when the project is intentionally prepared for real transactions.
4. Integrate a courier service before displaying delivery dates, shipping charges or serviceability.
5. Add verified product data, admin inventory management and proper customer support/legal pages before any public store launch.

## Repository

- GitHub: https://github.com/mdzubair4g-art/nexora-store
- Live demo: https://nexora-store-zeta.vercel.app/
