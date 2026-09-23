# AGENTS.md
## Sungairujing Marketplace

**Version:** 1.0  
**Purpose:** Permanent implementation rules for Codex and any AI coding agent working in this repository.

This file is the first instruction source to read before changing code.

---

# 1. Project Summary

Sungairujing Marketplace is a mobile-first multi-merchant marketplace/PWA for UMKM in Desa Sungairujing.

The platform helps visitors:

```text
Discover products
→ View merchant/product information
→ Add items to cart
→ Checkout per merchant
→ Continue via WhatsApp
```

The application is **not** a payment marketplace and does **not** store internal orders.

---

# 2. Required Documentation

Before implementing any phase, read the relevant documentation:

```text
docs/PRD.md
docs/BUSINESS-RULES.md
docs/USER-FLOW.md
docs/DATABASE.md
docs/DESIGN-SYSTEM.md
docs/TECHNICAL-SPEC.md
docs/IMPLEMENTATION-PLAN.md
PROJECT-STATUS.md
```

Priority if documents conflict:

```text
Latest approved requirement decision
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
Source Code
```

Do not silently invent a new rule when documentation is unclear.

---

# 3. Development Scope

Work only on the requested phase or task.

Do not implement future phases early unless required by the current phase.

Do not turn one task into a large refactor.

Before coding:

1. inspect the repository;
2. identify relevant existing files;
3. read the relevant docs;
4. check `PROJECT-STATUS.md`;
5. state a short implementation plan;
6. then implement.

---

# 4. Core Product Rules

These rules are non-negotiable.

```text
1. There is no buyer account.
2. There is no internal order database.
3. There is no payment gateway.
4. There is no sales/revenue tracking.
5. WhatsApp click is not an order or sale.
6. Checkout always happens per merchant.
7. Product publication does not require pre-approval.
8. Merchant verification is non-blocking.
9. Reports never auto-suspend content.
10. Suspended merchant products must not remain public.
```

---

# 5. User Roles

Supported roles:

```text
VISITOR
MERCHANT_ADMIN
SUPER_ADMIN
```

Visitors do not log in.

Merchant access is determined through merchant membership.

Super Admin is created through deployment/seed and never through public registration.

---

# 6. Authentication Rules

Merchant login:

```text
WhatsApp number
+
Password
```

Rules:

- WhatsApp number must be unique.
- Normalize WhatsApp number before persistence/comparison.
- Password minimum length: 8 characters.
- Password must never be stored as plaintext.
- Use Argon2id.
- Registration does not require OTP in MVP.
- Super Admin registration must not exist publicly.
- Login errors should not reveal whether an account exists.

---

# 7. Authorization Rules

Authentication is not authorization.

Every protected mutation must perform server-side authorization.

Never rely only on:

- hidden buttons;
- client-side checks;
- route visibility;
- form values supplied by the browser.

Merchant-owned resource rule:

```text
IF authenticated merchant != resource merchant
THEN reject request
```

Example:

```text
Merchant A must never be able to read, edit, delete,
or access private files belonging to Merchant B.
```

For ownership-sensitive resources, returning `404` instead of exposing resource existence is acceptable.

---

# 8. Tenant Isolation

Tenant isolation is a critical security requirement.

Every merchant resource must be scoped using authenticated merchant ownership.

Examples:

```text
products.merchant_id
verification_submissions.merchant_id
whatsapp_click_events.merchant_id
```

Never trust a `merchant_id` sent by the client as proof of ownership.

Resolve merchant identity from the authenticated session/membership.

---

# 9. Merchant Registration

Merchant self-registration is allowed.

Required business data:

```text
Owner Name
Merchant Name
WhatsApp Number
Password
Merchant Address
Business Evidence
Terms Acceptance
```

Merchant becomes active immediately after registration.

Verification is a separate process.

MVP:

```text
1 merchant
→ 1 primary Merchant Admin
```

Database must still remain ready for multiple merchant admins later.

---

# 10. Merchant Verification

Merchant verification statuses:

```text
BELUM_DIVERIFIKASI
TERVERIFIKASI
DITOLAK
```

Verification does not block selling.

Business evidence:

- maximum 3 files;
- private;
- accessible only by the owning merchant and Super Admin.

Never expose verification evidence through a public permanent URL.

Use short-lived authorized access.

---

# 11. Merchant Suspension

Merchant status:

```text
ACTIVE
SUSPENDED
```

When suspended:

```text
merchant may log in
merchant may view dashboard
merchant may view suspension reason
merchant may view permitted historical/analytics data
merchant may not publish or modify public marketplace content
merchant public page is unavailable
all merchant products are hidden publicly
featured placement is ignored
```

Suspension must not delete merchant data.

Only Super Admin can reactivate a suspended merchant.

---

# 12. Product Rules

Each product belongs to exactly one merchant.

Required fields include:

```text
Name
Slug
Description
Price
Category
Unit
Availability
Merchant
Moderation Status
```

Availability:

```text
TERSEDIA
HABIS
```

Do not add numeric inventory.

Do not add product variant tables/entities.

Variants such as:

```text
250g / 500g
Pedas / Original
```

remain text in product description for MVP.

---

# 13. Product Publication

Products publish immediately if:

```text
merchant is ACTIVE
AND
product is not suspended
```

There is no mandatory workflow:

```text
Pending
→ Approved
→ Published
```

Do not create a product approval queue.

---

# 14. Product Moderation

Super Admin may:

- suspend product;
- reactivate product if supported by the current task;
- delete product;
- store moderation reason.

A merchant cannot unsuspend a product that was suspended by Super Admin.

Suspended products must not appear in:

- catalog;
- search;
- popular products;
- public merchant product list.

---

# 15. Product Images

Rules:

```text
maximum 5 images per product
one cover image
JPG/JPEG/PNG/WebP
```

Validate server-side:

- MIME type;
- decoded image validity;
- file size;
- file count;
- ownership.

Optimize public images before storage.

Strip unnecessary metadata such as EXIF GPS data.

---

# 16. Categories

Categories are global.

Only Super Admin may:

```text
create
edit
disable/delete
```

Merchant can only select an existing active category.

Prevent duplicate normalized category names.

If a category is still referenced:

```text
disable it
```

rather than breaking product relations.

---

# 17. Public Product Visibility

A product is publicly eligible only if:

```text
product.moderation_status = ACTIVE
AND
merchant.status = ACTIVE
```

Merchant verification status is **not** a visibility requirement.

`HABIS` products remain visible and must clearly show their availability state.

---

# 18. Cart Rules

Cart:

- does not require buyer login;
- is stored client-side;
- supports multiple merchants;
- groups items by merchant;
- checks out one merchant at a time.

Do not create database cart/order tables for MVP.

Persist only minimal client cart data.

Recommended conceptual shape:

```json
{
  "items": [
    {
      "productId": "uuid",
      "merchantId": "uuid",
      "quantity": 2
    }
  ]
}
```

Never trust stored client price/name as authoritative.

Revalidate against the server before checkout.

---

# 19. Checkout Rules

Checkout collects:

```text
Name
WhatsApp Number
Fulfillment Method
Address when delivery is selected
Optional Note
```

Fulfillment:

```text
AMBIL_SENDIRI
DIANTAR
```

If:

```text
DIANTAR
```

then address is required.

The application calculates only:

```text
Product subtotal
Estimated product total
```

Do not calculate automatic shipping fees.

---

# 20. No Internal Order System

Never create:

```text
orders
order_items
payments
transactions
shipment records
order history
sales reports
```

Checkout must not persist buyer transaction data.

The generated `SRM-...` code is only a communication reference.

It is not an order ID.

---

# 21. WhatsApp Rules

Checkout continues through WhatsApp.

Use normalized merchant number.

Message should contain:

- merchant name;
- products;
- quantities;
- product subtotal/estimated total;
- buyer name;
- buyer WhatsApp;
- fulfillment method;
- address if required;
- note if supplied;
- reference code;
- confirmation request.

Use centralized message builder logic.

Do not duplicate message formatting across UI components.

---

# 22. WhatsApp Analytics

Supported sources:

```text
PRODUCT_DETAIL
MERCHANT_PROFILE
CHECKOUT
```

A WhatsApp click means:

```text
user triggered the WhatsApp action
```

It does not prove:

```text
message sent
order accepted
payment completed
sale completed
```

UI terminology must use:

```text
Klik WhatsApp
Kunjungan WhatsApp
```

Never label this metric as:

```text
Pesanan
Penjualan
Transaksi
```

---

# 23. Product View Analytics

Popularity metric:

```text
product detail views
```

Deduplication rule:

```text
1 browser
+ 1 product
+ rolling 24 hours
= maximum 1 counted view
```

Do not replace rolling 24-hour behavior with simple daily/calendar counting.

Do not use aggressive browser fingerprinting.

Use a random first-party visitor identifier and store only its server-side hash.

---

# 24. Popular Products

Homepage displays at most:

```text
8 popular products
```

Ranking is based on counted product detail views.

Exclude:

- suspended products;
- products belonging to suspended merchants.

Use label:

```text
Produk Populer
```

Never:

```text
Produk Terlaris
```

because sales data does not exist.

---

# 25. Featured Merchants

Super Admin may select at most:

```text
5 merchants
```

Suspended merchants must not appear publicly even if still stored as featured.

---

# 26. Reports

Visitors may report:

```text
PRODUCT
MERCHANT
```

Reporter name and WhatsApp are optional.

Reasons:

```text
ILLEGAL_OR_PROHIBITED
DANGEROUS_PRODUCT
FRAUD_OR_MISLEADING
PHOTO_DESCRIPTION_MISMATCH
SPAM
OTHER
```

If `OTHER`, details are required.

Report statuses:

```text
BARU
DITINJAU
SELESAI
DITOLAK
```

Report count must never trigger automatic suspension.

Super Admin reviews reports manually.

---

# 27. Deletion

Product may be permanently deleted after confirmation.

Merchant actions are different:

```text
Suspend
→ reversible

Delete Permanently
→ destructive
```

Permanent merchant deletion requires strong confirmation.

Preserve moderation/report context using snapshots where defined in `DATABASE.md`.

Never leave broken foreign-key references or orphan storage files intentionally.

---

# 28. Private Data Rules

Private/sensitive application data includes:

```text
password_hash
verification evidence
password reset token hash
internal moderation data
```

Buyer checkout data is not persisted.

Avoid logging:

- buyer address;
- buyer note;
- passwords;
- raw reset token;
- private evidence contents;
- secrets.

---

# 29. Database Rules

Database:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

Use migrations for every schema change.

Never manually modify production schema without a reviewed migration.

Do not silently introduce new business tables outside documented scope.

---

# 30. Core Database Entities

Expected business entities include:

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

Framework infrastructure tables may be added only if required by chosen libraries and must not change business behavior.

---

# 31. Storage Rules

Storage provider:

```text
Supabase Storage
```

Logical buckets:

```text
public-media
private-evidence
```

Public:

```text
merchant logos
product images
banner images
```

Private:

```text
verification evidence
```

Never expose the service-role credential to the browser.

---

# 32. Application Stack

Baseline:

```text
Next.js App Router
React
TypeScript
Tailwind CSS

Prisma
PostgreSQL / Supabase

Auth.js
Argon2id

React Hook Form
Zod

Zustand
Supabase Storage
Sharp

Lucide Icons
Recharts
Serwist
Playwright
Vitest
React Testing Library
```

Use stable mutually compatible dependency versions.

Do not change core stack without explicit review.

---

# 33. Server-first Rule

Use:

```text
Server Components by default
```

Use Client Components only for interactive state such as:

- cart;
- forms;
- gallery interaction;
- modal;
- chart;
- share;
- quantity controls.

Do not make the entire app a client-side SPA.

---

# 34. Architecture Rule

Preferred layering:

```text
UI / Route / Server Action
        ↓
Service
        ↓
Repository
        ↓
Prisma
        ↓
PostgreSQL
```

Business logic belongs in service/domain helpers, not duplicated across components.

---

# 35. Server Action Rule

Every protected Server Action follows:

```text
authenticate
↓
authorize
↓
validate
↓
execute business logic
↓
return safe result
```

Never trust ownership based solely on IDs from form input.

---

# 36. Validation

Use:

```text
Zod
```

Validation happens:

```text
client-side for UX
+
server-side for authority
```

Server-side validation is mandatory.

---

# 37. Forms

Use:

```text
React Hook Form
+
Zod
```

where interactive forms require it.

Do not introduce a second form framework unless required.

---

# 38. Search

MVP search:

```text
PostgreSQL ILIKE
```

Do not add:

```text
Elasticsearch
Algolia
Meilisearch
```

unless requirement/performance evidence later justifies it.

---

# 39. Pagination

Use server-side pagination.

Recommended initial public catalog:

```text
20 products/page
```

Do not add infinite scroll unless explicitly requested.

---

# 40. UI/UX Rules

Follow `docs/DESIGN-SYSTEM.md`.

Direction:

```text
Modern Marketplace
×
Local Sungairujing/Bawean Identity
```

Prioritize:

```text
clarity
usability
mobile experience
product photography
consistent typography
whitespace
clear CTA
```

Avoid AI-slop patterns:

```text
excessive gradients
glassmorphism everywhere
giant rounded cards for every section
fake statistics
decorative icons without purpose
random 3D illustrations
excessive animation
generic filler copy
```

---

# 41. Brand Direction

Primary direction:

```text
green
white
neutral
```

Do not introduce a new dominant palette without design approval.

Use design tokens rather than scattered hard-coded colors.

---

# 42. Accessibility

Required:

- semantic HTML;
- labels for form controls;
- visible focus;
- keyboard support where applicable;
- accessible dialog/dropdown primitives;
- meaningful image alt;
- icon-only accessible labels;
- minimum reasonable touch target;
- color not used as the only state signal.

---

# 43. Responsive Rule

Design mobile-first.

Target:

```text
smartphone
→ tablet
→ desktop
```

Every new public flow must be checked at small mobile width before phase completion.

Avoid horizontal overflow.

---

# 44. Error Handling

Users receive safe Indonesian messages.

Server logs may contain technical detail but never secrets.

Never expose:

- stack trace;
- SQL;
- private storage key;
- provider token;
- internal auth secret.

---

# 45. Logging

Structured logging only.

Do not log:

```text
password
raw reset token
private evidence content
buyer checkout payload
production secrets
```

---

# 46. Security

Every phase must implement security relevant to its scope.

Do not postpone basic security until the final security phase.

Mandatory protections:

- tenant isolation;
- session verification;
- server-side authorization;
- input validation;
- upload validation;
- private file access control;
- password hashing;
- destructive action confirmation.

---

# 47. File Upload Security

Check server-side:

```text
MIME
file size
decoded image
file count
ownership
```

Do not trust file extension alone.

Randomize storage filenames.

Strip unnecessary metadata from public images.

---

# 48. Password Recovery

Target integration:

```text
Meta WhatsApp Cloud API
```

If provider credentials/template are not ready:

```text
do not fake delivery
```

The UI may remain disabled/feature-flagged until the external dependency is available.

Raw reset tokens must never be stored.

---

# 49. Rate Limiting

Rate-limit abuse-prone endpoints, especially:

```text
login
forgot password
public report
```

Use the technical strategy from `TECHNICAL-SPEC.md`.

Do not let analytics/rate-limit infrastructure unnecessarily block core WhatsApp navigation if its own logging fails.

---

# 50. PWA

PWA is supporting functionality, not a requirement for core website usage.

The website must work normally without installation.

Do not implement:

```text
offline checkout
background order sync
push notification
```

unless requirements change.

---

# 51. SEO

Public pages should support:

- page title;
- description;
- canonical URL;
- Open Graph metadata.

Do not fabricate:

- reviews;
- ratings;
- sales;
- popularity claims beyond actual metrics.

Dashboard/admin pages should not be indexed.

---

# 52. Testing Rules

Relevant tests must be added with each feature.

Use:

```text
Vitest
React Testing Library
Playwright
```

Critical behavior requires test coverage.

Do not rely only on manual testing.

---

# 53. Critical Tests

Once implemented, these must remain green:

```text
Merchant registration works.
Duplicate WhatsApp is rejected.
Unauthenticated dashboard access is rejected.
Merchant cannot access Super Admin pages.
Merchant A cannot read/edit Merchant B product.
Merchant A cannot access Merchant B evidence.
Suspended merchant can still login.
Suspended merchant cannot mutate public marketplace content.
Suspended product is not public.
Multi-merchant cart works.
Checkout stays per merchant.
Checkout creates no internal order record.
WhatsApp target number is correct.
24h product view dedupe works.
Report does not auto-suspend.
Unverified merchant may still sell.
Private evidence is protected.
```

---

# 54. Phase Gate

Before completing a phase, run:

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

Run:

```text
npm run test:e2e
```

when required by the phase.

Do not proceed if failures were introduced by the current changes.

---

# 55. Commit Discipline

Use focused commits.

Examples:

```text
feat: implement merchant registration
feat: implement public product catalog
feat: implement multi-merchant cart
feat: implement whatsapp checkout
fix: enforce merchant product ownership
test: add merchant isolation coverage
```

Do not bundle unrelated large changes into one commit.

---

# 56. Dependency Discipline

Before adding a dependency:

1. check whether existing stack/native APIs already solve it;
2. verify the dependency is maintained;
3. avoid overlapping libraries;
4. consider bundle/server impact.

Do not add libraries for trivial utilities.

---

# 57. No Premature Complexity

Do not introduce without evidence:

```text
microservices
GraphQL
Kubernetes
message broker
event bus
CQRS
Elasticsearch
custom distributed cache
realtime websocket infrastructure
```

MVP is a single full-stack Next.js application.

---

# 58. Do Not Add Marketplace Features Automatically

Common marketplace functionality is not automatically allowed.

Do not add:

```text
buyer accounts
wishlist
favorites
ratings
reviews
product variants
numeric inventory
orders
transactions
payments
shipping API
sales dashboard
product approval queue
product QR
multi-language
native mobile app
```

without requirement update.

---

# 59. Homepage Rules

Baseline content:

```text
Navbar
Hero + Search
Categories
Popular Products
Featured Merchants
Banner / Promo
About
Footer
```

Do not add fake counters like:

```text
10,000+ transactions
1,000+ happy buyers
```

unless those numbers are real and supported.

---

# 60. Merchant Dashboard Rules

Baseline:

```text
Overview
Products
Profile
Verification
Analytics
Notifications
Account Settings
```

Metrics:

```text
Total Products
Available Products
Suspended Products
WhatsApp Clicks
```

Do not add revenue/order metrics.

---

# 61. Super Admin Dashboard Rules

Baseline:

```text
Overview
Merchants
Verification
Products
Categories
Reports
Banners
Featured Merchants
Settings
```

Metrics:

```text
Total Merchants
Active Merchants
Suspended Merchants
Total Products
Suspended Products
Total Categories
```

---

# 62. Project Status

After completing a meaningful phase, update:

```text
PROJECT-STATUS.md
```

Minimum content:

```text
Current Phase
Completed
In Progress
Known Issues
Tests
Build Status
Last Commit
Next Action
```

This repository must remain understandable without relying on chat history.

---

# 63. Before You Finish a Task

Always report:

```text
1. Summary
2. Files changed
3. Tests/build result
4. Security notes
5. Remaining issues
6. Recommended commit message
```

Do not continue into the next phase automatically.

---

# 64. Final Instruction to Coding Agents

When uncertain:

```text
do not guess
do not add scope
do not weaken security
do not invent transactions
do not invent sales metrics
```

Inspect the repository and documentation first.

The goal is not to make Sungairujing Marketplace look like a generic large marketplace.

The goal is to implement the documented MVP correctly, securely, clearly, and consistently.

---

# 65. Status

**AGENTS.md v1.0 — ACTIVE PROJECT INSTRUCTIONS**

Next development step:

```text
Phase 0 — Repository & Application Foundation
```
