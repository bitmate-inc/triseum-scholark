# ScholArk

ScholArk is a TypeScript monorepo for the learner portal, administration portal, and API.

## Structure

Workspace applications and shared packages:

```text
apps/scholark-portal-admin/ Vite/React administration portal for education, catalog, and platform operations
apps/scholark-portal-api/   NestJS API and business capabilities
apps/scholark-portal-web/   Next.js learner portal
packages/ui/                Shared React components
packages/eslint-config/     Shared ESLint configuration
packages/typescript-config/ Shared TypeScript configuration
```

The admin portal covers institutions, courses, classrooms, classroom games, instructors, acquisition codes, publishers, games, game offers, taxonomy, users, and billing/acquisitions. Some pages and workflows remain staged while their API workflows are defined or connected.

## Prerequisites

- Node.js 24 or later
- pnpm 11.23.0 (the version pinned by `package.json`)
- Docker with Docker Compose

The Stripe CLI is installed locally with the workspace dependencies; no global Stripe CLI installation is needed.

## Install and configure

From the repository root:

```sh
pnpm install
```

The API and portal have committed `.env` files with local defaults. Use an ignored `.env.local` beside either file for developer-specific overrides or secrets. The API uses `.env.local` before `.env`; the portal uses Next.js env-file loading. The admin portal needs no env file for local development; its `/api` requests are proxied to the API on port 3001.

For Stripe test flows, add your test API key to `apps/scholark-portal-api/.env.local`. The API's committed webhook secret is only a placeholder; replace it with the value printed by `pnpm stripe:listen`:

```dotenv
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Never put personal Stripe credentials in a committed `.env` file.

## Start local services and database

Start PostgreSQL, Redis, MinIO, imgproxy, and Adminer:

```sh
pnpm docker:start
```

Create/update the local PostgreSQL schema and seed development fixtures:

```sh
pnpm db:setup
```

Schema sync is for local development only. `pnpm db:seed` refreshes fixture data without resetting the database. `pnpm db:reset` drops and recreates the PostgreSQL schema, then seeds it; this is destructive to PostgreSQL data but preserves MinIO and other Docker volumes. The `docker:remove` and `docker:start:clean` commands remove all Compose volumes and are not database-only reset commands.

## Run apps

Run each process in its own terminal from the repository root:

```sh
pnpm dev:api
```

```sh
pnpm dev:portal
```

```sh
pnpm dev:admin
```

The API is at `http://localhost:3001`; health endpoints are `/api/v1/health/alive` and `/api/v1/health/status`. API documentation is at `/api/v1/doc`. The learner portal is at `http://localhost:3000`, and the admin portal is at `http://localhost:3002`.

Stop an app with Ctrl+C. Stop local services with:

```sh
pnpm docker:stop
```

## Optional Stripe listener

Authenticate once with the project-local CLI:

```sh
pnpm stripe:login
```

In another terminal, start webhook forwarding:

```sh
pnpm stripe:listen
```

Copy the printed `whsec_...` value into the API's ignored `.env.local` as `STRIPE_WEBHOOK_SECRET`, then restart the API. The listener is only needed for local payment/webhook testing.

## Build and checks

```sh
pnpm build
pnpm lint
pnpm check-types
```

Run a task for one workspace package with `pnpm exec turbo <task> --filter=<package-name>`.