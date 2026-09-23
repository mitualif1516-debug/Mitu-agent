# Mitu AI Assistant

Mitu is a Bengali-first hands-free assistant ecosystem with a mobile companion and an admin control room for usage, subscriptions, and remote limits.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for dashboard, mobile usage, translation, and remote-config contracts.
- `lib/db/src/schema/mitu.ts` — Drizzle models for users, activity, usage events, and remote config.
- `artifacts/api-server/src/routes/` — Express handlers for dashboard, config, and mobile endpoints.
- `artifacts/mitu-dashboard/` — responsive admin control room at `/`.
- `artifacts/mitu-mobile/` — Expo companion app at `/mobile/` and Expo Go.

## Architecture decisions

- The API contract is OpenAPI-first; generated React Query hooks are shared by the web dashboard and Expo app.
- The first build uses PostgreSQL-backed Mitu tables with a small seed set so the dashboards are useful immediately.
- Mitu's fixed wake word is treated as product configuration, not a user-editable preference.
- Device-sensitive capabilities are surfaced as explicit readiness states in Expo; wake-word detection, MediaPipe, and AccessibilityService require a native Android build and real-device permission flow.

## Product

- Admins can monitor total users, free/Pro mix, activity, API health, and usage telemetry.
- Admins can search users, change plans, and publish daily action, lock-screen, gesture, translation, and auto-send limits.
- Mobile users get a Mitu orb home surface, synced free-tier limits, a translation preview, gesture mappings, and WhatsApp automation safety states.

## User preferences

- Keep the Mitu identity fixed and use the dark cyberpunk palette requested by the user.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.
- Run `pnpm --filter @workspace/db run push` after changing the Drizzle schema.
- The API is routed through `/api`; Expo uses the injected `EXPO_PUBLIC_DOMAIN` to reach the same service.
- Replit can preview the Expo app, but the Android-native services are intentionally not claimed as complete until a native build and permissions are tested on device.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
