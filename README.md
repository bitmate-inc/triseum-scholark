# Skolark

Skolark is a TypeScript monorepo containing the Skolark portal, backend services, and shared packages.

## Applications and packages

### Applications

- `skolark-portal-web` — Next.js portal application
- `skolark-portal-api` — NestJS portal services API

### Shared packages

- `@repo/ui` — shared React component library
- `@repo/eslint-config` — shared ESLint configuration
- `@repo/typescript-config` — shared TypeScript configuration

## Technology stack

- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Turborepo](https://turborepo.com/)
- [pnpm](https://pnpm.io/)
- [ESLint](https://eslint.org/)

## Prerequisites

Install the following tools before working with the project:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)

## Getting started

Clone the repository and install its dependencies:

```sh
git clone <repository-url>
cd skolark
pnpm install
```

## Development

Start all applications and packages in development mode:

```sh
pnpm dev
```

Start only the portal web application:

```sh
pnpm dev --filter=skolark-portal-web
```

Start only the portal API:

```sh
pnpm dev --filter=skolark-portal-api
```

## Build

Build the entire monorepo:

```sh
pnpm build
```

Build a specific application:

```sh
pnpm build --filter=skolark-portal-web
pnpm build --filter=skolark-portal-api
```

## Linting

Lint all applications and packages:

```sh
pnpm lint
```

Lint a specific application:

```sh
pnpm lint --filter=skolark-portal-web
pnpm lint --filter=skolark-portal-api
```

## Type checking

Run TypeScript checks across the monorepo:

```sh
pnpm check-types
```

## Project structure

```text
skolark/
├── apps/
│   ├── skolark-portal-web/    # Next.js portal
│   └── skolark-portal-api/    # NestJS API
├── packages/
│   ├── ui/                    # Shared React components
│   ├── eslint-config/         # Shared ESLint configuration
│   └── typescript-config/     # Shared TypeScript configuration
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Running filtered tasks

Turborepo filters can be used to run any supported task for one application or package:

```sh
pnpm exec turbo <task> --filter=<package-name>
```

For example:

```sh
pnpm exec turbo build --filter=skolark-portal-web
```

Refer to the [Turborepo filtering documentation](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters) for additional filtering options.