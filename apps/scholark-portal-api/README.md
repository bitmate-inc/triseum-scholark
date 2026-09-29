# ScholArk Portal API

NestJS modular monolith providing ScholArk portal business capabilities and HTTP APIs. Persistence uses MikroORM with PostgreSQL.

## Structure

API layers:

```text
src/app/www/                   HTTP, WebSocket, and other delivery transports
src/app/core/feature/           Business capabilities, described below
src/app/core/infrastructure/    Database and external-system adapters
src/app/core/shared/            Cross-cutting app utilities, added only when needed
src/lib/                        Adapted, app-local reusable primitives
```

- `account/` — Account identities and authentication, including registration, email verification, password workflows, and auth tokens.
- `admin/` — Administrative identity plus read/write use cases for managing education records, catalog data, acquisition codes, and billing.
- `catalog/` — Learner-facing game discovery, featured games, user-library reads, and institution/course/classroom catalog queries.
- `education/` — Institutions, courses, classrooms, instructors, classroom game assignments, institution offers, and acquisition codes.
- `game/` — Games, versions and customizations; acquisition, checkout, payment/webhook processing, licenses, launch tickets, play events, and game state.
- `media/` — Shared media metadata for image and video assets.
- `publisher/` — Publisher records and publisher membership.
- `taxonomy/` — Classification terms used to organize and discover games.
- `user/` — Portal user records and user profile read/update operations.

Controllers remain thin and delegate to one-use-case command or query classes. Features own their models and repositories. Infrastructure exposes technical capabilities and must not contain business workflows.

## Naming

Collection properties and variables use a singular noun followed by `List`, such as `gameList`, `taxonomyList`, and `configDefinitionList`. Do not use plural collection identifiers such as `games`, `taxonomyTerms`, or `definitions`. Framework-owned keys and external protocol fields retain the names required by their contracts.

## Local Setup

The repository includes a committed `.env` with safe local defaults. Put developer-specific overrides and secrets in the ignored `.env.local`; it takes precedence over `.env`. Run the local services, prepare the database, and start the API from the repository root:

```bash
pnpm install
pnpm docker:start
pnpm db:setup
pnpm dev:api
```

The HTTP API listens on the configured `PORT`. Its liveness endpoint is `GET /api/v1/health/alive`, and its dependency health endpoint is `GET /api/v1/health/status`.

Swagger UI is available at `http://localhost:3001/api/v1/doc`. The OpenAPI JSON document is available at `http://localhost:3001/api/v1/doc-json`.

## Configuration

Environment variables are validated at startup and exposed through namespaced Nest configuration.

The committed `.env` provides local defaults. `.env.local` overrides it for both the NestJS application and MikroORM CLI commands. Set `NODE_ENV=stage` to load `.env.stage.local`, then `.env.stage`, followed by `.env.local` and `.env`.

Print a complete dotenv payload with `.env.stage` overlaid on `.env` for deployment import:

```bash
pnpm --silent --filter scholark-portal-api env:export:stage
```

Configuration files under `src/config` are loaded automatically. Each file must default-export a Nest `registerAs` factory and may export an `envSchema` object; all discovered schemas are merged for startup validation, and duplicate environment-variable definitions fail fast.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MIKRO_ORM_DATABASE_URL` | Yes | - | PostgreSQL connection URL |
| `MIKRO_ORM_DEBUG` | No | `false` | Enable MikroORM debug logging |
| `STRIPE_API_KEY` | Yes | Local placeholder | Stripe API key; use a test-mode key for local development |
| `STRIPE_PORTAL_URL` | Yes | `http://localhost:3000` | Portal origin used for Stripe redirects |
| `STRIPE_WEBHOOK_SECRET` | Yes | Local placeholder | Webhook signing secret; replace with the value printed by `pnpm stripe:listen` |
| `REDIS_URL` | Yes | - | Redis connection URL for browser-session storage |
| `AUTH_SESSION_SECRET` | Yes | - | Secret used to sign browser-session cookies |
| `AUTH_JWT_SECRET` | Yes | - | Secret used by the available JWT auth transport |
| `AUTH_COOKIE_SECURE` | No | `false` | Send the browser-session cookie only over HTTPS |
| `AUTH_COOKIE_SAME_SITE` | No | `strict` | Browser-session cookie policy: `strict`, `lax`, or `none` |
| `AUTH_SESSION_REDIS_PREFIX` | No | `scholark:session:` | Redis key prefix used for browser sessions |
| `CORS_ORIGIN` | No | Reflect request origin | Comma-separated allowed web origins |
| `PORT` | Yes | - | HTTP listen port |
| `ROUTER_BASE_URL` | No | `api` | Base URL used when generating API links |
| `TRUST_PROXY` | No | `false` | Trust Express proxy headers |
| `GAME_PROXY_PUBLIC_ORIGIN` | Production | None | HTTPS public origin routed to the API's `/api/v1/game/*` endpoints |
| `GAME_PROXY_ALLOW_SAME_ORIGIN_DEV` | No | `false` | Allow the local API origin as the game origin outside production |
| `GAME_PROXY_ALLOW_HTTP_UPSTREAM` | No | `false` | Explicitly allow unencrypted HTTP between the API proxy and game upstream |
| `GAME_PROXY_COOKIE_NAME` | No | `scholark_game` | HttpOnly cookie name for game sessions |
| `GAME_PROXY_TICKET_TTL_SECONDS` | No | `60` | Maximum one-time launch ticket lifetime (10-120 seconds) |
| `GAME_PROXY_SESSION_TTL_SECONDS` | No | `3600` | Maximum game session lifetime, bounded by license expiry |

The game origin serves the one-time ticket exchange and versioned runtime API at `/api/v1/game/launch/exchange`, `/api/v1/game/config`, `/api/v1/game/events`, and `/api/v1/game/state`, as well as proxied game content under `/api/v1/game/content/`. The proxy resolves its upstream from the licensed Game Version's admin-managed `runUrl`; publisher-domain verification and protection from internal-network destinations remain open security design work. HTTP upstreams are disabled by default; enabling them permits unencrypted API-to-game traffic and should be limited to legacy development/test builds.

## Validation

```bash
pnpm --filter scholark-portal-api check-types
pnpm --filter scholark-portal-api lint
pnpm --filter scholark-portal-api test
pnpm --filter scholark-portal-api build
```

## Database

Prepare a local database by safely adding/updating its schema from the current entities and running the fixture seeder. The schema update does not drop existing tables or columns:

```bash
pnpm db:setup
```

The seed is idempotent and refreshes the development fixtures without resetting the database. To seed again without changing the schema, run `pnpm db:seed`.

To discard and rebuild local PostgreSQL data, run `pnpm db:reset`. This drops the PostgreSQL schema before recreating it and reseeding; it preserves MinIO and other Docker volumes. Do not run this against a database containing data you need.

Schema synchronization is for local development only. Do not use it as a production schema deployment process.

See the [portal deployment guide](../../doc/deployment.md) for the Vercel, Render, Neon, and Upstash configuration.

See [MikroORM notes](doc/notes/mikro-orm.md) for CLI loader, metadata,
entity-modeling, and local database troubleshooting details.
