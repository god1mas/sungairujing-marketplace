# IMPLEMENTATION PLAN
## Sungairujing Marketplace

**Version:** 1.0  
**Status:** Development Execution Baseline  
**Project:** Sungairujing Marketplace  
**Related Documents:**  
- `PRD.md`
- `BUSINESS-RULES.md`
- `USER-FLOW.md`
- `DATABASE.md`
- `DESIGN-SYSTEM.md`
- `TECHNICAL-SPEC.md`

**Primary Stack:** Next.js App Router + TypeScript + Tailwind CSS + Prisma + PostgreSQL  
**Deployment Target:** Vercel + Supabase  
**Development Style:** Incremental, test-gated, Codex-assisted  

---

# 1. Purpose

Dokumen ini menerjemahkan seluruh requirement dan technical specification menjadi urutan implementasi yang dapat dikerjakan secara bertahap.

Setiap phase harus memiliki:

- goal;
- scope;
- dependencies;
- tasks;
- files/modules yang kemungkinan disentuh;
- testing;
- exit criteria;
- recommended commit;
- batas prompt Codex.

Prinsip utama:

```text
Implement
↓
Lint
↓
Typecheck
↓
Test
↓
Build
↓
Review
↓
Commit
↓
Next Phase
```

Jangan melanjutkan ke phase berikutnya jika phase saat ini belum stabil.

---

# 2. Development Priority

Jika terjadi konflik waktu:

```text
1. Fungsi benar
2. UI/UX bagus
3. Keamanan
4. Performa
5. PWA
6. Fitur tambahan
```

Namun security baseline tetap wajib.

Tidak boleh mengorbankan:

- authentication;
- authorization;
- tenant isolation;
- password safety;
- file privacy;
- upload validation;
- suspended-state enforcement.

---

# 3. Source of Truth

Urutan acuan:

```text
Requirement Interview Final
        ↓
PRD.md
        ↓
BUSINESS-RULES.md
        ↓
USER-FLOW.md
        ↓
DATABASE.md
        ↓
DESIGN-SYSTEM.md
        ↓
TECHNICAL-SPEC.md
        ↓
IMPLEMENTATION-PLAN.md
        ↓
AGENTS.md
        ↓
Source Code
```

Jika Codex menghasilkan implementasi yang bertentangan dengan dokumen di atas, implementation harus diperbaiki.

---

# 4. Global Rules for All Phases

Setiap phase wajib:

1. membaca dokumen terkait sebelum coding;
2. tidak menambahkan fitur out-of-scope;
3. menjaga business rules yang sudah dikunci;
4. menggunakan server-side authorization;
5. menambahkan test untuk behavior kritis;
6. menjalankan build sebelum commit final;
7. memperbarui dokumentasi bila ada technical adjustment;
8. tidak melakukan refactor besar di luar scope phase;
9. tidak mengubah dependency major version tanpa alasan;
10. tidak melanjutkan jika critical test gagal.

---

# 5. Out-of-Scope Reminder

Jangan implementasikan:

```text
Buyer Account
Wishlist
Rating
Review
Payment Gateway
Internal Payment
Shipping API
Automatic Shipping Fee
Numeric Inventory
Product Variant Entity
Order Database
Order Management
Transaction History
Sales Analytics
Pre-publication Product Approval
Product QR
Multi-language
Native Mobile App
```

---

# 6. Phase Overview

Recommended sequence:

```text
Phase 0  — Repository & Application Foundation
Phase 1  — Database Schema & Seed
Phase 2  — Authentication & Authorization
Phase 3  — Storage & Upload Infrastructure
Phase 4  — Public Marketplace Foundation
Phase 5  — Cart & WhatsApp Checkout
Phase 6  — Merchant Dashboard
Phase 7  — Merchant Verification
Phase 8  — Analytics & Popular Products
Phase 9  — Reports & Moderation
Phase 10 — Super Admin Content Management
Phase 11 — Notifications, QR, Share & PWA
Phase 12 — Security Hardening & Test Expansion
Phase 13 — Production Deployment
Phase 14 — Final QA, Demo Data & Documentation
```

---

# 7. Phase 0 — Repository & Application Foundation

## Goal

Membangun project skeleton yang bersih dan stabil sebelum business feature ditambahkan.

## Scope

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- ESLint
- Prettier
- Vitest
- Playwright
- basic project structure
- environment template
- design token foundation

## Tasks

1. Initialize Next.js application.
2. Enable TypeScript strict mode.
3. Configure Tailwind CSS.
4. Configure ESLint.
5. Configure Prettier.
6. Configure Vitest.
7. Configure React Testing Library.
8. Configure Playwright.
9. Create project folder structure.
10. Add `docs/`.
11. Copy all approved documentation.
12. Create `.env.example`.
13. Create base typography and color tokens.
14. Create minimal root layout.
15. Add placeholder public homepage without final feature implementation.
16. Add standard scripts.

## Expected Structure

```text
src/
├── app/
├── components/
├── features/
├── lib/
├── repositories/
├── services/
├── constants/
└── types/
```

## Likely Files

```text
package.json
tsconfig.json
next.config.ts
eslint.config.*
prettier.config.*
vitest.config.*
playwright.config.ts
src/app/layout.tsx
src/app/globals.css
.env.example
README.md
```

## Tests

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

## Exit Criteria

- app runs locally;
- lint pass;
- typecheck pass;
- unit test runner pass;
- production build pass;
- folder architecture ready.

## Recommended Commit

```text
chore: initialize Sungairujing Marketplace foundation
```

## Codex Prompt Boundary

Codex hanya boleh mengerjakan project setup.

Jangan membuat:

- auth;
- database schema;
- marketplace features;
- dashboard;
- cart.

---

# 8. Phase 1 — Database Schema & Seed

## Goal

Membuat physical database schema berdasarkan `DATABASE.md`.

## Dependencies

Phase 0 completed.

## Scope

Prisma + PostgreSQL schema untuk:

```text
users
merchants
merchant_memberships
verification_submissions
verification_evidences
categories
products
product_images
product_view_events
whatsapp_click_events
reports
moderation_actions
notifications
banners
featured_merchants
password_reset_tokens
```

## Tasks

1. Install Prisma dependencies.
2. Configure Prisma.
3. Map business enums.
4. Implement models and relationships.
5. Configure foreign key deletion behavior.
6. Add indexes.
7. Add partial indexes through custom migration where required.
8. Create initial migration.
9. Build database client singleton.
10. Add seed script.
11. Seed Super Admin.
12. Seed categories.
13. Seed merchants.
14. Seed demo products.
15. Seed banner.
16. Seed featured merchants.

## Important Audit

Before migration:

- compare schema with `DATABASE.md`;
- verify no order-related table exists;
- verify future multi-admin support exists;
- verify reports preserve target snapshots;
- verify private evidence metadata exists.

## Likely Files

```text
prisma/schema.prisma
prisma/seed.ts
prisma/migrations/*
src/lib/db/prisma.ts
src/constants/*
```

## Tests

- schema validates;
- migration executes on empty DB;
- seed executes;
- seed can be rerun safely enough for development;
- all expected relations resolve.

Commands:

```text
npx prisma validate
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run build
```

## Exit Criteria

- all baseline tables exist;
- migration is reproducible;
- seed produces usable demo data;
- build passes.

## Recommended Commit

```text
feat: add database schema and development seed
```

## Codex Prompt Boundary

Do not implement auth UI or business pages yet.

---

# 9. Phase 2 — Authentication & Authorization

## Goal

Membuat login merchant/Super Admin yang aman dan tenant isolation foundation.

## Scope

- Auth.js credentials
- WhatsApp normalization
- Argon2id
- session
- login
- registration
- logout
- role guards
- merchant membership authorization
- change password
- account protection
- rate limiting foundation

## Tasks

1. Install Auth.js.
2. Install Argon2id package.
3. Implement WhatsApp normalizer.
4. Implement login validator.
5. Implement password hashing helpers.
6. Configure Auth.js Credentials provider.
7. Implement Merchant registration service.
8. Use DB transaction:
   - user;
   - merchant;
   - membership OWNER;
   - no verification submission/evidence during initial registration.
9. Implement login page.
10. Implement merchant registration page.
    - after success, redirect to login without creating a session;
    - collect business evidence later in the verification/storage phase.
11. Implement logout.
12. Add `requireUser`.
13. Add `requireMerchantAdmin`.
14. Add `requireSuperAdmin`.
15. Add merchant ownership helper.
16. Add suspended merchant mutation guard.
17. Add change-password flow.
18. Add Super Admin account seed-based login.
19. Add rate limit for login.

## Critical Rules

```text
WhatsApp unique
Password >= 8 chars
No OTP
No public Super Admin registration
No buyer registration
```

## Likely Files

```text
src/lib/auth/*
src/features/auth/*
src/services/auth-service.ts
src/services/merchant-registration-service.ts
src/app/(auth)/*
src/app/dashboard/layout.tsx
src/app/admin/layout.tsx
```

## Tests

### Unit

- WhatsApp normalization;
- password validation;
- login validation.

### Integration

- register merchant;
- duplicate WhatsApp rejected;
- merchant membership created;
- password hashed;
- login works.

### Authorization

```text
Unauthenticated dashboard → denied
Merchant → admin route denied
Super Admin → admin route allowed
```

## Exit Criteria

- merchant can register;
- merchant can login/logout;
- Super Admin can login;
- protected layouts work;
- duplicate WhatsApp protected;
- password is never plaintext;
- baseline authorization helpers work;
- tests pass.

## Recommended Commits

```text
feat: implement merchant authentication
feat: enforce role and merchant authorization
```

## Codex Prompt Boundary

Do not implement product CRUD in this phase.

---

# 10. Phase 3 — Storage & Upload Infrastructure

## Goal

Membuat storage aman untuk public media dan private evidence.

## Scope

- Supabase Storage
- public media
- private evidence
- Sharp
- upload validation
- signed URLs
- cleanup helpers

## Tasks

1. Configure Supabase server client.
2. Create storage helper abstraction.
3. Configure bucket names from env.
4. Implement image MIME validation.
5. Implement image size validation.
6. Implement image decode validation.
7. Implement Sharp optimization.
8. Strip EXIF metadata.
9. Implement product image uploader helper.
10. Implement merchant logo uploader helper.
11. Implement banner uploader helper.
12. Implement private evidence upload.
13. Implement signed evidence URL service.
14. Add ownership checks.
15. Add compensation cleanup on DB failure.

## Limits

### Product

```text
5 files
5 MB each
JPG/JPEG/PNG/WebP
```

### Verification Evidence

```text
3 files
8 MB each
JPG/JPEG/PNG/WebP/PDF
```

## Tests

- valid product image;
- invalid MIME rejected;
- oversized image rejected;
- >5 product images rejected;
- >3 evidence files rejected;
- evidence inaccessible without auth;
- merchant cannot access another merchant's evidence;
- Super Admin can access evidence.

## Exit Criteria

- public upload works;
- private evidence works;
- image optimization works;
- file cleanup works;
- tests pass.

## Recommended Commit

```text
feat: implement secure media and evidence storage
```

---

# 11. Phase 4 — Public Marketplace Foundation

## Goal

Membangun pengalaman visitor utama sebelum cart.

## Scope

- homepage
- catalog
- search
- filter
- sort
- product detail
- merchant list
- merchant detail
- active/suspended visibility rules

## Tasks

1. Build public navbar/footer.
2. Build hero/search.
3. Build category section.
4. Build ProductCard.
5. Build MerchantCard.
6. Build product catalog.
7. Add pagination.
8. Add search query.
9. Add category filter.
10. Add merchant filter.
11. Add availability filter.
12. Add price range filter.
13. Add sorting.
14. Build Product Detail.
15. Build Merchant Detail.
16. Build All Merchants page.
17. Implement public eligibility queries.
18. Implement HABIS state.
19. Implement unavailable/suspended state.
20. Implement responsive layouts.

## Design Rules

Follow `DESIGN-SYSTEM.md`.

Avoid:

- excessive gradients;
- glassmorphism;
- fake metrics;
- excessive animation.

## Tests

### Public Query

- suspended product hidden;
- product from suspended merchant hidden;
- HABIS product visible;
- unverified merchant visible.

### UI

- product card states;
- search result;
- empty result;
- responsive smoke test.

## Exit Criteria

Visitor can:

```text
Homepage
→ Search/Browse
→ Product Detail
→ Merchant Detail
```

with correct visibility.

## Recommended Commit

```text
feat: implement public marketplace catalog
```

---

# 12. Phase 5 — Cart & WhatsApp Checkout

## Goal

Menyelesaikan conversion flow utama.

## Scope

- Zustand cart
- localStorage persistence
- multi-merchant grouping
- cart validation
- checkout form
- fulfillment
- total estimasi
- WhatsApp message builder
- reference code
- `wa.me`

## Tasks

1. Create cart store.
2. Version cart persistence.
3. Add item.
4. Remove item.
5. Update quantity.
6. Group by merchant.
7. Build cart page.
8. Build per-merchant checkout route.
9. Revalidate cart server-side.
10. Handle deleted product.
11. Handle suspended product.
12. Handle suspended merchant.
13. Handle HABIS product warning.
14. Build buyer form.
15. Require address for `DIANTAR`.
16. Calculate authoritative product subtotal.
17. Generate reference code.
18. Build WhatsApp message.
19. Build `wa.me` link.
20. Ensure no order DB persistence.

## Critical Rule

Never create:

```text
orders
order_items
checkout table
```

## Tests

### Unit

- cart grouping;
- quantity;
- reference code;
- WhatsApp message.

### Integration

- server cart revalidation;
- current price overrides stale local state;
- invalid item blocked.

### E2E

```text
Product Detail
→ Add to Cart
→ Checkout Merchant
→ Fill Form
→ Generate Correct WhatsApp URL
```

## Exit Criteria

Core buyer journey works end-to-end.

## Recommended Commit

```text
feat: implement multi-merchant cart and whatsapp checkout
```

---

# 13. Phase 6 — Merchant Dashboard

## Goal

Merchant dapat mengelola bisnis dan produk secara mandiri.

## Scope

- overview
- product CRUD
- profile
- operational status
- account
- suspension state

## Tasks

1. Build merchant dashboard shell.
2. Build overview.
3. Show:
   - total products;
   - available products;
   - suspended products.
4. Build product list.
5. Build create product form.
6. Build edit product form.
7. Integrate image upload.
8. Implement max 5 images.
9. Implement cover image.
10. Implement delete confirmation.
11. Build merchant profile editor.
12. Build opening hours editor.
13. Build operational status.
14. Prevent login WhatsApp self-change.
15. Add account/change password section.
16. Add suspended merchant banner.
17. Enforce suspended mutation restrictions.

## Critical Security Test

```text
Merchant A
→ attempts Merchant B product mutation
→ must fail
```

## Tests

- own product create;
- own product edit;
- own product delete;
- cross-tenant access rejected;
- suspended merchant mutation rejected;
- product image count enforced.

## Exit Criteria

Merchant can manage own content safely.

## Recommended Commits

```text
feat: implement merchant product management
feat: implement merchant profile management
fix: enforce merchant resource ownership
```

---

# 14. Phase 7 — Merchant Verification

## Goal

Membuat post-registration verification workflow.

## Scope

- verification page
- evidence upload
- submission
- Super Admin review
- approve/reject
- resubmission
- verified badge

## Tasks

1. Build Merchant Verification page.
2. Display current status.
3. Add evidence uploader.
4. Enforce max 3 evidence files.
5. Create submission.
6. Build Super Admin verification list.
7. Build review detail.
8. Generate signed evidence URLs.
9. Approve submission.
10. Reject with reason.
11. Update merchant verification state.
12. Create merchant notification.
13. Allow resubmission after rejection.
14. Show badge publicly only if verified.

## Tests

- unverified merchant remains public;
- approval adds badge;
- rejection reason visible internally;
- rejected merchant can resubmit;
- evidence remains private.

## Exit Criteria

Full verification lifecycle works without blocking selling.

## Recommended Commit

```text
feat: implement merchant verification workflow
```

---

# 15. Phase 8 — Analytics & Popular Products

## Goal

Mengukur product interest dan WhatsApp interaction secara jujur.

## Scope

- visitor ID
- hashed visitor key
- product view dedupe 24h
- WhatsApp click events
- dashboard analytics
- chart
- popular products

## Tasks

1. Create visitor ID mechanism.
2. Hash visitor ID server-side.
3. Implement 24h rolling product view dedupe.
4. Add advisory lock/concurrency protection.
5. Record WhatsApp click:
   - PRODUCT_DETAIL;
   - MERCHANT_PROFILE;
   - CHECKOUT.
6. Ensure analytics failure does not block WhatsApp.
7. Build merchant analytics queries.
8. Add time filters:
   - Today;
   - 7 Days;
   - 30 Days;
   - All Time.
9. Build Recharts line chart.
10. Add Product Views.
11. Add WhatsApp Clicks.
12. Implement top 8 Popular Products.
13. Filter suspended resources.

## Tests

- repeated view <24h not counted;
- >24h view counted;
- distinct browser IDs counted;
- correct source stored;
- merchant sees only own analytics;
- popular products exclude suspended resources.

## Exit Criteria

Analytics works and no UI labels click as sale/order.

## Recommended Commit

```text
feat: implement product and whatsapp analytics
```

---

# 16. Phase 9 — Reports & Moderation

## Goal

Membuat trust/safety workflow manual.

## Scope

- public report form
- product report
- merchant report
- report statuses
- admin review
- product suspension
- merchant suspension
- reactivation
- moderation history

## Tasks

1. Build Product Report form.
2. Build Merchant Report form.
3. Add optional reporter identity.
4. Enforce OTHER reason details.
5. Add public report rate limit.
6. Build Super Admin Reports page.
7. Implement status transitions.
8. Build report detail.
9. Implement product suspension.
10. Implement merchant suspension.
11. Save suspension reason.
12. Create moderation action.
13. Create notification.
14. Implement merchant reactivation.
15. Ensure all products disappear publicly when merchant suspended.
16. Ensure reports do not auto-suspend.

## Tests

- anonymous report accepted;
- report OTHER without detail rejected;
- report does not auto-suspend;
- suspended product hidden;
- suspended merchant products hidden;
- merchant can still login while suspended;
- suspended merchant cannot mutate public content.

## Exit Criteria

Manual moderation lifecycle works and is fully server-authorized.

## Recommended Commit

```text
feat: implement reporting and moderation workflow
```

---

# 17. Phase 10 — Super Admin Content Management

## Goal

Menyelesaikan marketplace administration non-moderation.

## Scope

- merchant list/detail
- change merchant WhatsApp
- categories
- banners
- featured merchants
- admin overview
- permanent deletion flows

## Tasks

### Merchant Administration

1. Build merchant listing.
2. Build merchant detail.
3. Edit merchant as Super Admin.
4. Change merchant WhatsApp.
5. Enforce number uniqueness.
6. Sync login/public contact according to MVP rule.
7. Implement permanent delete with strong confirmation.

### Categories

8. Build category list.
9. Create category.
10. Edit category.
11. Prevent duplicate normalized names.
12. Soft disable referenced category.
13. Hard delete unreferenced category.

### Banner

14. Build banner CRUD.
15. Integrate banner image upload.
16. Add schedule.
17. Add active/inactive.
18. Add target URL validation.

### Featured Merchants

19. Build featured selector.
20. Enforce positions 1–5.
21. Enforce max 5.
22. Exclude suspended merchant publicly.

### Overview

23. Add:
   - total merchants;
   - active merchants;
   - suspended merchants;
   - total products;
   - suspended products;
   - total categories.

## Tests

- only Super Admin can access;
- WhatsApp duplicate rejected;
- banner date logic;
- unsafe URL rejected;
- max 5 featured;
- category relation protected;
- permanent delete behavior preserves report snapshot.

## Exit Criteria

Super Admin can operate all required marketplace administration.

## Recommended Commits

```text
feat: implement super admin merchant management
feat: implement category and homepage content management
```

---

# 18. Phase 11 — Notifications, QR, Share & PWA

## Goal

Menyelesaikan supporting MVP features.

## Scope

- dashboard notifications
- product share
- merchant QR
- PWA
- manifest
- installability

## Tasks

### Notifications

1. Build notification list.
2. Build unread state.
3. Mark notification read.
4. Link notifications to relevant internal pages.

### Product Share

5. Implement Web Share API.
6. Add Copy Link fallback.
7. Show feedback.

### Merchant QR

8. Generate QR from canonical merchant URL.
9. Show QR on merchant page/dashboard.
10. Add download action.

### PWA

11. Configure Serwist.
12. Add web app manifest.
13. Add app icons.
14. Add theme/background colors.
15. Add safe static caching.
16. Add offline fallback if appropriate.
17. Ensure website works normally without installation.
18. Add subtle install affordance if browser supports it.

## Tests

- share fallback;
- QR URL correct;
- suspended merchant QR target returns unavailable public state;
- PWA manifest valid;
- service worker does not cache private dashboard data improperly.

## Exit Criteria

Supporting features work without affecting core marketplace reliability.

## Recommended Commit

```text
feat: add notifications sharing merchant qr and pwa
```

---

# 19. Phase 12 — Security Hardening & Test Expansion

## Goal

Melakukan audit khusus sebelum production deployment.

## Scope

- IDOR
- session
- route protection
- file privacy
- upload attacks
- XSS
- CSRF/origin
- rate limiting
- security headers
- destructive action
- data leakage

## Tasks

1. Audit every dashboard route.
2. Audit every admin route.
3. Audit every mutation.
4. Test cross-tenant reads.
5. Test cross-tenant writes.
6. Test direct resource URL manipulation.
7. Test private evidence URL.
8. Test signed URL expiry.
9. Test file MIME spoofing.
10. Test oversized upload.
11. Test duplicate request/race cases.
12. Test suspended merchant bypass attempts.
13. Test suspended product bypass.
14. Test banner URL sanitization.
15. Add security headers.
16. Audit logs for sensitive data.
17. Confirm checkout data is not persisted/logged.
18. Run dependency audit.
19. Expand E2E critical paths.

## Mandatory Scenarios

```text
Merchant A cannot access Merchant B product.
Merchant A cannot access Merchant B evidence.
Suspended Merchant cannot publish.
Merchant cannot unsuspend admin-suspended product.
Visitor cannot access private evidence.
Super Admin-only mutation rejects merchant.
```

## Exit Criteria

No known critical authorization/privacy defect.

## Recommended Commit

```text
test: harden marketplace security and tenant isolation
```

---

# 20. Phase 13 — Production Deployment

## Goal

Mendeploy application online dalam environment production yang aman.

## Scope

- Supabase production
- storage buckets
- Vercel
- production env
- migrations
- seed Super Admin
- domain/subdomain
- smoke tests

## Tasks

1. Create production Supabase project.
2. Configure PostgreSQL.
3. Create storage buckets.
4. Configure private/public policies.
5. Configure production environment variables.
6. Create production Vercel project.
7. Configure build.
8. Run reviewed migrations.
9. Create Super Admin production account.
10. Add minimal production categories/demo content if required.
11. Verify APP_URL.
12. Verify QR production URL.
13. Verify Auth.js callback/session.
14. Verify storage.
15. Verify WhatsApp `wa.me`.
16. Verify analytics.
17. Verify PWA.
18. Run smoke tests.
19. Configure custom domain later when ready.

## Migration Flow

```text
Review migration
↓
Backup/checkpoint
↓
prisma migrate deploy
↓
Deploy
↓
Smoke test
```

## Exit Criteria

Production app can be accessed online and critical flows pass.

## Recommended Commit

```text
chore: prepare production deployment
```

---

# 21. Phase 14 — Final QA, Demo Data & Documentation

## Goal

Mempersiapkan aplikasi untuk demo, penilaian, dan penggunaan awal.

## Scope

- final content
- demo merchants/products
- UI polish
- responsive QA
- documentation
- project status
- restore/redeploy confidence

## Tasks

1. Remove placeholder content.
2. Verify Indonesian copy.
3. Verify real/demo product content.
4. Add high-quality Bawean/Sungairujing demo images.
5. Check all empty states.
6. Check all error states.
7. Check all success states.
8. Test 360px mobile width.
9. Test tablet.
10. Test desktop.
11. Test Chrome.
12. Test Edge.
13. Test Firefox.
14. Test Safari if available.
15. Run accessibility smoke audit.
16. Run Lighthouse as guidance.
17. Update README.
18. Document local setup.
19. Document deployment.
20. Document demo accounts.
21. Create/update `PROJECT-STATUS.md`.
22. Verify project can be recreated from:
    - repository;
    - migrations;
    - seed;
    - env documentation.

## Exit Criteria

Project siap demo dan dapat diteruskan tanpa bergantung pada chat history.

## Recommended Commit

```text
docs: finalize marketplace setup and project handoff
```

---

# 22. Forgot Password Implementation Timing

Forgot Password bergantung pada Meta WhatsApp Cloud API.

Implementasi dibagi:

## Core Preparation

Phase 2:

- token schema already exists;
- reset service interfaces;
- reset page skeleton;
- secure token helpers.

## External Integration

Dapat diselesaikan setelah Meta credentials/template tersedia.

Jika belum tersedia saat demo:

```text
FEATURE_WHATSAPP_PASSWORD_RECOVERY=false
```

UI tidak boleh mengklaim pesan telah dikirim.

Feature ini tidak boleh menghambat completion fitur utama marketplace.

---

# 23. Recommended Development Checkpoints

Checkpoint setelah phase besar:

```text
Checkpoint A
Phase 0–2
Foundation + DB + Auth

Checkpoint B
Phase 3–5
Storage + Public Marketplace + Checkout

Checkpoint C
Phase 6–8
Merchant Dashboard + Verification + Analytics

Checkpoint D
Phase 9–11
Moderation + Super Admin + Supporting Features

Checkpoint E
Phase 12–14
Security + Deployment + Final QA
```

---

# 24. Project Status File

Recommended create:

```text
docs/PROJECT-STATUS.md
```

atau repository root:

```text
PROJECT-STATUS.md
```

Isi minimal:

```text
Current Phase
Last Completed Phase
In Progress
Known Issues
Decisions
Tests Status
Build Status
Last Commit
Next Action
```

Contoh:

```text
Current Phase:
Phase 5 — Cart & WhatsApp Checkout

Completed:
Phase 0–4

Build:
PASS

Tests:
PASS

Known Issues:
None critical

Last Commit:
abc123 feat: implement public marketplace catalog

Next:
Implement cart store and merchant grouping
```

Tujuan:

Codex dan ChatGPT tidak bergantung pada chat memory.

---

# 25. Phase Completion Template

Setiap phase report sebaiknya menggunakan format:

```text
PHASE:
STATUS:

IMPLEMENTED:
- ...

FILES CHANGED:
- ...

TESTS:
- lint: PASS/FAIL
- typecheck: PASS/FAIL
- unit: PASS/FAIL
- integration: PASS/FAIL
- build: PASS/FAIL
- e2e: PASS/FAIL / N/A

SECURITY CHECK:
- ...

KNOWN ISSUES:
- ...

COMMIT:
- ...

NEXT PHASE:
- ...
```

---

# 26. Codex Prompt Template — Start Phase

Gunakan pola:

```text
You are implementing Phase X of Sungairujing Marketplace.

Before changing code, read:
- AGENTS.md
- docs/PRD.md
- docs/BUSINESS-RULES.md
- docs/USER-FLOW.md
- docs/DATABASE.md
- docs/DESIGN-SYSTEM.md
- docs/TECHNICAL-SPEC.md
- docs/IMPLEMENTATION-PLAN.md
- PROJECT-STATUS.md

Scope:
[exact phase scope]

Do not implement anything outside this phase.

Requirements:
[phase requirements]

Before coding:
1. inspect current repository;
2. report relevant existing files;
3. identify conflicts with documentation;
4. propose a short implementation plan.

Then implement.

Before finishing:
- run lint;
- run typecheck;
- run tests relevant to this phase;
- run production build;
- fix failures caused by your changes.

Output:
1. summary;
2. files changed;
3. tests/build result;
4. security notes;
5. remaining issues;
6. recommended commit message.

Do not proceed to the next phase.
```

---

# 27. Codex Prompt Template — Review Phase

Setelah Codex selesai:

```text
Review the implementation of Phase X against:
- AGENTS.md
- PRD.md
- BUSINESS-RULES.md
- USER-FLOW.md
- DATABASE.md
- DESIGN-SYSTEM.md
- TECHNICAL-SPEC.md
- IMPLEMENTATION-PLAN.md

Do not add new features.

Audit:
1. functional correctness;
2. security;
3. merchant tenant isolation;
4. validation;
5. error handling;
6. responsive UI;
7. scope compliance;
8. test coverage.

Run relevant checks.

Return findings ordered by severity:
CRITICAL
HIGH
MEDIUM
LOW

Fix CRITICAL and HIGH issues caused by this phase, then rerun tests/build.
```

---

# 28. Codex Prompt Size Rule

Jangan meminta Codex:

```text
"buat seluruh marketplace"
```

dalam satu prompt.

Gunakan:

```text
one phase
or
one tightly related sub-phase
```

per task.

Untuk phase besar, pecah lagi.

Contoh Phase 6:

```text
6A Dashboard shell
6B Product list
6C Create product
6D Edit/delete
6E Merchant profile
6F Security review
```

---

# 29. Phase Subdivision Recommendation

## Phase 0

```text
0A Project init
0B Tooling
0C UI tokens
```

## Phase 1

```text
1A Prisma schema
1B Migration
1C Seed
```

## Phase 2

```text
2A Auth infrastructure
2B Registration
2C Login/session
2D Authorization
2E Account settings
```

## Phase 3

```text
3A Supabase storage
3B Image processing
3C Private evidence
```

## Phase 4

```text
4A Public shell
4B Catalog
4C Product detail
4D Merchant pages
```

## Phase 5

```text
5A Cart state
5B Cart page
5C Checkout validation
5D WhatsApp handoff
```

## Phase 6

```text
6A Dashboard
6B Products
6C Product upload
6D Merchant profile
6E Suspension rules
```

---

# 30. Testing Matrix by Phase

| Phase | Unit | Integration | E2E | Build |
|---|---:|---:|---:|---:|
| 0 | Basic | — | Smoke | Yes |
| 1 | Schema helpers | DB | — | Yes |
| 2 | Yes | Yes | Auth critical | Yes |
| 3 | Yes | Yes | Upload critical | Yes |
| 4 | UI/query | Yes | Public smoke | Yes |
| 5 | Yes | Yes | Buyer critical | Yes |
| 6 | Yes | Yes | Merchant critical | Yes |
| 7 | Yes | Yes | Verification | Yes |
| 8 | Yes | Yes | Analytics smoke | Yes |
| 9 | Yes | Yes | Moderation | Yes |
| 10 | Yes | Yes | Admin critical | Yes |
| 11 | Yes | Some | PWA/share smoke | Yes |
| 12 | Security | Security | Mandatory | Yes |
| 13 | Smoke | Production | Critical flow | Yes |
| 14 | Regression | Regression | Final | Yes |

---

# 31. Critical Test Suite

Critical tests must remain green once introduced.

```text
AUTH-001
Merchant registration works.

AUTH-002
Duplicate WhatsApp rejected.

AUTH-003
Merchant cannot access admin routes.

AUTH-004
Unauthenticated user cannot access dashboard.

OWN-001
Merchant A cannot read Merchant B product.

OWN-002
Merchant A cannot edit Merchant B product.

OWN-003
Merchant A cannot access Merchant B evidence.

SUS-001
Suspended merchant can login.

SUS-002
Suspended merchant cannot publish/edit public content.

PRO-001
Suspended product is not public.

CART-001
Cart supports multiple merchants.

CART-002
Checkout remains per merchant.

CHK-001
Checkout creates no order DB record.

WA-001
WhatsApp URL contains correct merchant.

ANA-001
Same browser/product under 24h does not double count.

REP-001
Report does not auto-suspend.

VER-001
Unverified merchant may still sell.

FILE-001
Verification evidence is private.
```

---

# 32. UI Completion Rule

Jangan menunda state penting ke akhir.

Setiap feature page harus memiliki:

```text
loading
empty
error
success
disabled
permission state
```

sesuai kebutuhan.

Contoh product list phase harus sudah menangani:

- no product;
- suspended product;
- image missing;
- loading;
- error.

---

# 33. Security Completion Rule

Security bukan hanya Phase 12.

Setiap phase harus langsung mengimplementasikan security yang relevan.

Phase 12 hanya audit/hardening.

Contoh:

```text
Phase 6 product CRUD
```

harus langsung memiliki ownership validation.

Tidak boleh menunggu Phase 12 untuk memperbaikinya.

---

# 34. Migration Discipline

Setiap schema change:

```text
update Prisma schema
↓
create migration
↓
review SQL
↓
run migration
↓
update seed if necessary
↓
run tests
```

Dilarang:

```text
manual production schema editing
```

tanpa migration.

---

# 35. Dependency Discipline

Sebelum menambah dependency:

1. cek apakah native/framework capability sudah cukup;
2. cek maintenance status;
3. cek bundle impact;
4. hindari overlap dengan package yang sudah ada.

Do not add UI libraries hanya untuk satu komponen sederhana.

---

# 36. Refactoring Rule

Refactor besar hanya dilakukan jika:

- ada duplication nyata;
- ada security issue;
- ada maintainability blocker;
- diperlukan phase berikutnya.

Jangan refactor seluruh project setiap selesai satu feature.

---

# 37. Performance Rule

Jangan melakukan premature optimization.

Tetapi dari awal:

- optimize images;
- paginate lists;
- use Server Components;
- avoid unnecessary client JS;
- add DB indexes;
- avoid N+1 queries.

Lakukan performance optimization tambahan berdasarkan measurement.

---

# 38. PWA Timing Rule

Jangan memulai PWA sebelum core marketplace dan dashboard stabil.

PWA berada setelah:

```text
Public
Cart
Merchant
Admin
Moderation
```

karena PWA bukan dependency core.

---

# 39. Deployment Readiness Checklist

Sebelum Phase 13:

```text
[ ] lint pass
[ ] typecheck pass
[ ] tests pass
[ ] build pass
[ ] tenant isolation tested
[ ] private evidence tested
[ ] suspended merchant tested
[ ] product moderation tested
[ ] cart checkout tested
[ ] analytics terminology audited
[ ] no fake order/sales data
[ ] env.example current
[ ] migrations reviewed
[ ] seed works
```

---

# 40. Final MVP Completion Criteria

MVP dianggap selesai jika:

## Visitor

- dapat browse;
- search;
- filter;
- melihat produk;
- melihat merchant;
- menggunakan multi-merchant cart;
- checkout per merchant;
- melanjutkan ke WhatsApp;
- share produk;
- report produk/merchant.

## Merchant

- registrasi;
- login;
- profile management;
- product CRUD;
- verification;
- analytics;
- notifications;
- change password;
- suspended state correct.

## Super Admin

- merchant management;
- merchant verification;
- product moderation;
- merchant moderation;
- category management;
- reports;
- banner;
- featured merchants;
- marketplace metrics.

## System

- mobile responsive;
- secure ownership;
- private evidence;
- production build;
- PWA installable;
- online deployment;
- no critical defects.

---

# 41. Recommended Final Repository Documentation

```text
README.md
AGENTS.md
PROJECT-STATUS.md

docs/
├── PRD.md
├── BUSINESS-RULES.md
├── USER-FLOW.md
├── DATABASE.md
├── DESIGN-SYSTEM.md
├── TECHNICAL-SPEC.md
├── IMPLEMENTATION-PLAN.md
└── TESTING.md
```

`TESTING.md` dapat dibuat setelah implementation dimulai atau pada Phase 12 untuk merangkum test strategy aktual.

---

# 42. Next Step

Setelah dokumen ini disetujui, jangan langsung memberikan Codex prompt feature.

Buat terlebih dahulu:

```text
AGENTS.md
```

`AGENTS.md` akan menjadi instruksi permanen dan ringkas untuk Codex agar:

- memahami product rules;
- menjaga scope;
- menjaga tenant isolation;
- membaca docs;
- menjalankan test/build;
- tidak membuat fitur marketplace generik di luar requirement.

Setelah `AGENTS.md` selesai:

```text
Phase 0
→ Project Initialization
```

baru dimulai.

---

# 43. Status

**IMPLEMENTATION-PLAN.md v1.0 — APPROVED EXECUTION BASELINE**

Next:

```text
AGENTS.md
→ Phase 0 Repository Initialization
→ Incremental Codex Development
```
