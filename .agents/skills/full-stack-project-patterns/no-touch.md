# Generated Files and Ownership

Check the owning app's scripts and configuration before editing files that may be generated.

## Generated API Client

- `apps/scholark-portal-web/feature/api/client/api/generated-api.ts` is generated from the NestJS OpenAPI document.
- Do not edit it manually. Update the API contract and regenerate with `pnpm --filter scholark-portal-web generate:api` when the API is running at the URL configured in `rtk-query.config.cjs`.
- `apps/scholark-portal-web/feature/api/client/api/api-base.ts` is the shared RTK Query base, not the generated endpoint output. Change it only for a shared API-base concern.
- Feature endpoint modules that call `api.injectEndpoints(...)` are maintained feature code; follow the local feature pattern.

## Dependency Lockfile

- Do not edit `pnpm-lock.yaml` by hand. Use pnpm to change dependencies and let it update the lockfile.

## Ownership Checklist

Before changing a file, check its generator, owning app, local instructions, and call sites. Preserve user changes and avoid modifying generated output unless the project workflow explicitly calls for regeneration.
