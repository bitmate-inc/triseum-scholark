# Backend Patterns

Use existing code in the same ScholArk API feature as the authoritative example. The API uses NestJS with MikroORM and app-local database helpers; examples based on other ORMs are not interchangeable.

## Entities

- Entity decorators in current models commonly come from `@mikro-orm/decorators/legacy`; follow the imports used by the neighboring entities.
- Model relations with MikroORM relation decorators and use `@Embedded` for value objects such as `Money` where established.
- Keep simple domain behavior on the model when it matches nearby practice. Do not put persistence queries in entities.
- Preserve existing unique constraints, delete rules, nullable behavior, defaults, and lifecycle hooks. Check the database behavior and tests when changing them.

## Commands and Queries

- Use injectable command and query classes for use-case behavior; they are plain Nest providers, not framework command-bus handlers unless a local implementation explicitly says otherwise.
- Keep each class focused on one operation. Validate inputs and expected domain conditions using the feature's existing result/error conventions.
- Commands coordinate state changes and persistence. Respect existing transaction and idempotency boundaries, especially for payment webhooks, code redemption, and license creation.
- Queries own read composition and may use MikroORM query builders when the existing query pattern calls for them.
- Do not put business workflows in controllers or technical infrastructure.

## Repositories

- Prefer the feature repository when it provides the operation needed. Current repositories may extend app-local abstractions such as `MikroOrmEntityRepository` and use `MikroOrmTransactionContext`.
- Read the constructor and method conventions of the nearest repository before adding one.
- Queries can inject MikroORM `EntityRepository<T>` directly where the local query pattern does so.
- Keep repository operations persistence-focused; do not make one repository orchestrate another feature's business workflow.

## Naming and Placement

Follow neighboring file names and paths under `src/app/core/feature/<feature>/`, typically `command/`, `query/`, `model/`, and `repository/`. Do not move or rename existing modules solely to impose a new naming scheme.

## Verification

For changes involving persistence, inspect entity metadata, existing tests, and relevant PostgreSQL behavior. Use focused API tests first, then the API checks documented in `apps/scholark-portal-api/README.md` as needed.
