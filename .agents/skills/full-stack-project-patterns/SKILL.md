---
name: full-stack-project-patterns
description: 'Use when implementing, reviewing, or debugging code in the ScholArk monorepo, especially the NestJS API, Next.js web app, admin app, MikroORM models, API integration, acquisition, or game launch flows.'
---

# Full-Stack Project Patterns

Use this skill for work in the ScholArk monorepo. Apply the conventions of the specific app or package being changed; do not assume sibling apps share identical implementation details.

## Before Changing Code

1. Read the nearest `AGENTS.md`, README, and relevant feature implementation.
2. Find a working example of the same operation in the same app and follow its imports, naming, error handling, and tests.
3. Verify current behavior in source and tests. Treat diagrams and planning documents as supporting context, not a substitute for implementation.
4. Keep changes within the owning feature and run the narrowest relevant check.

## Reference Documents

| Document | Purpose |
|---|---|
| [backend-architecture.md](./backend-architecture.md) | API layers, feature ownership, dependency direction |
| [backend-patterns.md](./backend-patterns.md) | NestJS, MikroORM entities, commands, queries, and repositories |
| [frontend-patterns.md](./frontend-patterns.md) | Next.js app structure and Redux Toolkit Query integration |
| [code-style.md](./code-style.md) | Formatting, control flow, and validation expectations |
| [no-touch.md](./no-touch.md) | Generated files and code generation workflow |
| [anti-hallucination.md](./anti-hallucination.md) | Grounding rules and common implementation hazards |

## Core Principles

- Match the existing implementation in the app being changed; do not import patterns from unrelated projects or frameworks.
- Keep HTTP controllers thin. Put one-use-case behavior in command or query classes.
- Features own their models and persistence behavior. Infrastructure provides technical integrations, not business workflows.
- Use MikroORM and the app-local database abstractions in the API.
- Treat the web app's OpenAPI-generated API file as generated. Add app-specific endpoints through the established RTK Query injection pattern.
- Confirm domain and security decisions against current code, tests, and requirements before changing acquisition, payment, licensing, or game-launch behavior.
