# Project Status

## Current Phase

Phase 3 — Storage & Upload Infrastructure — **COMPLETED**

## Sub-Phase Status

- Sub-Phase 0.1 — Next.js Project Bootstrap — **COMPLETED**
- Sub-Phase 0.2 — Repository & Architecture Foundation — **COMPLETED**
- Sub-Phase 0.3 — Design System Foundation — **COMPLETED**
- Sub-Phase 0.4 — Testing & Code Quality Foundation — **COMPLETED**
- Sub-Phase 0.5 — Final Verification & Phase Closure — **COMPLETED**
- Sub-Phase 1.1 — Database Requirements Audit & Prisma Foundation — **COMPLETED**
- Sub-Phase 1.2 — Core Database Schema — **COMPLETED**
- Sub-Phase 1.3 — Supporting Database Schema & Constraints — **COMPLETED**
- Sub-Phase 1.4 — Migration & Seed — **COMPLETED**
- Sub-Phase 1.5 — Final Database Audit & Phase Closure — **COMPLETED**
- Sub-Phase 2A — Auth Infrastructure — **COMPLETED**
- Sub-Phase 2B — Registration — **COMPLETED**
- Sub-Phase 2C — Login & Session — **COMPLETED**
- Sub-Phase 2D — Authorization — **COMPLETED**
- Sub-Phase 2E — Account Settings & Phase Closure — **COMPLETED**
- Sub-Phase 3A — Supabase Storage Foundation — **COMPLETED**
- Sub-Phase 3B — Image Processing — **COMPLETED**
- Sub-Phase 3C — Private Evidence — **COMPLETED**
- Phase 4 and later — **NOT STARTED**

## Completed

- Next.js App Router bootstrap
- React and TypeScript strict mode
- Tailwind CSS and ESLint configuration
- Minimal placeholder homepage
- npm lockfile
- Repository metadata, README, and environment template
- Baseline source directory architecture
- Base color, typography, spacing, radius, shadow, and semantic tokens
- Accessible root layout and responsive foundation placeholder
- Prettier formatting configuration
- Vitest and React Testing Library component test foundation
- Playwright smoke E2E foundation
- Standard lint, typecheck, format, unit test, E2E, and build scripts
- Full Phase 0 repository, dependency, architecture, and scope-leak audit
- Phase 0 quality gate and Chromium smoke E2E verification
- Database requirements audit covering all 16 explicitly named business entities
- Prisma Client and CLI foundation targeting PostgreSQL
- Database environment template and Prisma lifecycle scripts
- Core Prisma models for users, merchants, memberships, categories, products, and product images
- Core database enums, relations, indexes, and physical snake_case mappings
- Owner Name requirement reconciled as the required `users.name` column
- Supporting Prisma models for verification, analytics events, reports, moderation, notifications, banners, featured merchants, and password reset
- Complete 16-model database baseline with supporting enums, relations, and indexes
- Custom migration requirements documented for the future migration sub-phase
- Initial 16-table PostgreSQL migration with all six reviewed custom SQL requirements
- Idempotent development seed for Super Admin, categories, merchants, products, images, banner, and featured merchants
- Disposable PostgreSQL migration, constraint behavior, and seed verification
- Clean PostgreSQL reproducibility, seed idempotency, secret, dependency, and full Phase 1 closure audit
- Auth.js Credentials and JWT session foundation
- Deterministic Indonesian WhatsApp normalization and Argon2id password utilities
- Centralized authentication repository/service and typed safe session identity
- Development-only in-memory rate-limit primitive with production fail-closed behavior
- Merchant self-registration with shared Zod validation and canonical WhatsApp identity
- Atomic User, active unverified Merchant, and OWNER membership creation
- Accessible merchant registration page with safe errors and redirect-to-login behavior
- Registration requirement reconciliation that defers private evidence to the later verification/storage flow
- Merchant and Super Admin login through Auth.js Credentials with generic errors
- Eight-hour minimal JWT session lifecycle, typed server session helper, and Auth.js logout component
- Production Upstash login rate limiting with hashed identifier/IP keys and fail-safe configuration
- Accessible role-aware login UI with registration-success feedback
- Server-only authentication, global-role, membership, OWNER, and tenant-ownership authorization helpers
- Database-backed account-version and active-membership checks with revocation-safe behavior
- Protected `/dashboard` and `/admin` route foundations with minimal non-indexed placeholders
- Tenant-scoped resource query pattern and explicit cross-tenant negative coverage
- Authenticated merchant and Super Admin account-security routes
- Current-password verification and Argon2id password replacement scoped to the authenticated user
- Password-change session invalidation through `users.updated_at` and Auth.js sign-out
- Password-recovery core token helpers, delivery contract, and unavailable-state pages without fake delivery
- Full Phase 2 security, public-route, secret, documentation, dependency, and regression audit
- Server-only Supabase storage client and provider abstraction
- Validated public/private bucket configuration and safe generated public-media object paths
- Non-overwriting uploads, public URL restriction, and object cleanup foundation
- Supabase storage setup documentation without production credentials
- Server-only Sharp validation and optimization for product images, merchant logos, and banners
- Decoded-format verification, purpose-specific raw-size limits, safe WebP output, and metadata removal
- Public-media uploader helpers with server-generated paths and compensating batch cleanup
- Private evidence validation for JPEG, PNG, WebP, and PDF with an 8 MB per-file limit
- Tenant-scoped private evidence uploads with a maximum of three files per submission
- Five-minute authorized signed URLs for owning merchants and Super Admin
- Private bucket enforcement, server-generated evidence paths, and compensating batch cleanup
- Generic object cleanup compensation for failed database persistence callbacks

## In Progress

- No phase is currently in progress.

## Known Issues

- npm reports that the installed ESLint 9 release is no longer supported, although it is the major version selected by the current Next.js initializer and lint passes.
- npm reports pending install-script policy warnings for Prisma packages and the transitive `unrs-resolver` package; explicit `prisma generate` succeeds.
- On this Windows environment, Playwright's managed Next.js web server did not exit cleanly after a passing test; the E2E test exits successfully when run against an already-running production server.
- The documented baseline count was corrected from 15 to 16 tables after confirming all 16 named entities are required.
- Seed image records use development storage keys; their matching media assets will require the later storage integration phase.
- WhatsApp password recovery remains disabled until Meta provider credentials and an approved template are available; no delivery is simulated.
- Real Supabase projects, buckets, and credentials are not configured in this repository; external network integration was not tested in Sub-Phase 3A.

## Tests

- `prisma format`: PASS at Phase 1 closure
- `prisma validate`: PASS at Phase 1 closure
- `npm run db:generate`: PASS at Phase 1 closure
- `npm run db:deploy`: PASS on a new clean disposable PostgreSQL 17 database
- `npm run db:seed`: PASS and idempotent rerun PASS at Phase 1 closure
- `npm run lint`: PASS at Phase 1 closure
- `npm run typecheck`: PASS at Phase 1 closure
- `npm run format:check`: PASS at Phase 1 closure
- `npm run test`: PASS at Phase 1 closure (1 test)
- `npm run test:e2e`: PASS (1 Chromium smoke test)
- `npm run build`: PASS at Phase 1 closure
- `npm audit --audit-level=high`: PASS (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 2A
- `npm run typecheck`: PASS at Sub-Phase 2A
- `npm run format:check`: PASS at Sub-Phase 2A
- `npm run test`: PASS at Sub-Phase 2A (16 tests)
- `npm run build`: PASS at Sub-Phase 2A
- `npm audit --audit-level=high`: PASS at Sub-Phase 2A (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 2B
- `npm run typecheck`: PASS at Sub-Phase 2B
- `npm run format:check`: PASS at Sub-Phase 2B
- `npm run test`: PASS at Sub-Phase 2B (29 tests)
- `npm run build`: PASS at Sub-Phase 2B
- `npm audit --audit-level=high`: PASS at Sub-Phase 2B (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 2C
- `npm run typecheck`: PASS at Sub-Phase 2C
- `npm run format:check`: PASS at Sub-Phase 2C
- `npm run test`: PASS at Sub-Phase 2C (47 tests)
- `npm run build`: PASS at Sub-Phase 2C
- `npm audit --audit-level=high`: PASS at Sub-Phase 2C (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 2D
- `npm run typecheck`: PASS at Sub-Phase 2D
- `npm run format:check`: PASS at Sub-Phase 2D
- `npm run test`: PASS at Sub-Phase 2D (61 tests)
- `npm run build`: PASS at Sub-Phase 2D
- `npm run lint`: PASS at Sub-Phase 2E / Phase 2 closure
- `npm run typecheck`: PASS at Sub-Phase 2E / Phase 2 closure
- `npm run format:check`: PASS at Sub-Phase 2E / Phase 2 closure
- `npm run test`: PASS at Sub-Phase 2E / Phase 2 closure (76 tests)
- `npm run build`: PASS at Sub-Phase 2E / Phase 2 closure
- `npm audit --audit-level=high`: PASS at Phase 2 closure (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 3A
- `npm run typecheck`: PASS at Sub-Phase 3A
- `npm run format:check`: PASS at Sub-Phase 3A
- `npm run test`: PASS at Sub-Phase 3A (95 tests)
- `npm run build`: PASS at Sub-Phase 3A
- `npm audit --audit-level=high`: PASS at Sub-Phase 3A (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 3B
- `npm run typecheck`: PASS at Sub-Phase 3B
- `npm run format:check`: PASS at Sub-Phase 3B
- `npm run test`: PASS at Sub-Phase 3B (109 tests)
- `npm run build`: PASS at Sub-Phase 3B
- `npm audit --audit-level=high`: PASS at Sub-Phase 3B (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 3C / Phase 3 closure
- `npm run typecheck`: PASS at Sub-Phase 3C / Phase 3 closure
- `npm run format:check`: PASS at Sub-Phase 3C / Phase 3 closure
- `npm run test`: PASS at Sub-Phase 3C / Phase 3 closure (130 tests)
- `npm run build`: PASS at Sub-Phase 3C / Phase 3 closure
- `npm audit --audit-level=high`: PASS at Phase 3 closure (0 vulnerabilities)

## Build Status

PASS — Phase 3 storage, image-processing, and private-evidence infrastructure verified

## Last Commit

`d4a2002 feat: implement authentication and tenant authorization`

## Next Action

Await approval for the Phase 3 Git checkpoint. Do not begin Phase 4 automatically.
