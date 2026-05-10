# Photo App

A photo upload and comment web app. Users sign in with Google, upload photos to Cloudinary, and comment on photos. Implemented as a small distributed system: a Next.js frontend that doubles as an API gateway, two Express microservices, and PostgreSQL.

> **Status:** in development. Implementation tracked in `docs/superpowers/plans/2026-05-10-photo-app.md` (kept locally).

---

## What it does

- Sign in with Google (NextAuth, OAuth 2.0)
- Upload JPEG/PNG/WebP images up to 5 MB to Cloudinary via signed direct upload (bytes never traverse the backend)
- Comment on photos (max 500 chars, plain text only)
- Browse a feed of all users' photos
- Visit any user's profile page to see their photos and comments
- Delete your own photos and comments (ownership enforced server-side)

## Architecture

```
┌─────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│   Browser   │─────▶│  Next.js (Vercel)    │─────▶│ user-service    │
│             │      │  - NextAuth (Google) │      │ (Express+Prisma)│
│             │      │  - API routes =      │      └─────────────────┘
│             │      │    gateway           │      ┌─────────────────┐
│             │      │  - AntD UI           │─────▶│ photo-service   │
│             │      └──────────────────────┘      │ (Express+Prisma)│
│             │                                    └─────────────────┘
│             │      ┌──────────────────────┐               │
│             │─────▶│  Cloudinary (signed  │◀──────────────┘
│             │      │  direct upload)      │   (signs upload params)
└─────────────┘      └──────────────────────┘
                                  ┌──────────────────────────┐
                                  │ Postgres (Neon)          │
                                  │  schema "users"  (svc 1) │
                                  │  schema "photos" (svc 2) │
                                  └──────────────────────────┘
```

**Auth flow:** Google → NextAuth callback POSTs the Google profile to `user-service` (gated by an internal shared secret) → user-service upserts the user, issues a 15-minute JWT (HS256) plus a 7-day refresh token (stored hashed) → tokens live inside the encrypted NextAuth session cookie → Next.js gateway forwards `Authorization: Bearer <jwt>` to backends on every request.

**Image upload flow:** Browser asks `photo-service` for a Cloudinary signature (after server-side validation of mime type and bytes), uploads the file directly to Cloudinary, then POSTs the returned `publicId`/`secure_url` back to `photo-service` to persist the row. Bytes never go through Express.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Ant Design 5 |
| API gateway | Next.js API routes (server components + route handlers) |
| Backend | Two Express 4 services, Prisma 5 ORM, layered architecture (controller → service → repository) |
| Auth | NextAuth (Google provider) → app-issued JWT (HS256) + rotating refresh tokens |
| Database | PostgreSQL 16 (Neon in production), one DB with two schemas — one per service |
| Image storage | Cloudinary (signed direct upload, transformations, CDN) |
| Validation | Zod schemas shared across frontend + gateway + services |
| API docs | OpenAPI 3.1 generated from Zod via `zod-to-openapi`, Swagger UI per service + aggregated at `/api/docs` |
| Logging | pino (JSON), strict redaction of secrets/PII, request-id propagation across services |
| Metrics | `prom-client`, `/metrics` endpoint per service (Prometheus format) |
| Testing | Vitest + supertest integration tests against a real Postgres |
| CI/CD | GitHub Actions (lint/typecheck/test/audit/openapi-drift) → Vercel + Render + Neon |

## Repository layout

This is a pnpm workspace monorepo:

```
photo-app/
├── apps/
│   └── web/                 # Next.js frontend + gateway
├── services/
│   ├── user-service/        # Express + Prisma, owns users schema
│   └── photo-service/       # Express + Prisma, owns photos schema
├── packages/
│   └── shared/              # Zod schemas, error code catalog, logger factory, OpenAPI registry
├── .github/workflows/       # CI + deploy
└── docs/                    # architecture + generated error code reference
```

## Cross-cutting concerns

- **Error codes** follow the `PA-<DOMAIN>-<NNN>` format (e.g., `PA-AUTH-003` for expired token, `PA-FILE-002` for oversize upload). Codes are immutable, defined centrally in `@photo-app/shared`, propagated to clients with a `requestId` for support traceability, and surfaced in OpenAPI per route.
- **Defense in depth on uploads** — three independent layers validate file type and size: browser (UX), `photo-service` (authoritative pre-signature check), and Cloudinary upload preset (final hard stop).
- **Sensitive data policy** — logs never contain secrets, tokens, credentials, or PII at any level. Enforced via pino `redact`, allowlist `pino-http` serializers, lint rules, and CI tests.
- **OWASP Top 10** mitigations are mapped explicitly in the architecture doc — JWT verification, ownership checks, parameterized queries, helmet + CSP, rate limiting on auth + signing endpoints, refresh-token rotation, pinned dependencies, request-id tracing, and an SSRF-free design.

## Local development

```bash
# 1. Start Postgres locally
cp docker-compose.example.yml docker-compose.yml
docker compose up -d

# 2. Per-service env files (each has its own .env.example)
cp services/user-service/.env.example  services/user-service/.env
cp services/photo-service/.env.example services/photo-service/.env
cp apps/web/.env.example               apps/web/.env

# 3. Install + migrate + run everything
pnpm install
pnpm --filter @photo-app/user-service  prisma:migrate
pnpm --filter @photo-app/photo-service prisma:migrate
pnpm dev
```

The Next.js app will be at `http://localhost:3000`. Per-service Swagger UI at `:4001/docs` and `:4002/docs`. Aggregated docs at `http://localhost:3000/api/docs`.

## Live URL

_Deployment pending — link will be added once the cloud setup is complete._

## License

Private take-home project.
