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
- `education/` — Institutions, courses, classrooms, instructors, classroom game listings, acquisition codes, classroom grading rules, and grade results.
- `game/` — Games, versions and customizations; acquisition, checkout, payment/webhook processing, licenses, launch tickets, play events, and game state.
- `media/` — Shared media metadata for image and video assets.
- `publisher/` — Publisher records and publisher membership.
- `taxonomy/` — Classification terms used to organize and discover games.
- `user/` — Portal user records and user profile read/update operations.

Instructor grading rules are revisioned per ClassroomGameListing and calculate a numeric result from a license-scoped GameProgressSnapshot. LMS file export remains format-specific work; the pilot LMS format and stable external student identifier must be selected before an export adapter is added.

Instructors publish a new rule revision with `POST /api/v1/instructor/me/classrooms/{classroomId}/game-listings/{classroomGameListingId}/grading-rules`. The classroom response includes current progress, the latest result for the current rule, and rule status. Rule revisions and calculated results are retained; changing progress or publishing a new rule recalculates without rewriting prior results.

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

The game origin serves the one-time ticket exchange and versioned runtime API at `/api/v1/game/launch/exchange`, `/api/v1/game/config`, `/api/v1/game/events`, `/api/v1/game/state`, and `/api/v1/game/progress`, as well as proxied game content under `/api/v1/game/content/`. Each Game Version defines its section hierarchy, labels, and metric definitions in its admin-managed `progressStructure`. Games report only the configured `sectionIndex` and metric values; ScholArk resolves labels and possible points from the licensed Game Version. `PUT /api/v1/game/progress` replaces the progress snapshot for the authenticated license. Completion percentages are stored as supplied and are not converted using a global threshold. Resume state remains separate at `/api/v1/game/state`. The proxy resolves its upstream from the licensed Game Version's admin-managed `runUrl`; publisher-domain verification and protection from internal-network destinations remain open security design work. HTTP upstreams are disabled by default; enabling them permits unencrypted API-to-game traffic and should be limited to legacy development/test builds.

For example, the Game Version can define this structure:

```json
{
	"schemaVersion": 1,
	"sectionList": [
		{ "sectionIndex": "0", "label": "Act 1", "metricList": [{ "key": "points", "label": "Points", "pointsPossible": 120 }] },
		{ "sectionIndex": "0.0", "label": "Scene 1", "metricList": [{ "key": "points", "label": "Points", "pointsPossible": 60 }] }
	]
}
```

The game then sends progress using those dotted indices and metric keys:

```json
{
	"schemaVersion": 1,
	"summary": {
		"completionPercent": 54,
		"playTimeSeconds": 32394,
		"sessionCount": 26,
		"metrics": { "totalPoints": 108 }
	},
	"sectionList": [
		{ "sectionIndex": "0", "metrics": { "points": 120 }, "completionPercent": 60 },
		{ "sectionIndex": "0.0", "metrics": { "points": 40.5 } }
	]
}
```

Section indices follow the configured hierarchy (`0` is a top-level section and `0.0` is its first child). Each parent index must exist in the Game Version structure, and section indices and metric keys must be valid and unique within a snapshot. The progress `schemaVersion` must match the configured structure. A later request replaces the whole snapshot. Missing metric values remain unknown; ScholArk does not infer a completion boolean from a platform-wide threshold.

## Validation

```bash
pnpm --filter scholark-portal-api check-types
pnpm --filter scholark-portal-api lint
pnpm --filter scholark-portal-api test
pnpm --filter scholark-portal-api build
```

## Database

Prepare a local database by safely adding/updating its schema from the current entities and running the default fixture seeder. The schema update does not drop existing tables or columns:

```bash
pnpm db:setup
```

The seed is idempotent and refreshes the development fixtures without resetting the database. To seed again without changing the schema, run `pnpm db:seed`.
`pnpm db:setup` runs the schema update and the default full fixture set. To update the schema and choose a seed profile manually, run `pnpm db:schema:update`, then one of:

```bash
pnpm db:seed
pnpm db:seed:triseum-catalog
pnpm db:seed:triseum-classroom
```

`db:seed` runs the full default development fixture set. `db:seed:triseum-catalog` seeds only user1 as admin and the ARTé: Mecenas, ARTé: Lumière, and ARTé: Hemut games with their versions. `db:seed:triseum-classroom` seeds those games and versions, the admin and teacher accounts, one institution and classroom, one assigned game, and one acquisition for user1. Seeds are additive; use a clean database when you need only one profile's records.

To discard and rebuild local PostgreSQL data, run `pnpm db:reset`. This drops and recreates the PostgreSQL schema without seeding, and preserves MinIO and other Docker volumes. Run one of the seed commands above afterward. Do not run this against a database containing data you need.

Schema synchronization is for local development only. Do not use it as a production schema deployment process.

See the [portal deployment guide](../../doc/deployment.md) for the Vercel, Render, Neon, and Upstash configuration.

See [MikroORM notes](doc/notes/mikro-orm.md) for CLI loader, metadata,
entity-modeling, and local database troubleshooting details.
