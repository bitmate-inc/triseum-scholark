# ScholArk Portal API

NestJS modular monolith providing ScholArk portal business capabilities and HTTP APIs. Persistence uses MikroORM with PostgreSQL.

## Structure

```text
src/app/www/                   Web delivery: HTTP, WebSocket, and related transports
src/app/core/feature/game/     Authoritative game aggregate and general-purpose use cases
src/app/core/feature/taxonomy/ Standalone taxonomy terms and classification capabilities
src/app/core/feature/catalog/  Published catalog discovery and frontend-oriented queries
src/app/core/infrastructure/   Database and external-system adapters
src/app/core/shared/           Cross-cutting app utilities, added only when needed
src/lib/                       Adapted, app-local reusable primitives
```

Controllers remain thin and delegate to one-use-case command or query classes. Features own their models and repositories. Infrastructure exposes technical capabilities and must not contain business workflows.

## Naming

Collection properties and variables use a singular noun followed by `List`, such as `gameList`, `taxonomyList`, and `configDefinitionList`. Do not use plural collection identifiers such as `games`, `taxonomyTerms`, or `definitions`. Framework-owned keys and external protocol fields retain the names required by their contracts.

## Local Setup

Update the provided `.env` for your local environment, then run commands from the repository root:

```bash
pnpm install
pnpm --filter scholark-portal-api start:dev
```

The HTTP API listens on port `3001` by default. Its health endpoint is `GET /api/v1/health`.

Swagger UI is available at `http://localhost:3001/api/v1/doc`. The OpenAPI JSON document is available at `http://localhost:3001/api/v1/doc-json`.

## Configuration

Environment variables are validated at startup and exposed through namespaced Nest configuration.

The committed `.env` provides local defaults. Set `NODE_ENV=stage` to load the ignored `.env.stage` before `.env`; this applies to both the NestJS application and MikroORM CLI commands.

Print a complete dotenv payload with `.env.stage` overlaid on `.env` for deployment import:

```bash
pnpm --silent --filter scholark-portal-api env:export:stage
```

Configuration files under `src/config` are loaded automatically. Each file must default-export a Nest `registerAs` factory and may export an `envSchema` object; all discovered schemas are merged for startup validation, and duplicate environment-variable definitions fail fast.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MIKRO_ORM_DATABASE_URL` | Yes | - | PostgreSQL connection URL |
| `MIKRO_ORM_DEBUG` | No | `false` | Enable MikroORM debug logging |
| `REDIS_URL` | Yes | - | Redis connection URL for browser-session storage |
| `AUTH_SESSION_SECRET` | Yes | - | Secret used to sign browser-session cookies |
| `AUTH_JWT_SECRET` | Yes | - | Secret used by the available JWT auth transport |
| `AUTH_COOKIE_SECURE` | No | `false` | Send the browser-session cookie only over HTTPS |
| `AUTH_COOKIE_SAME_SITE` | No | `strict` | Browser-session cookie policy: `strict`, `lax`, or `none` |
| `AUTH_SESSION_REDIS_PREFIX` | No | `scholark:session:` | Redis key prefix used for browser sessions |
| `CORS_ORIGIN` | No | Reflect request origin | Comma-separated allowed web origins |
| `PORT` | No | `3001` | HTTP listen port |
| `ROUTER_BASE_URL` | No | `api` | Base URL used when generating API links |
| `TRUST_PROXY` | No | `false` | Trust Express proxy headers |

## Validation

```bash
pnpm --filter scholark-portal-api check-types
pnpm --filter scholark-portal-api lint
pnpm --filter scholark-portal-api test
pnpm --filter scholark-portal-api build
```

## Database

Migrations are generated in `src/migration`:

```bash
pnpm --filter scholark-portal-api migration:create
pnpm --filter scholark-portal-api migration:up
pnpm --filter scholark-portal-api migration:down
```

Populate or refresh the local catalog with the game and taxonomy fixture data:

```bash
pnpm --filter scholark-portal-api seed
```

The seed is idempotent: it updates the seven fixture games and their taxonomy
associations without deleting unrelated games or taxonomy terms.

Do not enable automatic schema synchronization in production.

See the [portal deployment guide](../../doc/deployment.md) for the Vercel, Render, Neon, and Upstash configuration.

See [MikroORM notes](doc/notes/mikro-orm.md) for CLI loader, metadata,
entity-modeling, and local database troubleshooting details.
