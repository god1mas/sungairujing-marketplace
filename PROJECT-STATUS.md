# Project Status

## Current Phase

Phase 6 — Merchant Dashboard — **COMPLETED**

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
- Sub-Phase 4A — Public Shell — **COMPLETED**
- Sub-Phase 4B — Catalog — **COMPLETED**
- Sub-Phase 4C — Product Detail — **COMPLETED**
- Sub-Phase 4D — Merchant Pages — **COMPLETED**
- Phase 5 — Cart & WhatsApp Checkout — **COMPLETED**
- Sub-Phase 6A — Dashboard — **COMPLETED**
- Sub-Phase 6B — Products — **COMPLETED**
- Sub-Phase 6C — Product Upload — **COMPLETED**
- Sub-Phase 6D — Merchant Profile — **COMPLETED**
- Sub-Phase 6E — Suspension Rules — **COMPLETED**
- Phase 7 and later — **NOT STARTED**

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
- Anonymous-first shared public layout separated from auth, merchant, and admin areas
- Responsive public header, mobile navigation, footer, skip link, and account-aware entry point
- Homepage hero, semantic search entry point, factual about section, and public SEO metadata
- Server-rendered public product catalog with shareable search, filter, sort, and pagination parameters
- Centralized public eligibility enforcement for active products belonging to active merchants
- Responsive ProductCard with public-media URL resolution, safe image fallback, and explicit availability state
- Active category homepage links and database-backed category and merchant filter options
- Safe catalog empty, loading, and unavailable states without fabricated product data
- Public product detail route with catalog-equivalent eligibility enforcement and safe not-found behavior
- Responsive product gallery using ordered public ProductImage records and factual image fallback
- Product detail information for name, price, unit, description, category, availability, merchant, and merchant address
- Eligible-product metadata with canonical and Open Graph data that does not expose hidden products
- Public all-merchants listing and `/merchant/{slug}` profile routes restricted to active merchants
- Merchant profile presentation for logo, verification, description, address, operational status, opening hours, and general WhatsApp contact
- Merchant product listings that reuse centralized public-product eligibility and existing ProductCard behavior
- Safe merchant logo, product-empty, unavailable, not-found, and protected metadata states
- Versioned Zustand cart persistence containing only product, merchant, and quantity identifiers
- Accountless multi-merchant cart grouped for independent per-merchant checkout
- Server-authoritative cart revalidation for product visibility, merchant ownership, availability, price, and contact data
- Buyer checkout form with conditional delivery address and no persisted buyer or order data
- Centralized WhatsApp checkout message and `wa.me` URL generation with cryptographically random communication references
- Explicit estimated-product-total language without shipping calculation, payment, transaction, or sales claims
- Authenticated merchant dashboard shell with responsive compact navigation
- Tenant-scoped dashboard overview counts for total, available, and suspended products
- Factual zero-product, loading, and safe dashboard error states
- Tenant-scoped merchant product list with availability, moderation, category, price, and safe image states
- Product create and edit flows with server-side Zod validation and active-category enforcement
- Stable server-generated product slugs with collision handling and no approval queue
- Tenant-scoped permanent product deletion with explicit confirmation and public-media cleanup attempt
- Product ownership enforcement for list, edit reads, updates, and deletes
- Tenant-scoped product image upload and management using the existing Phase 3 processing and storage pipeline
- Server-enforced five-image limit with deterministic ordering and exactly-one-cover behavior
- Failure compensation for uploaded objects and truthful storage-cleanup outcomes
- Tenant-scoped merchant profile editor for allowed public identity fields
- Structured weekly opening-hours editor and independent operational-status controls
- Read-only login WhatsApp, slug, and verification presentation with protected admin fields
- Merchant logo replacement through the existing Phase 3 processing pipeline and cleanup compensation
- Dashboard integration of the existing Phase 2 account/change-password destination
- Shared merchant suspension banner with merchant-visible reason and no internal moderation metadata
- Coherent suspended-merchant read-only dashboard state across products, images, and profile management
- Centralized active-merchant mutation enforcement retained for all public-content mutations
- Public merchant/product and stale-cart suspension safeguards verified through authoritative server filters

## In Progress

- No phase is currently in progress. Phase 6 is complete; Phase 7 has not started.

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
- `npm run lint`: PASS at Sub-Phase 4A
- `npm run typecheck`: PASS at Sub-Phase 4A
- `npm run format:check`: PASS at Sub-Phase 4A
- `npm run test`: PASS at Sub-Phase 4A (137 tests)
- `npm run build`: PASS at Sub-Phase 4A
- `npm run lint`: PASS at Sub-Phase 4B
- `npm run typecheck`: PASS at Sub-Phase 4B
- `npm run format:check`: PASS at Sub-Phase 4B
- `npm run test`: PASS at Sub-Phase 4B (146 tests)
- `npm run test:e2e`: PASS at Sub-Phase 4B (3 Chromium smoke tests)
- `npm run build`: PASS at Sub-Phase 4B
- `npm audit --audit-level=high`: PASS at Sub-Phase 4B (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 4C
- `npm run typecheck`: PASS at Sub-Phase 4C
- `npm run format:check`: PASS at Sub-Phase 4C
- `npm run test`: PASS at Sub-Phase 4C (156 tests)
- `npm run test:e2e`: PASS for available Sub-Phase 4C smoke coverage (4 Chromium tests); eligible seeded-product navigation was not run because disposable PostgreSQL was unavailable
- `npm run build`: PASS at Sub-Phase 4C
- `npm audit --audit-level=high`: PASS at Sub-Phase 4C (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 4D / Phase 4 closure
- `npm run typecheck`: PASS at Sub-Phase 4D / Phase 4 closure
- `npm run format:check`: PASS at Sub-Phase 4D / Phase 4 closure
- `npm run test`: PASS at Sub-Phase 4D / Phase 4 closure (168 tests)
- `npm run test:e2e`: PASS for available Phase 4 smoke coverage (6 Chromium tests); database-backed merchant navigation was not run because disposable PostgreSQL was unavailable
- `npm run build`: PASS at Sub-Phase 4D / Phase 4 closure
- `npm audit --audit-level=high`: PASS at Phase 4 closure (0 vulnerabilities)
- `npm run lint`: PASS at Phase 5 closure
- `npm run typecheck`: PASS at Phase 5 closure
- `npm run format:check`: PASS at Phase 5 closure
- `npm run test`: PASS at Phase 5 closure (184 tests)
- Phase 5 Playwright smoke coverage: PASS (2 Chromium tests); database-backed checkout navigation was not run because disposable PostgreSQL was unavailable
- `npm run build`: PASS at Phase 5 closure
- `npm audit --audit-level=high`: PASS at Phase 5 closure (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 6A
- `npm run typecheck`: PASS at Sub-Phase 6A
- `npm run format:check`: PASS at Sub-Phase 6A
- `npm run test`: PASS at Sub-Phase 6A (190 tests)
- Phase 6A Playwright authorization smoke coverage: PASS (1 Chromium test); authenticated database-backed dashboard rendering was not run because disposable PostgreSQL was unavailable
- `npm run build`: PASS at Sub-Phase 6A
- `npm audit --audit-level=high`: PASS at Sub-Phase 6A (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 6B
- `npm run typecheck`: PASS at Sub-Phase 6B
- `npm run format:check`: PASS at Sub-Phase 6B
- `npm run test`: PASS at Sub-Phase 6B (209 tests)
- Phase 6A–6B Playwright authorization smoke coverage: PASS (2 Chromium tests); authenticated database-backed Product CRUD was not run because disposable PostgreSQL was unavailable
- `npm run build`: PASS at Sub-Phase 6B
- `npm audit --audit-level=high`: PASS at Sub-Phase 6B (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 6C
- `npm run typecheck`: PASS at Sub-Phase 6C
- `npm run format:check`: PASS at Sub-Phase 6C
- `npm run test`: PASS at Sub-Phase 6C (220 tests)
- Phase 6C external Supabase/database-backed browser coverage: LIMITED because local provider credentials are unavailable; deterministic unit/integration coverage passed
- `npm run build`: PASS at Sub-Phase 6C
- `npm audit --audit-level=high`: PASS at Sub-Phase 6C (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 6D
- `npm run typecheck`: PASS at Sub-Phase 6D
- `npm run format:check`: PASS at Sub-Phase 6D
- `npm run test`: PASS at Sub-Phase 6D (236 tests)
- Phase 6A–6D Playwright authorization smoke coverage: PASS (4 Chromium tests); authenticated database/Supabase-backed profile editing was not run because local external infrastructure is unavailable
- `npm run build`: PASS at Sub-Phase 6D
- `npm audit --audit-level=high`: PASS at Sub-Phase 6D (0 vulnerabilities)
- `npm run lint`: PASS at Sub-Phase 6E / Phase 6 closure
- `npm run typecheck`: PASS at Sub-Phase 6E / Phase 6 closure
- `npm run format:check`: PASS at Sub-Phase 6E / Phase 6 closure
- `npm run test`: PASS at Sub-Phase 6E / Phase 6 closure (243 tests)
- Phase 6 Playwright authorization smoke coverage: PASS (4 Chromium tests); authenticated suspended-merchant browser coverage was not run because local database/provider infrastructure is unavailable
- `npm run build`: PASS at Sub-Phase 6E / Phase 6 closure
- `npm audit --audit-level=high`: PASS at Phase 6 closure (0 vulnerabilities)

## Build Status

PASS — Phase 6 merchant dashboard verified and completed

## Last Commit

`2ca76ea feat: build public marketplace experience`

## Next Action

Await approval for the Phase 6 Git checkpoint. Do not begin Phase 7 — Merchant Verification automatically.
