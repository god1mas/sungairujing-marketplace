# TECHNICAL SPECIFICATION
## Sungairujing Marketplace

**Version:** 1.0  
**Status:** Technical Architecture Baseline  
**Project:** Sungairujing Marketplace  
**Related Documents:** `PRD.md`, `BUSINESS-RULES.md`, `USER-FLOW.md`, `DATABASE.md`, `DESIGN-SYSTEM.md`  
**Architecture:** Next.js Full-stack Web / PWA  
**Primary Language:** TypeScript  
**Database:** PostgreSQL  
**Deployment Target:** Online deployment first, custom domain later  
**Development Principle:** Correctness → UI/UX → Security → Performance → PWA → Extra Features  

---

# 1. Purpose

Dokumen ini menetapkan keputusan teknis untuk mengimplementasikan Sungairujing Marketplace.

Dokumen ini menjawab keputusan yang sebelumnya sengaja ditunda pada PRD dan Database Design, terutama:

- framework;
- ORM;
- authentication;
- session strategy;
- password hashing;
- database provider;
- object storage;
- upload dan image optimization;
- WhatsApp integration;
- analytics implementation;
- cart persistence;
- PWA;
- testing;
- deployment;
- CI/CD;
- security;
- folder structure;
- coding conventions.

Implementasi Codex harus mengikuti dokumen ini selama tidak bertentangan dengan `PRD.md` dan `BUSINESS-RULES.md`.

---

# 2. Technical Goals

Arsitektur harus:

1. cukup sederhana untuk dikembangkan dan dipahami;
2. aman untuk model multi-merchant;
3. cocok untuk deployment serverless;
4. memiliki biaya operasional rendah untuk MVP;
5. mobile-first;
6. mudah diuji;
7. tidak membuat fitur di luar scope;
8. mudah dikembangkan melalui Codex secara bertahap;
9. tidak mengunci proyek ke arsitektur yang terlalu kompleks;
10. siap berkembang menjadi multi-admin merchant.

---

# 3. Final Technology Stack

Baseline:

```text
Application
Next.js App Router
React
TypeScript

Styling
Tailwind CSS

UI Primitives
Radix UI primitives where necessary
Custom application components

Icons
Lucide Icons

Forms
React Hook Form
Zod

Database
PostgreSQL

ORM
Prisma ORM

Authentication
Auth.js Credentials-based authentication

Password Hashing
Argon2id

Client Cart State
Zustand + persist middleware

Object Storage
Supabase Storage

Database Hosting
Supabase PostgreSQL

Application Hosting
Vercel

Charts
Recharts

PWA
Serwist

QR
qrcode package

Testing
Vitest
React Testing Library
Playwright

Package Manager
npm

Version Control
Git + GitHub
```

---

# 4. Version Policy

Jangan hard-code dependency version dari dokumen ini.

Saat project initialization:

```text
use latest stable mutually compatible versions
```

Kemudian:

```text
package-lock.json
```

wajib di-commit.

Setelah baseline project stabil, dependency major version tidak boleh di-upgrade di tengah phase tanpa kebutuhan nyata.

Node.js menggunakan versi **Active LTS yang didukung oleh versi Next.js yang dipilih**, lalu dikunci melalui:

```text
package.json engines
```

dan file version manager bila diperlukan.

---

# 5. Why Next.js App Router

Next.js digunakan karena:

- sesuai baseline proposal;
- React ecosystem matang;
- mendukung Server Components;
- mendukung Server Actions;
- cocok untuk public marketplace + dashboard;
- routing dapat memisahkan public, merchant, dan admin;
- mudah di-deploy ke Vercel;
- image optimization tersedia;
- PWA dapat ditambahkan tanpa membuat aplikasi native.

Gunakan:

```text
App Router
```

bukan Pages Router untuk implementasi baru.

---

# 6. Runtime Strategy

Gunakan:

```text
Node.js runtime
```

untuk server code yang menggunakan:

- Prisma;
- Argon2;
- Sharp;
- file processing;
- PostgreSQL transaction;
- Supabase server SDK.

Jangan mengoptimalkan route ke Edge Runtime secara prematur.

Correctness dan compatibility lebih penting untuk MVP.

---

# 7. Rendering Strategy

## Public Pages

Gunakan Server Components secara default.

Contoh:

```text
Homepage
Product Listing
Product Detail
Merchant Listing
Merchant Detail
```

Client Components hanya digunakan jika dibutuhkan untuk:

- cart;
- quantity;
- search interactions;
- filter drawer;
- share;
- interactive gallery.

---

## Dashboard

Server Components untuk:

- data loading;
- authorization;
- list;
- metric queries.

Client Components untuk:

- form interaction;
- charts;
- uploader;
- confirmation dialog;
- interactive filters.

---

# 8. No SPA Requirement

Jangan mengubah seluruh aplikasi menjadi client-side SPA.

Default:

```text
Server Component first
Client Component only when interactive state is required
```

Tujuan:

- bundle lebih kecil;
- auth lebih aman;
- query lebih dekat ke server;
- public page lebih cepat.

---

# 9. Application Route Architecture

Baseline:

```text
src/app
├── (public)
│   ├── page.tsx
│   ├── products
│   │   ├── page.tsx
│   │   └── [slug]
│   │       └── page.tsx
│   ├── merchants
│   │   └── page.tsx
│   ├── merchant
│   │   └── [slug]
│   │       └── page.tsx
│   ├── cart
│   │   └── page.tsx
│   └── checkout
│       └── [merchantSlug]
│           └── page.tsx
│
├── (auth)
│   ├── login
│   ├── register
│   ├── forgot-password
│   └── reset-password
│
├── dashboard
│   ├── layout.tsx
│   ├── page.tsx
│   ├── products
│   ├── profile
│   ├── verification
│   ├── analytics
│   ├── notifications
│   └── account
│
├── admin
│   ├── layout.tsx
│   ├── page.tsx
│   ├── merchants
│   ├── verifications
│   ├── products
│   ├── categories
│   ├── reports
│   ├── banners
│   ├── featured-merchants
│   └── settings
│
└── api
    ├── analytics
    ├── files
    └── auth
```

Final path boleh sedikit berubah untuk kebutuhan Next.js tetapi business flow tidak boleh berubah.

---

# 10. Source Folder Architecture

Recommended:

```text
src
├── app
├── components
│   ├── ui
│   ├── marketplace
│   ├── dashboard
│   └── forms
│
├── features
│   ├── auth
│   ├── merchants
│   ├── verification
│   ├── products
│   ├── categories
│   ├── cart
│   ├── checkout
│   ├── analytics
│   ├── reports
│   ├── banners
│   ├── notifications
│   └── featured-merchants
│
├── lib
│   ├── auth
│   ├── db
│   ├── storage
│   ├── validation
│   ├── whatsapp
│   ├── analytics
│   ├── security
│   ├── formatting
│   └── utils
│
├── repositories
├── services
├── constants
├── types
└── styles
```

---

# 11. Layering Rule

Gunakan alur:

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

Tujuan:

- business logic tidak tersebar di component;
- authorization dapat diuji;
- query dapat dipusatkan;
- Codex tidak membuat duplicate logic.

---

# 12. Repository Responsibility

Repository hanya bertanggung jawab pada akses data.

Contoh:

```text
productRepository.findPublicBySlug()
productRepository.findOwnedById()
productRepository.create()
productRepository.update()
```

Repository tidak menentukan policy UI.

---

# 13. Service Responsibility

Service menangani:

- validation;
- authorization;
- business rules;
- transaction;
- orchestration;
- storage cleanup;
- notification creation.

Contoh:

```text
productService.createProduct()
merchantService.suspendMerchant()
verificationService.approveSubmission()
checkoutService.buildWhatsAppMessage()
```

---

# 14. ORM Decision — Prisma

Gunakan Prisma karena:

- schema readable;
- relation jelas;
- migration workflow sederhana;
- TypeScript integration kuat;
- cocok untuk development dengan Codex;
- PostgreSQL support matang.

Gunakan migration:

```text
prisma migrate dev
```

untuk development dan:

```text
prisma migrate deploy
```

untuk controlled production release.

---

# 15. Database Provider — Supabase PostgreSQL

Gunakan Supabase sebagai managed PostgreSQL provider.

Reason:

- PostgreSQL;
- storage tersedia dalam satu provider;
- mudah digunakan untuk MVP;
- dapat dipakai dari Prisma;
- mengurangi jumlah vendor.

Application **tidak menggunakan Supabase Auth**.

Authentication tetap mengikuti auth architecture aplikasi sendiri.

---

# 16. Database Connections

Environment:

```text
DATABASE_URL
DIRECT_URL
```

`DATABASE_URL`:

```text
pooled/runtime connection
```

`DIRECT_URL`:

```text
direct connection for migration
```

Prisma configuration harus memisahkan kebutuhan runtime dan migration sesuai konfigurasi provider.

---

# 17. Database Access Rule

Semua direct Prisma access hanya boleh berada pada server-only layer.

Dilarang mengimport Prisma client ke Client Component.

Recommended:

```text
src/lib/db/prisma.ts
```

gunakan singleton pada development untuk mencegah connection explosion akibat hot reload.

---

# 18. Authentication Decision

Gunakan:

```text
Auth.js
+
Credentials Provider
+
JWT Session
```

Credential:

```text
whatsapp_number
password
```

Auth.js dipakai untuk:

- sign in;
- sign out;
- signed session cookie;
- route integration.

Business authorization tetap dilakukan oleh aplikasi.

---

# 19. Authentication Is Not Authorization

Session valid tidak otomatis memberi akses terhadap resource merchant.

Setiap protected operation:

```text
get session
↓
load current user from database
↓
verify user active
↓
verify role/membership
↓
verify resource ownership
↓
execute
```

---

# 20. Session Content

JWT/session hanya membawa data minimal:

```text
userId
globalRole
issuedAt
userVersion
```

Jangan menyimpan merchant profile lengkap di JWT.

Merchant membership harus dibaca dari database ketika dibutuhkan untuk protected mutation.

---

# 21. Session Invalidation Strategy

`users.updated_at` digunakan sebagai lightweight auth version.

Saat login:

```text
session.userVersion = users.updated_at
```

Pada protected sensitive request:

```text
load current user
compare current users.updated_at with session.userVersion
```

Jika tidak sama:

```text
require re-authentication
```

Dengan pola ini, perubahan sensitif seperti:

- password;
- WhatsApp login number;
- account status;

dapat menginvalidasi session lama tanpa menambah field schema khusus.

---

# 22. Session Lifetime

Baseline:

```text
8 hours
```

untuk authenticated dashboard session.

Remember-me tidak menjadi requirement MVP.

Exact Auth.js cookie settings:

```text
httpOnly
secure in production
sameSite=lax
```

---

# 23. Password Hashing

Gunakan:

```text
Argon2id
```

Library recommendation:

```text
@node-rs/argon2
```

Jangan menggunakan:

```text
MD5
SHA1
plain SHA256
plaintext
```

untuk password storage.

---

# 24. Login Normalization

Sebelum authentication:

```text
normalizeWhatsAppNumber(input)
```

Canonical Indonesia:

```text
628xxxxxxxxxx
```

Login harus menerima variasi umum seperti:

```text
0812...
+62812...
62812...
```

lalu dibandingkan dalam format canonical.

---

# 25. Login Error

Gunakan generic error:

```text
Nomor WhatsApp atau password tidak sesuai.
```

Jangan memberi tahu secara eksplisit apakah nomor terdaftar untuk mengurangi account enumeration.

---

# 26. Login Rate Limit

Production baseline:

```text
5 failed attempts
per identifier + IP
per 15 minutes
```

Gunakan server-side rate limiter.

Recommended provider:

```text
Upstash Redis
```

Development dapat menggunakan adapter in-memory yang hanya untuk local development.

---

# 27. Rate Limited Operations

Minimal:

```text
login
forgot password
report submission
verification token request
```

Recommended initial limits:

```text
Login:
5 / 15 min

Forgot Password:
3 / 15 min

Public Report:
5 / hour

Product View endpoint:
reasonable burst protection

WhatsApp analytics:
reasonable burst protection
```

Rate limiting tidak menggantikan validation.

---

# 28. Forgot Password Provider

Gunakan preferensi:

```text
Meta WhatsApp Cloud API
```

untuk password recovery otomatis.

Reason:

- official WhatsApp API;
- tidak bergantung pada unofficial automation;
- sesuai requirement WhatsApp recovery.

Feature baru diaktifkan ketika provider credentials dan approved template tersedia.

---

# 29. Password Recovery Flow

```text
User enters WhatsApp
↓
Normalize number
↓
Always show generic success response
↓
If account exists:
    generate cryptographically secure token
    hash token
    store password_reset_tokens
    expiry 15 minutes
    send WhatsApp template
↓
User opens recovery link/code
↓
Validate hashed token
↓
Set new password
↓
Mark token used
↓
Invalidate remaining reset tokens
↓
Update users.updated_at
↓
Require login
```

---

# 30. Password Reset Security

Raw token:

```text
never stored in database
```

Database:

```text
token_hash only
```

Token:

```text
single use
15-minute expiry
```

Forgot password response tidak boleh mengungkap apakah akun ditemukan.

---

# 31. Super Admin Creation

Tidak ada public registration.

Gunakan seed/setup script.

Environment:

```text
SEED_ADMIN_WHATSAPP
SEED_ADMIN_PASSWORD
```

Script:

```text
npm run db:seed
```

harus:

- normalize number;
- hash password;
- create/update Super Admin safely.

Production secret tidak boleh di-commit.

---

# 32. Authorization Helpers

Buat server utilities:

```text
requireUser()
requireMerchantAdmin()
requireSuperAdmin()
requireMerchantOwnership(resourceMerchantId)
requireActiveMerchantForMutation()
```

Jangan mengulang authorization secara manual di setiap halaman.

---

# 33. Merchant Suspension Enforcement

Untuk protected mutation:

```text
IF merchant.status = SUSPENDED
AND operation changes public marketplace content
THEN reject
```

Read dashboard tetap diperbolehkan.

Examples blocked:

```text
create product
edit public product
edit public merchant profile
```

Examples allowed:

```text
view dashboard
view reason
view analytics
view notifications
```

---

# 34. Product Suspension Enforcement

Merchant:

```text
can view suspended product
cannot unsuspend product
```

Super Admin:

```text
can suspend
can reactivate if action is implemented
can delete
```

Public query selalu mengecualikan suspended product.

---

# 35. Object Storage Decision

Gunakan Supabase Storage dengan minimal dua bucket:

```text
public-media
private-evidence
```

---

# 36. public-media Bucket

Digunakan untuk:

```text
merchant logos
product images
banner images
```

File dapat diakses publik karena memang muncul pada marketplace.

Recommended path:

```text
merchants/{merchantId}/logo/{uuid}.webp

merchants/{merchantId}/products/{productId}/{uuid}.webp

banners/{bannerId}/{uuid}.webp
```

---

# 37. private-evidence Bucket

Digunakan untuk:

```text
verification evidence
```

Bucket tidak public.

Path:

```text
verification/{merchantId}/{submissionId}/{uuid}.{ext}
```

Jangan expose direct permanent public URL.

---

# 38. Private Evidence Access

Flow:

```text
Merchant/Super Admin requests file
↓
server verifies authentication
↓
server verifies ownership OR super admin
↓
server creates short-lived signed URL
↓
client opens file
```

Signed URL recommendation:

```text
5 minutes
```

---

# 39. Storage Credentials

Supabase service role key:

```text
server-only
```

Dilarang menggunakan service role key pada browser/client bundle.

Public client key hanya digunakan jika benar-benar diperlukan oleh architecture, tetapi upload baseline dilakukan melalui authenticated server route/action.

---

# 40. Product Image Upload Limits

Technical limit recommendation:

```text
Max files: 5
Max raw size: 5 MB / image
Accepted:
image/jpeg
image/png
image/webp
```

Validation dilakukan berdasarkan MIME dan decoded image, bukan extension saja.

---

# 41. Merchant Logo Limit

Recommendation:

```text
1 image
max 3 MB
JPEG / PNG / WebP
```

---

# 42. Banner Image Limit

Recommendation:

```text
1 image
max 8 MB
JPEG / PNG / WebP
```

---

# 43. Verification Evidence Limit

Business limit:

```text
maximum 3 files
```

Technical formats:

```text
JPEG
PNG
WebP
PDF
```

Recommended raw limit:

```text
8 MB / file
```

Evidence tetap private.

---

# 44. Image Processing

Gunakan:

```text
sharp
```

server-side.

Product image:

```text
auto rotate from EXIF
strip unnecessary metadata
max dimension: 1600px
convert to WebP
quality: ~80
```

Merchant logo:

```text
max dimension: 800px
WebP
quality: ~82
```

Banner:

```text
max width: 1920px
WebP
quality: ~82
```

Exact quality dapat disesuaikan setelah visual test.

---

# 45. Metadata Privacy

Image processing harus menghapus metadata yang tidak dibutuhkan, terutama:

```text
EXIF GPS/location metadata
```

pada image publik.

---

# 46. Upload Transaction Strategy

Upload tidak dapat sepenuhnya menjadi satu ACID transaction dengan object storage.

Gunakan pattern:

```text
validate
↓
process file
↓
upload storage
↓
persist DB metadata
```

Jika DB persist gagal:

```text
delete uploaded object as compensation
```

Jika file lama diganti:

```text
persist new reference
↓
commit
↓
delete old object
```

Jangan menghapus file lama sebelum DB berhasil menunjuk file baru.

---

# 47. Public Image Delivery

Gunakan:

```text
Next.js Image
```

untuk:

- responsive size;
- lazy loading;
- layout stability.

Storage hostname harus didaftarkan pada image configuration.

---

# 48. Cart State Decision

Gunakan:

```text
Zustand
+
persist middleware
+
localStorage
```

Cart tidak disimpan ke database.

---

# 49. Cart Storage Schema

Versioned client schema:

```json
{
  "version": 1,
  "items": [
    {
      "productId": "uuid",
      "merchantId": "uuid",
      "quantity": 2
    }
  ]
}
```

Jangan menjadikan stored price/name sebagai authoritative source.

---

# 50. Cart Revalidation

Sebelum checkout:

```text
send product IDs to server
↓
load current product + merchant state
↓
verify:
    exists
    product active
    merchant active
    current price
    current availability
↓
build authoritative checkout summary
```

Jika invalid:

```text
return invalid item list
```

Client memperbarui cart.

---

# 51. Cart Quantity

Client:

```text
integer >= 1
```

Server checkout validation juga wajib mengulang pengecekan.

Quantity tidak dikaitkan dengan numeric inventory karena sistem tidak memilikinya.

---

# 52. WhatsApp Checkout Link

Gunakan official click-to-chat format:

```text
https://wa.me/{normalizedNumber}?text={encodedMessage}
```

Nomor:

```text
digits only
country code included
```

---

# 53. WhatsApp Message Builder

Buat satu centralized service:

```text
src/lib/whatsapp/build-checkout-message.ts
```

Input:

```text
merchant
validated products
quantities
buyer form
reference code
```

Output:

```text
plain Indonesian message
```

Jangan membuat message format terpisah di banyak component.

---

# 54. Reference Code

Format recommendation:

```text
SRM-YYMMDD-XXXX
```

`XXXX`:

```text
cryptographically random uppercase alphanumeric
```

Reference code tidak dipersist sebagai order.

Collision risk cukup rendah karena hanya context komunikasi.

---

# 55. WhatsApp Analytics Event

Sebelum membuka WhatsApp:

```text
client/server action
→ record event
→ redirect/open WhatsApp
```

Jika analytics insert gagal:

```text
WhatsApp action must still continue
```

Analytics tidak boleh memblokir core conversion flow.

---

# 56. Product View Analytics

Visitor identifier:

```text
random UUID generated by application
```

stored in:

```text
first-party cookie
```

atau local storage + cookie handoff.

Recommendation:

```text
first-party cookie
```

agar server dapat membaca identifier tanpa client roundtrip.

---

# 57. Visitor ID Cookie

Properties:

```text
random UUID
long-lived
sameSite=lax
secure in production
not HttpOnly if client must initialize it
```

Prefer initialization melalui server response sehingga dapat dibuat HttpOnly jika implementation memungkinkan.

Visitor ID bukan user identity.

---

# 58. Visitor Hash

Database tidak menyimpan raw visitor ID.

Server:

```text
SHA-256(
  VISITOR_HASH_PEPPER
  +
  visitor_id
)
```

save:

```text
visitor_key_hash
```

Environment:

```text
VISITOR_HASH_PEPPER
```

---

# 59. Product View 24h Deduplication

Requirement:

```text
1 browser
+ 1 product
+ rolling 24 hours
= 1 counted view
```

Implementation:

```text
BEGIN TRANSACTION
↓
acquire transaction-scoped advisory lock for
(product_id + visitor_key_hash)
↓
query latest counted event
↓
if no event OR older than 24h:
    insert product_view_event
↓
COMMIT
```

Prisma may use raw PostgreSQL for advisory lock inside controlled service.

Do not replace rolling 24-hour behavior with simple calendar-day counting unless requirement is updated.

---

# 60. Product Popularity

Query:

```text
eligible active products
+
active merchants
↓
count product_view_events
↓
order desc
↓
limit 8
```

For MVP no aggregate table is required.

Add aggregate/cache only if query becomes a measured performance issue.

---

# 61. WhatsApp Analytics

Event table:

```text
whatsapp_click_events
```

Sources:

```text
PRODUCT_DETAIL
MERCHANT_PROFILE
CHECKOUT
```

Dashboard reports only:

```text
views
WhatsApp clicks
```

Never:

```text
orders
sales
revenue
```

---

# 62. Analytics Failure Policy

Analytics is non-critical.

If event recording fails:

```text
log error
do not break public page
do not prevent WhatsApp
```

---

# 63. Search Decision

MVP:

```text
PostgreSQL ILIKE
```

Search:

```text
products.name
products.description
merchants.name
merchants.description
```

Use normalized query and parameterized Prisma filters.

Do not introduce Elasticsearch/Algolia/Meilisearch for MVP.

---

# 64. Search Upgrade Path

Jika data membesar:

```text
PostgreSQL Full Text Search
```

adalah upgrade pertama.

External search service hanya jika benar-benar dibutuhkan.

---

# 65. Catalog Pagination

Gunakan pagination.

Initial recommendation:

```text
20 products / page
```

Admin lists:

```text
20–25 items / page
```

Query param:

```text
?page=2
```

Gunakan server-side pagination.

---

# 66. Filter Query Parameters

Example:

```text
/products?
category=makanan
&merchant=dapur-bawean
&availability=tersedia
&minPrice=10000
&maxPrice=100000
&sort=price_asc
&page=1
```

URL menjadi shareable dan browser back/forward tetap bekerja.

---

# 67. Validation Decision

Gunakan:

```text
Zod
```

Shared schemas:

```text
src/features/*/schemas
```

Validation dilakukan:

```text
client for UX
+
server for authority
```

Client validation tidak pernah menggantikan server validation.

---

# 68. Form Decision

Gunakan:

```text
React Hook Form
+
Zod resolver
```

untuk interactive form.

Server action menerima data dan mengulang Zod validation.

---

# 69. Mutation Strategy

Gunakan Server Actions sebagai default untuk authenticated dashboard mutations:

```text
create product
edit product
delete product
edit merchant
verification submission
admin moderation
category management
banner management
featured merchant
```

Gunakan Route Handlers untuk kebutuhan:

```text
analytics beacon/event
file streaming/signed access
WhatsApp provider webhook if needed
password recovery callback
```

---

# 70. Server Action Security

Setiap Server Action harus:

```text
1. authenticate
2. authorize
3. validate
4. execute service
5. return safe result
```

Jangan menerima `merchant_id` dari client sebagai authorization proof.

Merchant ID berasal dari authenticated membership.

---

# 71. IDOR Prevention

Contoh edit product:

Bad:

```text
update product where id = form.productId
```

Correct:

```text
load authenticated merchant
update product
WHERE id = productId
AND merchant_id = authenticatedMerchantId
```

Jika tidak ditemukan:

```text
404/403 safe response
```

---

# 72. Public Report Submission

Route/server action:

```text
validate reason
validate details
sanitize length
rate limit
optional honeypot
persist report
```

Tidak ada auto-suspend.

---

# 73. Text Field Limits

Recommended technical limits:

```text
Merchant name: 100 chars
Merchant description: 1000 chars
Product name: 120 chars
Product description: 3000 chars
Unit: 50 chars
Report details: 1500 chars
Reporter name: 100 chars
Banner title: 120 chars
Banner description: 500 chars
CTA text: 50 chars
```

Final DB VARCHAR sizes dapat mengikuti migration.

---

# 74. Rich Text

MVP tidak membutuhkan rich-text editor.

Deskripsi menggunakan plain text.

Render dengan escaping default React.

Ini mengurangi XSS risk dan complexity.

---

# 75. HTML Sanitization

Karena description plain text:

```text
do not accept arbitrary HTML
```

Jika rich text ditambahkan nanti, sanitation harus dirancang terpisah.

---

# 76. PWA Decision

Gunakan:

```text
Serwist
```

untuk service worker integration.

PWA MVP menyediakan:

- web app manifest;
- application icons;
- installability;
- basic static asset caching;
- offline fallback page jika layak.

---

# 77. PWA Non-Goal

Tidak menjanjikan:

```text
offline catalog browsing
offline checkout
background order sync
push notification
```

Core marketplace tetap web-first.

---

# 78. PWA Manifest

Minimal:

```text
name
short_name
start_url
display=standalone
background_color
theme_color
icons
```

Theme color mengikuti brand green.

---

# 79. QR Decision

Gunakan:

```text
qrcode
```

Generate QR dari canonical public merchant URL:

```text
{APP_URL}/merchant/{slug}
```

QR dapat di-render SVG untuk preview dan PNG untuk download.

---

# 80. QR Security

Jangan encode:

- internal ID;
- private token;
- admin URL.

QR hanya berisi public merchant URL.

---

# 81. UI Implementation

Gunakan:

```text
Tailwind CSS
```

Design token dari `DESIGN-SYSTEM.md` dipetakan ke CSS variables.

Example:

```text
--brand-600
--neutral-900
--radius-md
```

Jangan hard-code warna berbeda-beda di setiap component.

---

# 82. Component Strategy

Gunakan custom components.

Radix UI hanya sebagai primitive untuk hal seperti:

- dialog;
- dropdown;
- tabs;
- accessible popover.

Jangan mengimport full visual theme yang mengubah arah design.

---

# 83. shadcn/ui Policy

Boleh mengambil primitive/component pattern dari shadcn/ui jika mempercepat development.

Tetapi:

```text
do not keep default demo styling blindly
```

Semua component harus disesuaikan dengan `DESIGN-SYSTEM.md`.

---

# 84. Icons

Gunakan:

```text
lucide-react
```

Satu icon library untuk seluruh app.

---

# 85. Charts

Gunakan:

```text
Recharts
```

Hanya load pada dashboard analytics.

Gunakan chart sederhana.

Tidak ada 3D atau decorative chart.

---

# 86. Date and Number Formatting

Gunakan:

```text
Intl.NumberFormat("id-ID")
Intl.DateTimeFormat("id-ID")
```

Currency:

```text
IDR
```

UI:

```text
Rp25.000
```

---

# 87. Timezone

Database:

```text
TIMESTAMPTZ
```

Application display baseline:

```text
Asia/Jakarta
```

karena target operasional Indonesia barat.

Jangan menyimpan local naive time untuk timestamp global.

---

# 88. Opening Hours

`opening_hours` JSONB diproses oleh typed helper.

Define TypeScript type:

```text
OpeningHours
```

Validation dengan Zod.

Merchant operational override tetap terpisah:

```text
BUKA
TUTUP
LIBUR_SEMENTARA
```

---

# 89. Notifications

Internal notifications dibaca dari database.

MVP:

```text
poll on page load/navigation
```

Tidak membutuhkan:

```text
WebSocket
SSE
push notification
```

Unread count dapat dihitung server-side.

---

# 90. Banner Visibility

Query server:

```text
is_active
AND start <= now if present
AND end >= now if present
```

Hindari client-only date filtering untuk business eligibility.

---

# 91. Featured Merchant

Database position:

```text
1..5
```

Public query:

```text
join merchants
WHERE merchant.status = ACTIVE
ORDER BY sort_order
LIMIT 5
```

---

# 92. Category Delete

Baseline:

```text
if category referenced:
    set is_active = false
else:
    allow hard delete
```

Product edit/create hanya menampilkan active category.

Existing products tetap dapat menampilkan historical category.

---

# 93. Deletion Strategy

## Product

Hard delete allowed.

Before:

```text
authorization
confirmation
```

DB handles configured cascade/set-null.

Storage images deleted after successful DB operation.

---

## Merchant

Only Super Admin.

Flow:

```text
strong confirmation
↓
administrative snapshot/moderation action
↓
database deletion transaction
↓
post-commit storage cleanup
↓
orphan account evaluation
```

---

# 94. Report Retention

Jika target dihapus:

```text
FK → SET NULL
```

snapshot name tetap disimpan.

Dengan demikian moderation history tidak hilang.

---

# 95. Logging

Gunakan structured logging wrapper.

Fields:

```text
level
event
requestId
userId if authenticated
merchantId if relevant
error code
```

Jangan log:

```text
password
raw reset token
private evidence content
full sensitive form data
```

---

# 96. Request ID

Generate request/correlation ID pada server operation penting bila belum disediakan platform.

Gunakan untuk debugging.

Tidak perlu UI exposure kecuali error support flow nanti dibutuhkan.

---

# 97. Error Handling

Internal error:

```text
log detailed server error
```

User response:

```text
safe Indonesian message
```

Jangan expose:

- stack trace;
- SQL;
- storage key sensitif;
- provider token.

---

# 98. Error Result Pattern

Recommended:

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };
```

Business errors harus menggunakan code yang stabil.

---

# 99. Security Headers

Production baseline:

```text
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: restrict unnecessary capabilities
Content-Security-Policy where compatible
frame-ancestors restriction
```

CSP harus diuji dengan:

- Supabase storage;
- Vercel assets;
- WhatsApp external navigation.

---

# 100. CSRF Protection

Authenticated mutation menggunakan:

- same-site secure session cookie;
- Auth.js protection;
- server-side origin validation where appropriate.

Route Handler state-changing endpoints harus menolak cross-origin request yang tidak diperlukan.

---

# 101. XSS Prevention

Rules:

```text
plain text description
React escaped rendering
no dangerouslySetInnerHTML for user content
validate URLs
```

Banner target URL harus divalidasi.

---

# 102. URL Validation

Banner target link:

Allow:

```text
internal relative path
https:// URL
```

Reject dangerous schemes:

```text
javascript:
data:
file:
```

---

# 103. File Security

Upload protection:

```text
MIME allowlist
size limit
decoded image validation
random generated storage name
no user filename as storage path
private bucket for evidence
```

---

# 104. Secret Management

Environment secret only:

```text
DATABASE_URL
DIRECT_URL
AUTH_SECRET
SUPABASE_SERVICE_ROLE_KEY
META_WHATSAPP_ACCESS_TOKEN
VISITOR_HASH_PEPPER
UPSTASH credentials
```

Never expose with `NEXT_PUBLIC_` unless intended public.

---

# 105. Environment Variables

Baseline:

```text
# App
APP_URL=
NODE_ENV=

# Database
DATABASE_URL=
DIRECT_URL=

# Auth
AUTH_SECRET=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PUBLIC_MEDIA_BUCKET=public-media
SUPABASE_PRIVATE_EVIDENCE_BUCKET=private-evidence

# Visitor analytics
VISITOR_HASH_PEPPER=

# WhatsApp Cloud API
META_WHATSAPP_ACCESS_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_RESET_TEMPLATE_NAME=

# Rate limit
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Seed
SEED_ADMIN_WHATSAPP=
SEED_ADMIN_PASSWORD=
```

Jika library membutuhkan variable tambahan, dokumentasikan di `.env.example`.

---

# 106. .env Policy

Repository:

```text
.env.example
```

boleh di-commit.

Dilarang commit:

```text
.env
.env.local
production secrets
```

---

# 107. Public Configuration

Jika browser membutuhkan public value:

```text
NEXT_PUBLIC_APP_NAME
```

gunakan hanya untuk non-secret.

`APP_URL` lebih baik diakses server dan diberikan ke component seperlunya.

---

# 108. Testing Strategy

Testing dibagi:

```text
Unit
Integration
E2E
```

---

# 109. Unit Tests — Vitest

Target:

- number normalization;
- slug generation;
- WhatsApp message builder;
- reference code;
- Zod schema;
- cart helper;
- analytics time window helper;
- permission helper.

---

# 110. Component Tests

Gunakan:

```text
React Testing Library
```

Target komponen penting:

- ProductCard;
- QuantityControl;
- ReportForm;
- Verification state;
- destructive confirmation.

Tidak perlu menguji implementation detail Tailwind class satu per satu.

---

# 111. Integration Tests

Target service layer:

```text
merchant registration
product ownership
product create/edit/delete
verification decision
merchant suspension
product suspension
report lifecycle
cart revalidation
analytics event
```

Gunakan test PostgreSQL database.

---

# 112. E2E Tests — Playwright

Critical paths:

```text
Visitor:
Homepage
Search
Product Detail
Add to Cart
Checkout
WhatsApp link generation

Merchant:
Register
Login
Create Product
Edit Product
Delete Product
Verification Submission

Super Admin:
Login
Verify Merchant
Suspend Product
Suspend Merchant
Handle Report
```

---

# 113. Mandatory Security E2E

Test:

```text
Merchant A login
→ request/edit Merchant B product
→ must fail
```

Juga:

```text
Suspended Merchant
→ attempt create/edit public product
→ must fail
```

---

# 114. WhatsApp Test Policy

E2E tidak perlu benar-benar mengirim WhatsApp message.

Assert:

```text
generated URL
normalized recipient number
encoded message content
analytics request behavior
```

---

# 115. File Upload Tests

Test:

```text
valid JPG
valid PNG
valid WebP
too many images
oversized file
invalid MIME
fake extension
private evidence authorization
```

---

# 116. Test Database

Preferred local/CI strategy:

```text
PostgreSQL dedicated test database
```

CI menggunakan ephemeral PostgreSQL service.

Jangan menjalankan destructive integration test terhadap production DB.

---

# 117. Local Development Database

Preferred:

```text
Docker Compose PostgreSQL
```

Jika developer tidak menggunakan Docker:

```text
dedicated Supabase development project
```

dapat digunakan.

Jangan menggunakan production database untuk local development.

---

# 118. Seed Strategy

Prisma seed:

```text
prisma/seed.ts
```

Seed dapat membuat:

- Super Admin;
- categories;
- demo merchants;
- demo products;
- banner;
- featured merchants;
- optional analytics demo data.

Seed harus idempotent sejauh praktis.

---

# 119. Demo Data

Gunakan nama dan produk demo yang relevan dengan Sungairujing/Bawean.

Jangan menggunakan lorem ipsum untuk final demo.

Demo image harus legal digunakan dan/atau dibuat khusus untuk project.

---

# 120. Lint and Formatting

Use:

```text
ESLint
Prettier
```

Scripts:

```text
npm run lint
npm run typecheck
npm run format:check
```

TypeScript:

```text
strict = true
```

---

# 121. Build Gate

Setiap phase sebelum commit final:

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

Harus pass.

Untuk phase dengan E2E:

```text
npm run test:e2e
```

juga pass pada critical flow.

---

# 122. Git Strategy

Baseline:

```text
main
feature branches optional
```

Commit scoped.

Contoh:

```text
feat: implement merchant registration
feat: add merchant product management
feat: implement whatsapp checkout
fix: enforce merchant product ownership
test: add merchant isolation coverage
```

---

# 123. CI — GitHub Actions

Pull request / push:

```text
install dependencies
generate Prisma client
lint
typecheck
unit/integration test
build
```

E2E dapat dijalankan:

- pada main;
- sebelum release;
- atau pada PR feature besar.

---

# 124. Deployment — Vercel

Stages:

```text
local
preview
production
```

Preview deploy untuk PR/branch jika integration tersedia.

Production:

```text
main branch
```

---

# 125. Production Database Migration

Jangan menjalankan migration destructive tanpa review.

Release flow:

```text
review migration
↓
backup/checkpoint
↓
prisma migrate deploy
↓
deploy application
↓
smoke test
```

Preview environment tidak boleh otomatis mengubah production schema.

---

# 126. Deployment Domain

Initial:

```text
Vercel provided domain/subdomain
```

Setelah stabil:

```text
custom domain
```

`APP_URL` diubah ke canonical domain.

QR harus menggunakan canonical production URL.

---

# 127. Storage Environment Separation

Minimal pisahkan folder/prefix atau bucket/project berdasarkan environment.

Preferred:

```text
development Supabase project
production Supabase project
```

Private evidence production jangan bercampur dengan demo/local file.

---

# 128. Database Environment Separation

Recommended:

```text
development DB
test DB
production DB
```

Preview dapat menggunakan development/preview DB sesuai workflow, tetapi tidak production DB untuk mutation testing.

---

# 129. Backup Policy

Sebelum production digunakan UMKM nyata:

- pastikan database backup strategy provider aktif atau tersedia;
- lakukan export berkala;
- dokumentasikan restore procedure;
- storage penting perlu memiliki recovery procedure.

MVP demo tetap harus dapat dibangun ulang dari migration + seed.

---

# 130. Performance Baseline

Prioritas:

```text
mobile
low-to-medium bandwidth
```

Strategies:

- optimized WebP;
- Next/Image;
- Server Components;
- minimal client JS;
- pagination;
- no heavy homepage animation;
- lazy-load chart code;
- query indexes;
- no unnecessary API roundtrip.

---

# 131. Performance Non-Goals

Jangan menambahkan pada awal:

```text
Redis data cache
CDN custom layer
search cluster
event queue
microservices
```

kecuali hasil measurement menunjukkan kebutuhan.

Redis digunakan hanya bila diperlukan untuk rate limit baseline, bukan sebagai data architecture utama.

---

# 132. Caching Policy

MVP prioritizes correctness.

Default:

```text
no custom persistent application cache
```

Protected/dashboard data selalu fresh dari server.

Public page dapat memanfaatkan built-in framework/CDN behavior untuk static assets dan images.

Data caching baru ditambahkan setelah invalidation strategy jelas.

---

# 133. Accessibility Implementation

Follow `DESIGN-SYSTEM.md`.

Requirements:

- semantic HTML;
- label every form;
- keyboard focus;
- minimum touch target;
- accessible dialog primitive;
- icon-only button aria-label;
- image alt;
- color not sole state indicator.

---

# 134. SEO

Public pages:

- unique title;
- description;
- canonical URL;
- Open Graph metadata;
- product/merchant social preview where possible.

Dashboard/admin:

```text
noindex
```

---

# 135. Sitemap and Robots

Generate public sitemap for:

```text
homepage
products
eligible product detail
merchants
eligible merchant detail
```

Exclude:

```text
dashboard
admin
private/auth pages where appropriate
suspended resources
```

---

# 136. Structured Data

Optional but recommended after core MVP:

- Product structured data only if fields accurately match available data;
- LocalBusiness structured data where appropriate.

Do not fabricate:

```text
ratings
reviews
availability counts
sales
```

---

# 137. Security Against Enumeration

Registration may say:

```text
Nomor WhatsApp sudah digunakan.
```

karena user is actively attempting registration.

Forgot password must remain generic.

Login error must remain generic.

---

# 138. Report Abuse Protection

Public report:

```text
rate limit
honeypot optional
server validation
max text length
```

CAPTCHA is not baseline.

Add only if abuse appears.

---

# 139. Analytics Privacy

Do not store:

```text
raw IP for product popularity
browser fingerprint
device fingerprint
```

Visitor identity is random first-party identifier only.

---

# 140. Buyer Privacy

Checkout form values:

```text
name
WhatsApp
address
note
```

are not stored in database.

They are only used to build WhatsApp message in current client/runtime flow.

Avoid logging checkout form payload.

---

# 141. Data Mutation Audit

Use `moderation_actions` for significant admin moderation.

Do not build generic audit system for every field edit in MVP.

---

# 142. Database Consistency Note

Implementation must follow the **named schema entities and relationships** defined in `DATABASE.md`.

Before first migration, perform one schema audit because the database document contains both baseline and recommended/optional infrastructure concepts.

The migration schema—not a manually written table count summary—becomes the final physical representation once reviewed.

Do not silently remove named business entities such as:

```text
moderation_actions
password_reset_tokens
```

without requirement review.

---

# 143. Error Pages

Provide:

```text
404
generic error boundary
public unavailable resource state
dashboard forbidden state
```

Do not expose suspension reason publicly.

---

# 144. HTTP Status Behavior

Recommended:

```text
401 unauthenticated
403 authenticated but forbidden
404 resource absent or intentionally concealed
422 validation error
429 rate limited
500 unexpected server error
```

For ownership-sensitive resources, 404 may be preferred to avoid confirming another merchant's resource existence.

---

# 145. Notification Polling

No realtime infrastructure.

Unread notification count loaded:

- dashboard navigation request;
- page refresh;
- post-mutation revalidation.

This is sufficient for MVP.

---

# 146. Browser Support

Target modern versions:

```text
Chrome
Edge
Safari
Firefox
```

No Internet Explorer/legacy browser support.

---

# 147. PWA Install UX

Do not force install popup.

If install prompt is available:

```text
offer subtle install action
```

User can continue using normal website.

---

# 148. External Dependency Failure

## Supabase Storage unavailable

Show upload error; do not persist broken DB reference.

## WhatsApp analytics insert fails

Still open WhatsApp.

## Meta WhatsApp recovery provider unavailable

Show temporary recovery unavailable state; do not fake message delivery.

## Rate limiter unavailable

Fail policy depends on endpoint:
- auth: conservative;
- public analytics: allow without blocking core UX and log error.

---

# 149. Feature Flags

Use environment/config flags only for external dependency features that may not be ready.

Example:

```text
FEATURE_WHATSAPP_PASSWORD_RECOVERY
```

Do not use feature flags to hide unfinished core requirements indefinitely.

---

# 150. Recommended Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:deploy": "prisma migrate deploy",
  "db:seed": "prisma db seed"
}
```

Exact script may be adjusted to selected stable package versions.

---

# 151. Required Project Files

Baseline repository:

```text
.env.example
.gitignore
README.md
AGENTS.md

docs/
├── PRD.md
├── BUSINESS-RULES.md
├── USER-FLOW.md
├── DATABASE.md
├── DESIGN-SYSTEM.md
├── TECHNICAL-SPEC.md
└── IMPLEMENTATION-PLAN.md

prisma/
├── schema.prisma
├── migrations/
└── seed.ts

src/
└── ...

tests/
└── ...

playwright.config.ts
vitest.config.ts
```

---

# 152. AGENTS.md Relationship

`AGENTS.md` later akan menyederhanakan aturan yang paling penting untuk Codex.

`TECHNICAL-SPEC.md` tetap menjadi detail architecture reference.

Codex harus membaca:

```text
AGENTS.md
+
relevant docs
```

sebelum implementation phase.

---

# 153. Technical Acceptance Criteria

Architecture dianggap siap ketika:

### Project

- Next.js App Router initialized;
- TypeScript strict;
- Tailwind configured;
- lint/typecheck/build pass.

### Database

- Prisma configured;
- PostgreSQL connected;
- reviewed schema migration exists;
- seed works.

### Auth

- WhatsApp login;
- password hash Argon2id;
- session secure;
- merchant authorization;
- Super Admin authorization.

### Storage

- public media upload;
- private evidence upload;
- signed private access;
- file validation;
- image optimization.

### Marketplace

- public catalog;
- search/filter/sort;
- product detail;
- merchant detail;
- cart;
- WhatsApp checkout.

### Analytics

- 24h view dedupe;
- WhatsApp click sources;
- merchant-scoped dashboard.

### Security

- tenant isolation tests pass;
- suspended state enforced;
- private evidence inaccessible publicly.

### Quality

- unit tests pass;
- integration tests pass;
- production build pass;
- critical Playwright tests pass.

---

# 154. Technical Non-Goals

Do not introduce:

```text
Microservices
GraphQL
Kubernetes
Event bus
Message broker
Complex CQRS
Elasticsearch
Buyer auth
Payment gateway
Order service
Realtime websocket infrastructure
Native mobile app
```

MVP does not justify that complexity.

---

# 155. Architecture Summary

```text
Browser / PWA
      │
      ▼
Next.js App Router
      │
      ├── Public Server Components
      ├── Auth.js
      ├── Server Actions
      ├── Route Handlers
      │
      ▼
Service Layer
      │
      ├── Authorization
      ├── Validation
      ├── Business Rules
      ├── Analytics
      ├── File Processing
      └── WhatsApp Message Builder
      │
      ▼
Repository Layer
      │
      ▼
Prisma ORM
      │
      ▼
Supabase PostgreSQL

Next.js Server
      │
      ├── Supabase Storage
      │     ├── public-media
      │     └── private-evidence
      │
      ├── Meta WhatsApp Cloud API
      │     └── password recovery
      │
      └── Upstash Redis
            └── rate limiting
```

---

# 156. Final Technical Decisions

| Area | Decision |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | React + Tailwind CSS |
| UI primitives | Radix where needed |
| Icons | Lucide |
| Forms | React Hook Form + Zod |
| Database | PostgreSQL |
| DB Provider | Supabase |
| ORM | Prisma |
| Authentication | Auth.js Credentials |
| Password | Argon2id |
| Session | JWT secure cookie |
| Storage | Supabase Storage |
| Image Processing | Sharp |
| Cart | Zustand + localStorage |
| Search | PostgreSQL ILIKE |
| WhatsApp checkout | `wa.me` click-to-chat |
| Password recovery | Meta WhatsApp Cloud API |
| Rate Limit | Upstash Redis |
| Product analytics | PostgreSQL event tables |
| Chart | Recharts |
| QR | qrcode |
| PWA | Serwist |
| Unit Test | Vitest |
| Component Test | React Testing Library |
| E2E | Playwright |
| Hosting | Vercel |
| CI | GitHub Actions |
| Package Manager | npm |

---

# 157. Next Document

Technical decisions are now sufficiently defined to create:

```text
IMPLEMENTATION-PLAN.md
```

The implementation plan must divide development into small phases with:

- goal;
- exact files/modules;
- tasks;
- tests;
- phase exit criteria;
- recommended commit;
- Codex prompt boundaries.

---

# 158. Status

**TECHNICAL-SPEC.md v1.0 — APPROVED TECHNICAL BASELINE**

Next:

```text
IMPLEMENTATION-PLAN.md
→ AGENTS.md
→ Project Initialization
→ Codex Development
```
