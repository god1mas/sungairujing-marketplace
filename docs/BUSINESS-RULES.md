# BUSINESS RULES
## Sungairujing Marketplace

**Version:** 1.0  
**Status:** Final Business Rules Baseline  
**Project:** Sungairujing Marketplace  
**Related Document:** `PRD.md`  
**Purpose:** Menetapkan aturan bisnis yang wajib dipatuhi oleh UI, API/server actions, database, authorization, analytics, dan implementasi Codex.

---

# 1. Document Purpose

Dokumen ini menerjemahkan requirement produk menjadi aturan bisnis yang eksplisit dan dapat diuji.

Aturan di dokumen ini bersifat lebih ketat daripada deskripsi fitur pada PRD.

Jika terdapat perbedaan antara implementasi dan dokumen ini, implementasi dianggap salah sampai requirement diperbarui secara resmi.

Format rule:

```text
BR-[DOMAIN]-[NUMBER]
```

Contoh:

```text
BR-AUTH-001
BR-MER-001
BR-PRO-001
```

---

# 2. Rule Priority

Urutan source of truth:

```text
Requirement Interview Final
        ↓
PRD.md
        ↓
BUSINESS-RULES.md
        ↓
Technical Specification
        ↓
Implementation Plan
        ↓
Source Code
```

Apabila technical implementation bertentangan dengan business rule, business rule harus dipertahankan kecuali dilakukan perubahan requirement resmi.

---

# 3. Core Marketplace Rules

## BR-CORE-001 — Marketplace Purpose

Sungairujing Marketplace berfungsi sebagai:

```text
Discovery
+
Catalog
+
Cart Preparation
+
WhatsApp Handoff
```

Sistem bukan payment marketplace.

---

## BR-CORE-002 — Transaction Boundary

Sistem berhenti pada saat pengguna diarahkan ke WhatsApp merchant.

Sistem tidak boleh menganggap bahwa:

```text
WhatsApp opened
=
Order confirmed
=
Payment completed
=
Sale completed
```

---

## BR-CORE-003 — No Internal Sales Claim

Data interaction seperti:

```text
Product View
WhatsApp Click
Checkout WhatsApp Click
```

tidak boleh ditampilkan sebagai:

```text
Pesanan
Penjualan
Transaksi
Pendapatan
```

---

## BR-CORE-004 — Indonesian Language

MVP menggunakan Bahasa Indonesia sebagai bahasa antarmuka utama.

Multi-language berada di luar scope MVP.

---

# 4. User Role Rules

Role utama:

```text
VISITOR
MERCHANT_ADMIN
SUPER_ADMIN
```

---

## BR-ROLE-001 — Visitor Access

Visitor tidak membutuhkan login untuk:

- melihat homepage;
- melihat katalog;
- menggunakan search;
- menggunakan filter;
- melihat produk;
- melihat merchant;
- menggunakan cart;
- checkout ke WhatsApp;
- share produk;
- melaporkan produk;
- melaporkan merchant.

---

## BR-ROLE-002 — Merchant Authentication

Semua fitur dashboard merchant membutuhkan authentication.

---

## BR-ROLE-003 — Super Admin Authentication

Semua fitur Super Admin membutuhkan authentication.

---

## BR-ROLE-004 — No Public Super Admin Registration

Tidak boleh tersedia endpoint/page public yang memungkinkan pengguna mendaftarkan dirinya sebagai Super Admin.

---

# 5. Authentication Rules

## BR-AUTH-001 — Login Identifier

Nomor WhatsApp menjadi login identifier merchant.

Format autentikasi:

```text
WhatsApp Number
+
Password
```

---

## BR-AUTH-002 — WhatsApp Number Uniqueness

Nomor WhatsApp akun harus unik.

Constraint secara konseptual:

```text
UNIQUE(account.whatsapp_number)
```

Jika nomor sudah dipakai, registrasi atau perubahan nomor harus ditolak.

---

## BR-AUTH-003 — Password Minimum

Password merchant minimal:

```text
8 karakter
```

Tidak wajib menggunakan kombinasi simbol, uppercase, lowercase, dan angka pada MVP.

---

## BR-AUTH-004 — Password Storage

Password tidak boleh disimpan dalam plaintext.

Password wajib disimpan menggunakan secure password hashing.

---

## BR-AUTH-005 — Registration OTP

Registrasi merchant MVP tidak membutuhkan OTP.

---

## BR-AUTH-006 — Password Change

Merchant dapat mengganti password sendiri jika:

```text
old_password valid
AND
new_password memenuhi minimum requirement
```

Jika password lama salah, perubahan wajib ditolak.

---

## BR-AUTH-007 — WhatsApp Number Change

Merchant tidak boleh mengganti nomor WhatsApp login sendiri.

Perubahan hanya dapat dilakukan oleh Super Admin melalui proses administratif.

---

## BR-AUTH-008 — Password Recovery

Target business requirement:

```text
Forgot Password
→ Automatic WhatsApp Recovery
```

Implementasi hanya boleh diaktifkan ketika provider/API WhatsApp yang sesuai tersedia.

Jika provider belum tersedia, sistem tidak boleh membuat alur recovery palsu.

---

# 6. Merchant Registration Rules

## BR-REG-001 — Self Registration

UMKM dapat melakukan registrasi merchant secara mandiri.

---

## BR-REG-002 — Immediate Activation

Registrasi merchant tidak memerlukan pre-approval Super Admin.

Setelah registrasi berhasil, merchant dapat login dan menggunakan dashboard.

---

## BR-REG-003 — Required Registration Data

Data minimal:

```text
Owner Name
Merchant Name
WhatsApp Number
Password
Merchant Address
Terms Acceptance
```

Email tidak diwajibkan.

Business Evidence dikumpulkan kemudian melalui alur verifikasi merchant dan
bukan syarat initial account registration.

---

## BR-REG-004 — Terms Acceptance

Registrasi tidak boleh diselesaikan jika pengguna belum menyetujui syarat dan ketentuan.

---

## BR-REG-005 — Merchant Admin Model

MVP menggunakan:

```text
1 Merchant
→ 1 active primary Merchant Admin
```

Namun database harus memungkinkan extension:

```text
1 Merchant
→ many Merchant Admins
```

tanpa redesign besar.

---

# 7. Merchant Ownership Rules

## BR-OWN-001 — Resource Ownership

Merchant Admin hanya boleh membaca atau memodifikasi resource milik merchant yang terkait dengan akunnya.

Rule:

```text
IF authenticated_user.merchant_id != resource.merchant_id
THEN reject request
```

---

## BR-OWN-002 — Server-side Enforcement

Ownership wajib diperiksa server-side.

Menyembunyikan button/menu pada UI saja tidak dianggap security enforcement.

---

## BR-OWN-003 — URL Manipulation Protection

Mengganti ID pada URL tidak boleh memungkinkan merchant mengakses resource merchant lain.

Contoh:

```text
/dashboard/products/123
```

harus tetap menjalankan ownership validation.

---

## BR-OWN-004 — Super Admin Exception

SUPER_ADMIN dapat mengakses resource lintas merchant sesuai kewenangan administratif.

---

# 8. Merchant Profile Rules

## BR-MER-001 — Merchant Slug

Setiap merchant memiliki slug unik.

Contoh:

```text
/merchant/dapur-bawean
```

---

## BR-MER-002 — Merchant Profile Fields

Profil minimal memiliki:

```text
Merchant Name
Slug
Logo/Image
Description
Address
WhatsApp
Opening Hours
Operational Status
Verification Status
```

---

## BR-MER-003 — Operational Status

Status operasional yang valid:

```text
BUKA
TUTUP
LIBUR_SEMENTARA
```

---

## BR-MER-004 — Public Visibility

Merchant aktif dapat memiliki halaman publik selama tidak sedang dibekukan.

---

## BR-MER-005 — Merchant Self Edit

Merchant Admin dapat mengedit profil merchant miliknya sendiri.

---

# 9. Merchant Verification Rules

## BR-VER-001 — Verification Status

Status valid:

```text
BELUM_DIVERIFIKASI
TERVERIFIKASI
DITOLAK
```

---

## BR-VER-002 — Verification Is Non-blocking

Merchant yang:

```text
BELUM_DIVERIFIKASI
```

tetap dapat:

- login;
- mengatur profil;
- membuat produk;
- mempublikasikan produk;
- menerima pengunjung.

---

## BR-VER-003 — Verified Badge

Badge publik hanya boleh tampil jika:

```text
verification_status = TERVERIFIKASI
```

---

## BR-VER-004 — Business Evidence Privacy

Bukti usaha tidak boleh menjadi public asset.

Hanya dapat diakses oleh:

```text
Merchant Owner
Super Admin
```

---

## BR-VER-005 — Business Evidence Limit

Maksimal:

```text
3 file
```

per merchant dalam submission aktif.

---

## BR-VER-006 — Verification Rejection

Super Admin dapat menolak verifikasi dan menyimpan alasan penolakan.

---

## BR-VER-007 — Re-submission

Merchant yang statusnya DITOLAK dapat:

```text
Update/replace evidence
→ Submit verification again
```

---

# 10. Product Ownership Rules

## BR-PRO-OWN-001

Produk selalu dimiliki tepat oleh satu merchant.

---

## BR-PRO-OWN-002

Merchant Admin hanya dapat create, update, dan delete produk untuk merchant miliknya.

---

## BR-PRO-OWN-003

Super Admin dapat melihat seluruh produk.

---

# 11. Product Rules

## BR-PRO-001 — Required Product Data

Produk minimal memiliki:

```text
Name
Slug
Description
Price
Category
Unit
Availability Status
Merchant
Moderation Status
```

---

## BR-PRO-002 — Product Availability

Status ketersediaan hanya:

```text
TERSEDIA
HABIS
```

---

## BR-PRO-003 — No Numeric Stock

MVP tidak menyimpan jumlah stok numerik.

Field seperti:

```text
stock_quantity = 12
```

tidak diperlukan.

---

## BR-PRO-004 — Quantity Is Buyer Intent

Quantity pada cart/checkout berarti jumlah yang ingin ditanyakan/dipesan pembeli.

Quantity tidak menjamin stok aktual.

---

## BR-PRO-005 — No Variant Entity

Variant seperti:

```text
250g
500g
Pedas
Original
```

tidak dibuat sebagai model/entity terpisah pada MVP.

Informasi variant ditulis pada deskripsi produk.

---

## BR-PRO-006 — Immediate Publication

Produk merchant aktif langsung dapat muncul di marketplace setelah dibuat.

Tidak ada workflow wajib:

```text
Pending
→ Approved
→ Published
```

---

## BR-PRO-007 — Publication Exception

Produk tidak boleh tampil jika:

```text
product is suspended
OR
merchant is suspended
```

---

## BR-PRO-008 — Permanent Delete

Merchant dapat menghapus produknya secara permanen.

Sebelum deletion, sistem wajib meminta confirmation.

---

## BR-PRO-009 — Moderation Reason

Jika Super Admin membekukan produk, alasan moderasi harus dapat disimpan dan ditampilkan kepada merchant terkait.

---

# 12. Product Image Rules

## BR-IMG-001 — Product Image Limit

Maksimal:

```text
5 images per product
```

---

## BR-IMG-002 — Supported Formats

Format yang diterima:

```text
JPG
JPEG
PNG
WebP
```

---

## BR-IMG-003 — Cover Image

Setiap produk dengan gambar harus dapat memiliki satu cover image.

Tidak boleh memiliki lebih dari satu cover aktif.

---

## BR-IMG-004 — Image Optimization

Image yang diterima harus melalui proses optimasi/compression yang sesuai sebelum digunakan untuk delivery publik.

---

## BR-IMG-005 — Server Validation

Server wajib memvalidasi:

```text
Mime type
File size
File count
Ownership
```

Client-side validation hanya bersifat tambahan.

---

# 13. Category Rules

## BR-CAT-001 — Global Category

Kategori bersifat global.

---

## BR-CAT-002 — Category Management

Hanya Super Admin dapat:

```text
Create Category
Update Category
Delete Category
```

---

## BR-CAT-003 — Merchant Category Restriction

Merchant hanya boleh memilih kategori yang tersedia.

Merchant tidak dapat membuat kategori baru dari Product Form.

---

## BR-CAT-004 — Category Delete Integrity

Kategori tidak boleh dihapus secara langsung jika tindakan tersebut membuat product relation invalid.

Technical Specification harus menetapkan salah satu strategi aman:

```text
RESTRICT
REASSIGN
SOFT DISABLE
```

sesuai database design.

---

# 14. Public Catalog Rules

## BR-CATALOG-001 — Public Product Eligibility

Produk boleh muncul di katalog jika seluruh kondisi berikut terpenuhi:

```text
merchant not suspended
AND
product not suspended
AND
product exists
```

Status verifikasi merchant tidak menjadi syarat publikasi.

---

## BR-CATALOG-002 — Out of Stock Visibility

Produk dengan status HABIS tetap boleh terlihat di katalog.

UI harus menunjukkan bahwa produk sedang habis.

---

## BR-CATALOG-003 — Search Scope

Global search mencakup:

```text
Product
Merchant
```

---

## BR-CATALOG-004 — Product Filters

Filter minimal:

```text
Category
Merchant
Availability
Price Range
```

---

## BR-CATALOG-005 — Product Sorting

Sorting minimal:

```text
Newest
Lowest Price
Highest Price
```

---

# 15. Product Card Rules

## BR-CARD-001

Product card minimal menampilkan:

```text
Cover Image
Product Name
Price
Merchant Name
Availability
```

---

## BR-CARD-002

Merchant location tidak wajib tampil pada product card.

---

# 16. Product Detail Rules

## BR-DETAIL-001

Detail produk minimal menampilkan:

```text
Image Gallery
Product Name
Price
Description
Category
Availability
Merchant
Merchant Location
Quantity Control
Add to Cart
WhatsApp Action
Share
Report
```

---

## BR-DETAIL-002

Jika status produk HABIS, CTA harus merefleksikan kondisi tersebut dan tidak boleh menyesatkan pengguna bahwa stok pasti tersedia.

---

# 17. Merchant Public Page Rules

## BR-PUBLIC-MER-001

Public merchant page minimal menampilkan:

```text
Logo
Merchant Name
Verification Badge when verified
Description
Address
Opening Hours
Operational Status
WhatsApp
Products
Merchant QR
```

---

## BR-PUBLIC-MER-002

Marketplace menyediakan halaman publik daftar seluruh merchant yang eligible.

---

# 18. Cart Rules

## BR-CART-001 — No Buyer Account

Cart tidak bergantung pada buyer account.

---

## BR-CART-002 — Multi-Merchant Cart

Cart dapat menyimpan item dari beberapa merchant secara bersamaan.

---

## BR-CART-003 — Merchant Grouping

Semua item cart harus dikelompokkan berdasarkan merchant.

---

## BR-CART-004 — Per-Merchant Checkout

Checkout hanya boleh dilakukan untuk satu merchant pada satu proses checkout.

Tidak boleh menghasilkan satu WhatsApp checkout untuk dua merchant berbeda.

---

## BR-CART-005 — Quantity

Quantity minimum:

```text
1
```

Quantity tidak boleh nol atau negatif.

---

## BR-CART-006 — Local Persistence

Cart disimpan secara lokal agar tetap tersedia setelah refresh selama browser storage masih tersedia.

---

## BR-CART-007 — Invalid Item Handling

Jika produk sudah:

```text
deleted
suspended
merchant suspended
```

item tersebut tidak boleh diteruskan sebagai checkout valid.

UI harus memberitahu pengguna dan meminta cart diperbarui.

---

# 19. Checkout Rules

## BR-CHK-001 — Required Buyer Data

Checkout membutuhkan:

```text
Name
WhatsApp Number
Fulfillment Method
```

Alamat dibutuhkan ketika relevan untuk metode pengiriman.

Catatan dapat bersifat opsional.

---

## BR-CHK-002 — Fulfillment Method

Nilai valid:

```text
AMBIL_SENDIRI
DIANTAR
```

---

## BR-CHK-003 — Delivery Address

Jika:

```text
fulfillment_method = DIANTAR
```

alamat/lokasi wajib diisi.

Jika:

```text
fulfillment_method = AMBIL_SENDIRI
```

alamat pembeli dapat tidak diwajibkan.

---

## BR-CHK-004 — Product Total

Sistem hanya menghitung:

```text
Product Subtotal
Product Estimated Total
```

---

## BR-CHK-005 — No Shipping Fee Calculation

Marketplace tidak menghitung ongkir pada MVP.

---

## BR-CHK-006 — Final Price Disclaimer

Total yang ditampilkan adalah estimasi produk.

Merchant mengonfirmasi:

```text
Stock
Shipping
Final Amount
Payment
```

melalui WhatsApp.

---

## BR-CHK-007 — Reference Code

Setiap checkout WhatsApp menghasilkan reference code.

Kode tersebut hanya untuk membantu komunikasi.

Kode tidak boleh dianggap sebagai order database ID.

---

## BR-CHK-008 — No Order Persistence

Checkout tidak boleh membuat entity/order transaction.

---

# 20. WhatsApp Rules

## BR-WA-001 — Target

WhatsApp action harus diarahkan ke nomor WhatsApp merchant terkait.

---

## BR-WA-002 — Checkout Message

Pesan checkout minimal memuat:

```text
Merchant Name
Product Items
Quantity
Product Subtotal/Estimated Total
Buyer Name
Buyer WhatsApp
Fulfillment Method
Address when relevant
Note when provided
Reference Code
Confirmation Request
```

---

## BR-WA-003 — Product Detail WhatsApp

Klik WhatsApp dari product detail boleh menghasilkan pesan kontekstual mengenai produk tersebut.

---

## BR-WA-004 — Merchant Profile WhatsApp

Klik WhatsApp dari merchant profile dapat membuka komunikasi umum dengan merchant.

---

# 21. Analytics Rules

## BR-ANA-001 — Analytics Is Interaction Data

Analytics hanya mengukur interaction yang dapat diketahui aplikasi.

---

## BR-ANA-002 — Product View Event

Product detail view dapat dihitung sebagai event analytics.

---

## BR-ANA-003 — View Deduplication

Aturan MVP:

```text
1 browser
+ 1 product
+ 24-hour window
= maximum 1 counted view
```

Refresh berulang dalam periode yang sama tidak menambah popular view count.

---

## BR-ANA-004 — WhatsApp Event Sources

Source yang valid:

```text
PRODUCT_DETAIL
MERCHANT_PROFILE
CHECKOUT
```

---

## BR-ANA-005 — Click Definition

WhatsApp click dihitung ketika pengguna menjalankan action untuk membuka WhatsApp.

Hal ini tidak membuktikan pesan dikirim.

---

## BR-ANA-006 — Merchant Analytics Scope

Merchant hanya dapat melihat analytics yang terkait dengan merchant miliknya.

---

## BR-ANA-007 — Analytics Period

Filter waktu minimal:

```text
TODAY
LAST_7_DAYS
LAST_30_DAYS
ALL_TIME
```

---

## BR-ANA-008 — Terminology

UI wajib menggunakan istilah:

```text
Product Views
Klik WhatsApp
Kunjungan WhatsApp
```

dan tidak boleh mengganti metrik tersebut dengan:

```text
Sales
Orders
Transactions
```

---

# 22. Popular Product Rules

## BR-POP-001 — Popularity Metric

Produk populer ditentukan berdasarkan counted product detail views.

---

## BR-POP-002 — Homepage Limit

Homepage menampilkan maksimal:

```text
8 products
```

pada section Produk Populer.

---

## BR-POP-003 — Eligibility

Produk suspended atau produk dari merchant suspended tidak boleh tampil sebagai Produk Populer.

---

## BR-POP-004 — Naming

Label harus:

```text
Produk Populer
```

bukan:

```text
Produk Terlaris
```

---

# 23. Featured Merchant Rules

## BR-FEAT-001

Super Admin dapat menandai merchant sebagai featured.

---

## BR-FEAT-002

Homepage menampilkan maksimal:

```text
5 featured merchants
```

---

## BR-FEAT-003

Merchant suspended tidak boleh tampil sebagai featured merchant meskipun sebelumnya dipilih.

---

# 24. Banner Rules

## BR-BANNER-001 — Fields

Banner minimal memiliki:

```text
Title
Description
Image
CTA Text
Target URL
Start Date
End Date
Status
```

---

## BR-BANNER-002 — Visibility

Banner hanya boleh tampil jika:

```text
status = ACTIVE
AND
current_date >= start_date
AND
current_date <= end_date
```

Jika start/end date optional pada implementation, behavior harus dijelaskan eksplisit pada Technical Specification.

---

## BR-BANNER-003 — Super Admin Ownership

Hanya Super Admin dapat create/update/delete/activate banner.

---

# 25. Reporting Rules

## BR-REP-001 — Reportable Target

Target laporan:

```text
PRODUCT
MERCHANT
```

---

## BR-REP-002 — Anonymous Report

Pelapor tidak wajib login.

---

## BR-REP-003 — Reporter Identity

Data berikut opsional:

```text
Reporter Name
Reporter WhatsApp
```

---

## BR-REP-004 — Report Reasons

Alasan minimal:

```text
ILLEGAL_OR_PROHIBITED
DANGEROUS_PRODUCT
FRAUD_OR_MISLEADING
PHOTO_DESCRIPTION_MISMATCH
SPAM
OTHER
```

---

## BR-REP-005 — Other Reason

Jika:

```text
reason = OTHER
```

deskripsi alasan wajib diisi.

---

## BR-REP-006 — Report Status

Status valid:

```text
BARU
DITINJAU
SELESAI
DITOLAK
```

---

## BR-REP-007 — No Automatic Suspension

Jumlah laporan tidak boleh otomatis membekukan merchant atau produk.

Semua tindakan moderasi membutuhkan keputusan Super Admin.

---

# 26. Product Moderation Rules

## BR-MOD-PRO-001

Super Admin dapat membekukan produk.

---

## BR-MOD-PRO-002

Produk suspended tidak tampil di:

```text
Catalog
Search
Product Recommendations
Popular Products
Merchant Public Product List
```

---

## BR-MOD-PRO-003

Merchant dapat melihat bahwa produknya dibekukan beserta alasan jika tersedia.

---

## BR-MOD-PRO-004

Merchant tidak boleh mengaktifkan sendiri produk yang dibekukan oleh Super Admin.

---

# 27. Merchant Suspension Rules

## BR-SUS-001 — Suspension Effect

Merchant suspended:

```text
can login
can view dashboard
can view suspension reason
cannot publish/update public marketplace content
```

---

## BR-SUS-002 — Public Effect

Ketika merchant dibekukan:

```text
Merchant public availability disabled
All merchant products hidden
Featured status ignored
WhatsApp public CTA disabled/hidden as appropriate
```

---

## BR-SUS-003 — Data Preservation

Suspension tidak menghapus merchant, produk, analytics, laporan, atau file.

---

## BR-SUS-004 — Reactivation

Hanya Super Admin dapat mengaktifkan kembali merchant.

---

## BR-SUS-005 — Suspension Reason

Reason pembekuan harus dapat disimpan.

---

# 28. Deletion Rules

## BR-DEL-001 — Product Confirmation

Permanent product delete membutuhkan confirmation.

---

## BR-DEL-002 — Merchant Actions

Super Admin memiliki dua tindakan berbeda:

```text
Suspend
Delete Permanently
```

---

## BR-DEL-003 — Merchant Permanent Delete Confirmation

Permanent merchant deletion membutuhkan confirmation yang lebih kuat dibanding suspension.

---

## BR-DEL-004 — Referential Integrity

Permanent delete tidak boleh meninggalkan broken references.

Database Design harus menentukan tindakan eksplisit untuk:

```text
Product
Product Image
Analytics Event
Report
Verification Evidence
Notifications
Featured Merchant
```

---

## BR-DEL-005 — Audit-sensitive Data

Jika data tertentu dibutuhkan untuk moderation/audit integrity, Technical Specification dapat memilih retention/soft-delete/set-null selama tidak bertentangan dengan product behavior.

---

# 29. Notification Rules

## BR-NOTIF-001 — Internal Only

MVP menggunakan notifikasi internal dashboard.

---

## BR-NOTIF-002 — Relevant Events

Notifikasi merchant dapat dibuat untuk:

```text
Verification Approved
Verification Rejected
Product Suspended
Merchant Suspended
```

---

## BR-NOTIF-003 — Ownership

Merchant hanya boleh membaca notifikasi untuk merchant/akun miliknya.

---

## BR-NOTIF-004 — No External Notification Requirement

Email, push notification, dan WhatsApp notification otomatis bukan requirement MVP.

---

# 30. Product Share Rules

## BR-SHARE-001

Product detail menyediakan share action.

---

## BR-SHARE-002

Preferred behavior:

```text
IF Web Share API supported
THEN native share
ELSE copy link
```

---

# 31. Merchant QR Rules

## BR-QR-001

QR merchant mengarah ke public merchant URL:

```text
/merchant/{slug}
```

---

## BR-QR-002

Tidak ada QR individual untuk produk pada MVP.

---

# 32. Homepage Rules

## BR-HOME-001 — Section Order

Baseline homepage:

```text
Navbar
Hero + Search
Categories
Popular Products
Featured Merchants
Banner/Promo
About
Footer
```

Urutan dapat disesuaikan oleh UI design selama seluruh section requirement tetap terpenuhi dan tidak mengubah business behavior.

---

## BR-HOME-002 — No Fake Statistics

Homepage tidak boleh menggunakan statistik palsu untuk kebutuhan dekorasi.

Contoh yang dilarang jika datanya tidak nyata:

```text
10.000+ transaksi
500+ pembeli puas
1.000+ produk terjual
```

---

# 33. UI/UX Business Rules

## BR-UX-001 — Mobile First

Semua primary flow wajib usable pada smartphone.

---

## BR-UX-002 — Clear CTA

CTA seperti:

```text
Tambah ke Keranjang
Checkout Merchant
Hubungi via WhatsApp
Laporkan
```

harus jelas dan tidak ambigu.

---

## BR-UX-003 — Operational Truth

UI harus mencerminkan state aktual:

```text
HABIS
TUTUP
LIBUR_SEMENTARA
SUSPENDED
UNVERIFIED
VERIFIED
```

tanpa membuat klaim yang tidak didukung data.

---

## BR-UX-004 — No AI Slop Pattern

Design tidak boleh secara sengaja menggunakan:

```text
gratuitous gradients
excessive glassmorphism
decorative cards everywhere
fake metrics
generic filler copy
unnecessary animation
```

---

# 34. PWA Rules

## BR-PWA-001

Web app harus tetap dapat digunakan sebagai website tanpa instalasi PWA.

---

## BR-PWA-002

Jika browser mendukung installability, user dapat Add to Home Screen/install.

---

## BR-PWA-003

PWA tidak boleh menjadi dependency wajib untuk core marketplace usage.

---

# 35. Security Rules

## BR-SEC-001 — Authentication Required

Dashboard routes harus memverifikasi session/authentication server-side.

---

## BR-SEC-002 — Authorization Required

Authentication saja tidak cukup.

Setiap protected operation juga harus memverifikasi authorization.

---

## BR-SEC-003 — Merchant Isolation

Semua resource merchant harus di-scope berdasarkan merchant ownership.

---

## BR-SEC-004 — Input Validation

Semua input dari client dianggap untrusted.

Server melakukan validation sebelum persist/mutation.

---

## BR-SEC-005 — Private File Access

Bukti usaha tidak boleh tersedia melalui predictable public URL tanpa access control.

---

## BR-SEC-006 — File Upload Safety

Upload harus membatasi:

```text
Allowed MIME type
Maximum file size
Maximum count
```

---

## BR-SEC-007 — Admin Action Protection

Operation administratif seperti:

```text
Suspend merchant
Delete merchant
Suspend product
Verification decision
Change login WhatsApp
```

hanya boleh dilakukan oleh Super Admin.

---

# 36. Dashboard Metric Rules

## BR-MET-001 — Merchant Overview

Merchant Overview minimal dapat menghitung:

```text
Total Products
Available Products
Suspended Products
WhatsApp Clicks
```

---

## BR-MET-002 — Super Admin Overview

Super Admin Overview minimal dapat menghitung:

```text
Total Merchants
Active Merchants
Suspended Merchants
Total Products
Suspended Products
Total Categories
```

---

## BR-MET-003 — Metric Accuracy

Dashboard tidak boleh menampilkan placeholder/fake number pada production.

---

# 37. Demo Data Rules

## BR-DEMO-001

Development/demo environment harus dapat menggunakan seed data.

---

## BR-DEMO-002

Seed minimal dapat menyediakan contoh:

```text
Super Admin
Merchant
Category
Product
Banner
Featured Merchant
```

---

## BR-DEMO-003

Seed credential untuk development tidak boleh digunakan sebagai production secret.

---

# 38. Development Quality Rules

## BR-DEV-001 — Phase Gate

Sebelum masuk phase berikutnya:

```text
Implementation
→ Lint
→ Test
→ Build
→ Review
→ Commit
```

harus berjalan sesuai acceptance phase.

---

## BR-DEV-002 — Broken Build

Jangan melanjutkan development feature baru jika production build sedang gagal karena perubahan sebelumnya.

---

## BR-DEV-003 — Clear Commit

Commit harus scoped dan deskriptif.

Contoh:

```text
feat: implement merchant registration
feat: implement product management
fix: enforce merchant product ownership
```

---

# 39. Explicit Out-of-Scope Rules

Codex/developer tidak boleh menambahkan fitur berikut tanpa perubahan requirement:

```text
Buyer Account
Wishlist
Rating
Review
Payment Gateway
Internal Payment
Shipping API
Automatic Shipping Fee
Numeric Stock
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

## BR-SCOPE-001 — No Scope Assumption

Fitur yang umum di marketplace lain tidak otomatis menjadi requirement Sungairujing Marketplace.

---

## BR-SCOPE-002 — Change Control

Penambahan fitur out-of-scope harus melalui:

```text
Requirement Decision
→ PRD Update
→ Business Rule Update
→ Technical Review
→ Implementation
```

---

# 40. Business Rule Decision Matrix

| Domain | Decision |
|---|---|
| Buyer account | Tidak ada |
| Merchant registration | Self-register, langsung aktif |
| Registration OTP | Tidak digunakan pada MVP |
| Merchant verification | Ada, non-blocking |
| Product approval | Tidak ada |
| Product moderation | Ada |
| Stock | Tersedia/Habis |
| Numeric inventory | Tidak ada |
| Product variants | Deskripsi saja |
| Cart | Multi-merchant grouped cart |
| Checkout | Per merchant |
| Order database | Tidak ada |
| Payment | Di luar website |
| Shipping fee | Dikonfirmasi via WhatsApp |
| Analytics | Views + WhatsApp clicks |
| Popularity | Product detail views |
| Buyer review/rating | Tidak ada |
| QR | Merchant only |
| Report | Produk + Merchant |
| Report auto suspend | Tidak |
| Merchant suspension | Super Admin |
| Product suspension | Super Admin |
| PWA | Ya |
| Language | Bahasa Indonesia |
| Super Admin registration | Tidak publik |

---

# 41. Critical Rules for Codex

Rule berikut dianggap **non-negotiable**:

```text
1. Never create buyer accounts.
2. Never create internal order records.
3. Never interpret WhatsApp click as a sale.
4. Never allow merchant cross-tenant access.
5. Never expose business evidence publicly.
6. Never require product approval before publication.
7. Never auto-suspend based only on report count.
8. Never allow suspended merchant products to remain publicly visible.
9. Never allow merchant to unsuspend admin-suspended product.
10. Never implement out-of-scope marketplace features without requirement update.
```

---

# 42. Validation Checklist

Sebelum suatu fitur dianggap selesai, periksa:

### Authentication
- nomor WhatsApp unik;
- password aman;
- role sesuai;
- protected route aman.

### Merchant
- ownership enforcement;
- verification behavior benar;
- suspension behavior benar.

### Product
- merchant ownership;
- status publik benar;
- image limit benar;
- moderation benar.

### Cart
- multi-merchant grouping benar;
- checkout per merchant;
- invalid item handling.

### WhatsApp
- nomor merchant benar;
- message benar;
- analytics source benar.

### Reporting
- anonymous report bisa;
- tidak ada auto suspension;
- Super Admin dapat review.

### Analytics
- view dedupe;
- terminology benar;
- merchant hanya melihat data sendiri.

---

# 43. Status

**BUSINESS-RULES.md v1.0 — APPROVED BASELINE**

Tahap berikutnya:

```text
USER-FLOW.md
→ DATABASE.md
→ DESIGN-SYSTEM.md
→ TECHNICAL-SPEC.md
→ IMPLEMENTATION-PLAN.md
→ AGENTS.md
→ Development
```
