# Grounding Rules

These rules apply when working anywhere in the ScholArk monorepo.

## Verify Before Implementing

- Search for a working example in the same app and feature. Confirm imports, method signatures, transaction behavior, response types, and tests from source.
- Do not infer an endpoint contract, relation, constraint, status transition, or authorization rule from a name alone.
- Treat `doc/model-er-digram.md` as a useful overview, not the final authority when it differs from current entities, migrations/schema state, or tests.
- Treat generated OpenAPI client output as derived. Update the server contract and regenerate through the documented script rather than editing generated declarations.

## Framework and Persistence

- The portal API uses NestJS, MikroORM, PostgreSQL, and app-local MikroORM abstractions. Use the imports and repository implementation present in the touched feature.
- Use the imports and decorators present in the touched app. Do not invent package exports or copy imports from unrelated repositories.
- Command/query classes are ordinary Nest providers in the documented API architecture. Confirm nearby patterns before introducing a bus, handler, or new abstraction.

## High-Risk Domain Areas

Before modifying payment, acquisition, code redemption, licensing, or game launch:

- Trace the full flow from HTTP request through command/query, persistence, external integration, and response.
- Preserve webhook signature verification, idempotency, transaction boundaries, entitlement checks, and current license time-window semantics.
- Check for tests covering retries, duplicate requests, authorization, expired records, and failure states. Add focused coverage for changed behavior.
- Do not change pricing or payer semantics based on UI text alone; verify the offer, payment attempt, acquisition, and license models together.

## When Evidence Is Missing

State the uncertainty and inspect another nearby implementation, test, or configuration source. Do not fill gaps with assumed conventions.
