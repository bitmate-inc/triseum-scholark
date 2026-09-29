# Frontend Patterns

The ScholArk portal web app uses Next.js, React, and Redux Toolkit Query. Follow the relevant app instructions and nearby code; the admin app may have different conventions.

## Next.js

- Read `apps/scholark-portal-web/AGENTS.md` before changing web code. It requires consulting the installed Next.js documentation under `node_modules/next/dist/docs/` because this app uses a version with breaking API changes.
- Preserve the existing App Router structure and server/client component boundaries. Add client-only behavior only where required by hooks, browser APIs, or interactive state.
- Keep feature code under `apps/scholark-portal-web/feature/<feature>/` and follow its existing `client/`, `server/`, and `shared/` organization.

## API Integration

- `feature/api/client/api/generated-api.ts` is generated from the NestJS OpenAPI document using `rtk-query.config.cjs`. Do not hand-edit it.
- Regenerate it with `pnpm --filter scholark-portal-web generate:api` after the API contract changes and an API with the configured OpenAPI URL is available.
- Add feature-specific endpoints by injecting them into the shared `api` instance, following files such as `feature/acquisition/client/api/acquisition-api.ts` and `feature/library/client/api/library-api.ts`.
- Use generated hooks for endpoints defined by the OpenAPI generator. Use injected endpoints for feature-specific additions, following existing naming, cache tags, request shape, and error handling.
- Keep API request/response types aligned with the backend DTOs and OpenAPI schema; do not guess payloads from UI labels or model diagrams.

## UI and State

- Reuse the components and styles already used by the app. Check the local workspace UI package and nearby views before introducing a new primitive or styling convention.
- Keep server rendering, loading, error, empty, and authenticated states consistent with nearby pages.
- Use Redux Toolkit Query for server state where established. Do not create duplicate ad hoc fetch state for an endpoint already managed by the shared API.

## Checks

Run the web app's `check-types`, `lint`, or `build` script as appropriate. For Next.js changes, follow the installed version's documentation and the local `AGENTS.md` instructions.
