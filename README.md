# Photo App

A photo upload and comment web app. Users sign in with Google, upload photos to Cloudinary, and comment on photos. Implemented as a small distributed system: a Next.js frontend that doubles as an API gateway, two Express microservices, and PostgreSQL.

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

| Layer         | Choice                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| Frontend      | Next.js 15 (App Router), React 19, TypeScript, Ant Design 5                                             |
| API gateway   | Next.js API routes (server components + route handlers)                                                 |
| Backend       | Two Express 4 services, Prisma 5 ORM, layered architecture (controller → service → repository)          |
| Auth          | NextAuth (Google provider) → app-issued JWT (HS256) + rotating refresh tokens                           |
| Database      | PostgreSQL 16 (Neon in production), one DB with two schemas — one per service                           |
| Image storage | Cloudinary (signed direct upload, transformations, CDN)                                                 |
| Validation    | Zod schemas shared across frontend + gateway + services                                                 |
| API docs      | OpenAPI 3.1 generated from Zod via `zod-to-openapi`, Swagger UI per service + aggregated at `/api/docs` |
| Logging       | pino (JSON), strict redaction of secrets/PII, request-id propagation across services                    |
| Metrics       | `prom-client`, `/metrics` endpoint per service (Prometheus format)                                      |
| Testing       | Vitest + supertest integration tests against a real Postgres                                            |
| CI/CD         | GitHub Actions (lint/typecheck/test/audit/openapi-drift) → Vercel + Render + Neon                       |

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

## Deployment

Production runs on three providers, wired together by GitHub Actions:

| Component | Host | URL |
| --- | --- | --- |
| Frontend (Next.js + gateway) | Vercel | _filled in on first deploy_ |
| `user-service` | Render (Web Service) | _internal_ |
| `photo-service` | Render (Web Service) | _internal_ |
| Database | Neon PostgreSQL (one DB, two schemas) | — |
| Image storage | Cloudinary | — |

**CI/CD** (`.github/workflows/`):

- `ci.yml` — runs on every PR and push to `main`: lint, typecheck, build, full vitest suite against an ephemeral Postgres 16 service, OpenAPI drift check, `pnpm audit`.
- `deploy.yml` — runs on push to `main`: applies Prisma migrations to Neon for both services, then triggers Render deploy hooks. Vercel auto-deploys via its native GitHub integration.

**Required GitHub repository secrets:**

| Secret | Used by | Purpose |
| --- | --- | --- |
| `CI_JWT_SECRET` | CI | 32+ char HS256 secret for user-service tests |
| `CI_JWT_REFRESH_SECRET` | CI | 32+ char HS256 secret for refresh-token tests |
| `NEON_DATABASE_URL_USERS` | Deploy | Neon URL with `?schema=users` |
| `NEON_DATABASE_URL_PHOTOS` | Deploy | Neon URL with `?schema=photos` |
| `RENDER_DEPLOY_HOOK_USER` | Deploy | Render deploy-hook URL for user-service |
| `RENDER_DEPLOY_HOOK_PHOTO` | Deploy | Render deploy-hook URL for photo-service |

**Provider-side environment variables** (set in each provider's dashboard, not GitHub):

- **Render — `user-service`:** `DATABASE_URL` (Neon, `?schema=users`), `JWT_SECRET`, `JWT_REFRESH_SECRET`, `INTERNAL_SERVICE_SECRET`, `PORT=4001`.
- **Render — `photo-service`:** `DATABASE_URL` (Neon, `?schema=photos`), `JWT_SECRET` (same as user-service), `INTERNAL_SERVICE_SECRET` (same), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET=photo_app_signed`, `PORT=4002`.
- **Vercel — web:** `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your Vercel domain), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `USER_SERVICE_URL` (Render user URL), `PHOTO_SERVICE_URL` (Render photo URL), `INTERNAL_SERVICE_SECRET` (must match the two Render services).

Google Cloud Console must whitelist `https://<vercel-domain>/api/auth/callback/google` as an OAuth 2.0 redirect URI.

## Live URL

[https://photo-app-web-pfes.vercel.app/login_
](https://photo-app-web-pfes.vercel.app/login)
## License

Private take-home project.
