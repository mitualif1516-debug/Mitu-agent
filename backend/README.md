# Mitu backend export

This directory is the GitHub-facing backend boundary for the Mitu ecosystem.

## Contents

- `api-server/` — Express API routes, database-backed Mitu services, and production bundling.
- `admin-dashboard/` — React/Vite Mitu Control Room web panel.
- `shared/api-spec/` — OpenAPI source of truth.
- `shared/api-zod/` — generated server validators.
- `shared/api-client-react/` — generated React Query client used by the dashboard.
- `shared/db/` — Drizzle schema and database package.

The Replit artifact directories remain available for the hosted preview workflow. This folder is a clean export snapshot for GitHub and deployment tooling. When changing an API contract, update `shared/api-spec/openapi.yaml` and regenerate the clients before changing consumers.

## Local development

From the repository root:

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/mitu-dashboard run dev
```

The API requires `DATABASE_URL` and listens on the `PORT` supplied by the host.