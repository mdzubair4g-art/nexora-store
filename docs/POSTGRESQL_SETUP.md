# PostgreSQL deployment (Vercel + Neon)

NEXORA uses PostgreSQL when \`DATABASE_URL\` is present and keeps SQLite for local development.

## Required Vercel environment variables

Set these for **Preview and Production**:

- \`DATABASE_URL\`: Neon pooled connection string (use the Vercel/Neon integration value).
- \`JWT_SECRET\`: a random private secret with at least 32 bytes.

Optional:

- \`ADMIN_EMAIL\` and \`ADMIN_PASSWORD\`: both must be set together; the password must be 16–72 UTF-8 bytes. This provisions or updates the initial administrator during database startup.
- \`DATABASE_SSL=disable\`: only for a trusted local PostgreSQL instance. Leave unset for Neon.

Do not use \`VITE_\` prefixes for database credentials. Never commit secrets.

## First deployment

1. Connect the Neon integration to the NEXORA Vercel project.
2. Confirm \`DATABASE_URL\` is available to Preview and Production deployments.
3. Set \`JWT_SECRET\` and (optionally) the administrator credentials.
4. Deploy the development branch as a Preview deployment.
5. Open \`/api/health\`. It should report \`PostgreSQL\`, \`commerceReady: true\`, and accounts/orders as available.
6. Test registration, login, a COD checkout, and order history using a test account before promoting any build.

The backend creates its tables and indexes at startup and seeds the catalogue only when the products table is empty. Existing local SQLite data is not automatically copied to Neon; migrate real records separately before switching an established store.

## Data and payment safety

- Checkout recalculates prices and coupon discounts on the server.
- Stock updates and order creation share one database transaction.
- Order idempotency prevents duplicate checkout submissions.
- Customer order reads are ownership-checked.
- Only Cash on Delivery is enabled. Online payment must not be advertised until a real provider integration is implemented and verified.
- Vercel's ephemeral filesystem is never used for customer account/order persistence.
