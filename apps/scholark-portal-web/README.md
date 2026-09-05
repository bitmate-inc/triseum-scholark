This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Project structure

Route-specific server rendering stays in the Next.js `app` directory. Pages own routing, metadata, static parameter generation, `notFound()` handling, server request orchestration, and page-level composition. Avoid feature components that only wrap an entire page and make an `app/**/page.tsx` a one-line delegate.

Feature directories own reusable code grouped by runtime boundary:

```text
app/
	page.tsx
	catalog/page.tsx
	game/[slug]/page.tsx

feature/
	<feature>/
		server/
			data/          # Server-only data sources and temporary mock data
			request/       # Server-only queries used by App Router pages
			component/     # Reusable server-rendered sections, when needed
		client/
			component/     # Interactive components marked with "use client"
			hook/          # Client-only hooks
		shared/
			component/     # Reusable components without server-only dependencies
			model/         # Serializable models, types, and pure helpers
```

### Naming conventions

- Use kebab-case for all project source-code files and directories, except names required by a framework or tool such as `page.tsx`, `layout.tsx`, and `[slug]`.
- Keep conventional role suffixes after the kebab-case name: `get-game.request.ts`, `game.data.ts`, and `site.module.css`.
- Use `PascalCase` for React component, class, and type exports: `game-card.tsx` exports `GameCard`.
- Use `camelCase` for functions and local values.
- Prefix hooks with `use` while keeping the filename kebab-case: `use-catalog-search.ts` exports `useCatalogSearch`.
- Name collections with a singular noun followed by `List`: `gameList`, `tagList`, and `featuredGameList`. Do not use plural collection identifiers such as `games` or `tags`.
- Preserve external API field names in transport models when they are outside our control. ScholArk-owned API contracts follow the same singular-plus-`List` convention, including `taxonomyList`.

Current examples are split between `feature/home`, `feature/catalog`, and `feature/layout`. The home page and its route orchestration live in `app/page.tsx`, while the reusable home hero lives in `feature/home/shared/component`. Catalog data, requests, models, cards, and interactive search remain owned by `feature/catalog`. Application-shell components such as the site header and footer live in `feature/layout/shared/component`; future auth-aware requests, hooks, and components belong under the corresponding `server` or `client` boundary in that feature.

Keep dependencies directed from routes and consuming features toward the feature that owns the capability. For example, the home route may use catalog requests and shared components, but the catalog feature must not depend on the home feature.

### Feature import direction

Use these import rules inside every feature:

- `server` may import from `server` and `shared`.
- `server` may import a `client` component to render it at a Server Component boundary. Serializable data fetched on the server may be passed through props; server modules, functions, database connections, class instances, and other non-serializable values must not cross the boundary.
- `client` may import from `client` and `shared`.
- `client` must never import from `server`, including server data, requests, actions, or components.
- `shared` may import only from `shared` or runtime-neutral external packages. It must not import from `client` or `server`, use browser-only APIs, use Node.js-only APIs, or carry `"use client"`/`server-only` markers.
- `app` may compose server, client, and shared feature entry points while respecting the same runtime boundaries.

In short, both runtime sides may depend on `shared`, but `shared` cannot depend on either side and `client` cannot reach into `server`:

```text
server ──▶ shared ◀── client
	│                    ╳
	└──── render ──────▶ client
```

Server-only modules import `server-only`, and client entry points use `"use client"`.

## API client

Set `NEXT_PUBLIC_API_BASE_URL` to the NestJS API origin. It defaults to `http://localhost:3001` for local development and is used by both App Router server requests and generated RTK Query hooks.

With the API running, regenerate the RTK Query slice from its OpenAPI document:

```bash
pnpm generate:api
```

The generated file is read-only; update the API contract and rerun the generator instead of editing it directly.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
