# Backend Architecture

The ScholArk portal API is a NestJS modular monolith. Persistence is PostgreSQL through MikroORM. The API README is the concise architecture reference; inspect the current application modules before extending this outline.

## Main Areas

```text
apps/scholark-portal-api/src/app/
  www/                 HTTP, WebSocket, and other delivery transports
  cli/                 CLI entry point
  core/
    feature/           Business capabilities and their models/repositories
    infrastructure/    Database and external-system adapters
    shared/             Cross-cutting app utilities, only when needed
  lib/                  App-local reusable primitives
```

## Responsibilities

- Delivery code handles transport concerns, authentication/authorization, request parsing, and response mapping.
- Commands and queries coordinate one use case each. Keep controllers thin and delegate to them.
- Features own their business models, repositories, and business rules.
- Infrastructure exposes technical capabilities. Keep business workflows in feature code.
- Keep dependencies local and explicit. Before adding a shared abstraction or cross-feature dependency, inspect nearby modules and use the smallest established pattern that fits.

## Data and Documentation

- MikroORM entities and repositories are the persistence implementation. Read their current definitions before relying on a model diagram.
- `doc/model-er-digram.md` documents the domain relationships and constraints. Update it when a requested schema change makes it inaccurate, but verify the live entity and test behavior first.
- Do not enable automatic schema synchronization in production. Follow the API README and current project workflow for schema changes.

## Safe Change Procedure

1. Identify the owning feature and delivery entry point.
2. Trace the call from controller/transport to command or query and repository.
3. Check neighboring tests, transaction boundaries, and entity constraints.
4. Keep external-service integration details behind the existing infrastructure or feature boundary.
5. Run the relevant API test, type check, lint, or build command from the API README.
