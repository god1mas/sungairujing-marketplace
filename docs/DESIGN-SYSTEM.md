# DESIGN SYSTEM
## Sungairujing Marketplace

**Version:** 1.0  
**Status:** Design System Baseline  
**Project:** Sungairujing Marketplace  
**Related Documents:** `PRD.md`, `BUSINESS-RULES.md`, `USER-FLOW.md`, `DATABASE.md`  
**Platform:** Responsive Web / PWA  
**Primary Language:** Bahasa Indonesia  
**Design Approach:** Mobile-first  
**Visual Direction:** Modern Marketplace × Identitas Lokal Sungairujing/Bawean  

---

# 1. Purpose

Dokumen ini menetapkan fondasi visual, komponen UI, interaction states, responsive behavior, dan prinsip pengalaman pengguna untuk Sungairujing Marketplace.

Design system harus membantu implementasi tetap:

- konsisten;
- mudah digunakan;
- cepat dipahami;
- ringan;
- responsive;
- tidak terasa seperti template AI generik;
- tetap memiliki identitas lokal tanpa dekorasi berlebihan.

Dokumen ini menjadi acuan untuk:

- wireframe;
- high-fidelity UI;
- frontend implementation;
- component library;
- accessibility;
- visual QA;
- review Codex.

---

# 2. Design Philosophy

Arah utama:

```text
Modern Marketplace
+
Local Identity
+
Simple Interaction
+
Mobile First
```

Sungairujing Marketplace bukan website korporat formal, bukan dashboard futuristik, dan bukan landing page startup yang penuh dekorasi.

Fokus utamanya adalah:

```text
produk
merchant
harga
ketersediaan
aksi
```

Setiap keputusan desain harus membantu pengguna menemukan informasi tersebut lebih cepat.

---

# 3. Core Principles

## 3.1 Clarity Before Decoration

Visual harus memperjelas fungsi.

Jika suatu elemen tidak membantu:

- memahami konten;
- melakukan aksi;
- membedakan state;
- membangun hierarchy;

maka elemen tersebut tidak perlu ditambahkan.

---

## 3.2 Product-first

Foto produk dan informasi produk menjadi elemen visual utama.

Prioritas card:

```text
Photo
↓
Product Name
↓
Price
↓
Merchant
↓
Availability
```

---

## 3.3 Familiar Marketplace Pattern

Gunakan pola interaksi yang sudah umum:

- search bar jelas;
- card produk sederhana;
- filter mudah ditemukan;
- keranjang memiliki quantity control;
- checkout memiliki ringkasan;
- tombol WhatsApp jelas.

Jangan menciptakan pola navigasi eksperimental yang membingungkan.

---

## 3.4 Local Identity Without Forced Ornament

Identitas Sungairujing/Bawean hadir melalui:

- nama brand;
- copy;
- foto produk;
- foto merchant;
- banner;
- konten lokal;
- penggunaan warna brand.

Hindari motif lokal dekoratif yang dipaksakan pada setiap section.

---

## 3.5 Mobile-first

Semua komponen harus dirancang mulai dari layar smartphone.

Baseline:

```text
Mobile
→ Tablet
→ Desktop
```

Desktop tidak boleh menjadi desain utama yang kemudian sekadar diperkecil.

---

# 4. Anti-AI-Slop Rules

Hindari pola berikut:

```text
❌ gradient ungu-biru generik
❌ glassmorphism berlebihan
❌ card besar untuk setiap section
❌ rounded corner ekstrem di semua elemen
❌ glow
❌ neon
❌ icon dekoratif tanpa fungsi
❌ ilustrasi 3D generik
❌ floating blob
❌ section filler
❌ fake statistics
❌ headline marketing generik
❌ excessive shadow
❌ excessive animation
```

Tampilan harus terasa seperti marketplace nyata yang didesain untuk dipakai, bukan hanya dipresentasikan.

---

# 5. Brand Personality

Brand personality:

```text
Lokal
Hangat
Terpercaya
Sederhana
Praktis
Modern
```

Bukan:

```text
Mewah berlebihan
Futuristik
Kaku
Formal korporat
Gimmicky
```

---

# 6. Brand Color Direction

Warna utama:

```text
Hijau
+
Putih
+
Neutral
```

Hijau dipilih untuk:

- identitas brand;
- CTA utama;
- active state;
- verification/accent tertentu.

Gunakan hijau secara terkontrol.

Jangan membuat seluruh halaman menjadi hijau.

---

# 7. Color Tokens

Baseline token recommendation:

```text
--color-brand-50:  #F2F9F4
--color-brand-100: #DDF1E3
--color-brand-200: #BCE3C8
--color-brand-300: #91CFA4
--color-brand-400: #5EB279
--color-brand-500: #31935A
--color-brand-600: #247747
--color-brand-700: #1E603B
--color-brand-800: #1B4D32
--color-brand-900: #173F2A
```

Primary recommendation:

```text
Primary: brand-600
Primary Hover: brand-700
Primary Soft Background: brand-50
```

---

# 8. Neutral Colors

```text
--color-white:      #FFFFFF
--color-neutral-50: #FAFAFA
--color-neutral-100:#F5F5F5
--color-neutral-200:#E5E5E5
--color-neutral-300:#D4D4D4
--color-neutral-400:#A3A3A3
--color-neutral-500:#737373
--color-neutral-600:#525252
--color-neutral-700:#404040
--color-neutral-800:#262626
--color-neutral-900:#171717
--color-black:      #0A0A0A
```

Recommended page background:

```text
#FAFAFA atau #FFFFFF
```

---

# 9. Semantic Colors

## Success

```text
success-bg:   #F0FDF4
success-text: #166534
success-border:#BBF7D0
```

## Warning

```text
warning-bg:   #FFFBEB
warning-text: #92400E
warning-border:#FDE68A
```

## Error

```text
error-bg:   #FEF2F2
error-text: #991B1B
error-border:#FECACA
```

## Info

```text
info-bg:   #EFF6FF
info-text: #1D4ED8
info-border:#BFDBFE
```

---

# 10. State Color Mapping

```text
TERSEDIA
→ green/success

HABIS
→ neutral or warning

TERVERIFIKASI
→ green/success

BELUM_DIVERIFIKASI
→ neutral/info

DITOLAK
→ error

SUSPENDED
→ error/warning depending context

BUKA
→ success

TUTUP
→ neutral

LIBUR_SEMENTARA
→ warning
```

Warna tidak boleh menjadi satu-satunya pembeda state.

Selalu gunakan label teks.

---

# 11. Typography

Gunakan maksimal 2 font family.

Recommendation:

```text
Primary UI Font:
Inter

Fallback:
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Jika ingin sedikit identitas brand, heading dapat menggunakan font kedua yang tetap bersih, tetapi bukan requirement.

Untuk MVP, satu font `Inter` sudah cukup.

---

# 12. Typography Scale

## Display

```text
Display Large
48px / 56px
700

Display Medium
40px / 48px
700
```

Gunakan hanya pada hero desktop.

---

## Heading

```text
H1
32px / 40px
700

H2
28px / 36px
700

H3
24px / 32px
600

H4
20px / 28px
600
```

---

## Body

```text
Body Large
18px / 28px
400

Body
16px / 24px
400

Body Small
14px / 20px
400
```

---

## Label

```text
Label Large
14px / 20px
600

Label Small
12px / 16px
600
```

---

# 13. Mobile Typography

Pada mobile:

```text
Hero H1
28–32px

Section Heading
22–24px

Card Product Name
14–16px

Price
16–18px / semibold

Body
14–16px
```

Jangan menggunakan heading oversized yang menghabiskan layar.

---

# 14. Font Weight

Gunakan weight:

```text
400 Regular
500 Medium
600 Semibold
700 Bold
```

Hindari terlalu banyak kombinasi weight.

---

# 15. Spacing System

Gunakan basis 4px.

Token:

```text
1 = 4px
2 = 8px
3 = 12px
4 = 16px
5 = 20px
6 = 24px
8 = 32px
10 = 40px
12 = 48px
16 = 64px
20 = 80px
```

---

# 16. Layout Container

Desktop content max-width:

```text
1200–1280px
```

Recommended:

```text
max-width: 1280px
```

Horizontal padding:

```text
Mobile: 16px
Tablet: 24px
Desktop: 32px
```

---

# 17. Grid System

## Mobile

```text
1–2 columns
```

Product grid:

```text
2 columns preferred
```

untuk katalog jika ukuran card masih terbaca.

---

## Tablet

```text
2–3 product columns
```

---

## Desktop

```text
4 product columns
```

Optional 5 columns jika width dan card tetap nyaman.

---

# 18. Border Radius

Gunakan radius moderat.

```text
radius-sm: 6px
radius-md: 10px
radius-lg: 14px
radius-xl: 18px
```

Recommendation:

```text
Input: 10px
Button: 10px
Product Card: 12–14px
Modal: 16px
```

Hindari radius 28–40px pada semua elemen.

---

# 19. Borders

Baseline:

```text
1px solid neutral-200
```

Gunakan border untuk membedakan:

- input;
- card;
- table;
- dropdown;
- panel.

Jangan selalu menggunakan shadow.

---

# 20. Shadow

Gunakan sangat ringan.

```text
shadow-sm:
0 1px 2px rgba(0,0,0,0.05)

shadow-md:
0 4px 12px rgba(0,0,0,0.08)
```

Product card default boleh hanya border tanpa shadow.

---

# 21. Iconography

Gunakan satu icon set konsisten.

Recommendation:

```text
Lucide Icons
```

Style:

```text
outline
simple
consistent stroke
```

Jangan mencampur banyak icon library.

---

# 22. Icon Sizes

```text
16px → inline/meta
18px → button
20px → navigation
24px → major action
```

Icon harus ditemani label ketika fungsi tidak langsung jelas.

---

# 23. Button System

## Primary Button

Gunakan untuk aksi utama.

```text
Background: brand-600
Text: white
Hover: brand-700
Height: 44–48px
Radius: 10px
```

Contoh:

```text
Tambah ke Keranjang
Checkout Merchant
Simpan Produk
```

---

## Secondary Button

```text
Background: white
Border: neutral-300
Text: neutral-800
```

Contoh:

```text
Bagikan
Batal
Kembali
```

---

## Destructive Button

```text
Background: error/danger
Text: white
```

Contoh:

```text
Hapus Produk
Hapus Merchant
```

---

## WhatsApp Button

Boleh menggunakan brand green utama marketplace.

Jangan meniru warna WhatsApp secara agresif jika mengganggu brand consistency.

Label harus jelas:

```text
Hubungi via WhatsApp
Checkout via WhatsApp
```

---

# 24. Button Sizes

```text
sm: 36px
md: 44px
lg: 48px
```

Mobile primary action:

```text
minimum height 44px
```

untuk touch target.

---

# 25. Button States

Setiap button harus memiliki:

```text
default
hover
focus
active
disabled
loading
```

Loading button:

```text
spinner + action label
```

Contoh:

```text
Menyimpan...
```

---

# 26. Input System

Input minimum height:

```text
44px
```

Style:

```text
white background
neutral border
clear label
placeholder subtle
```

Input selalu memiliki label eksplisit.

Jangan hanya menggunakan placeholder sebagai label.

---

# 27. Input States

```text
default
focus
filled
error
disabled
readonly
```

Focus:

```text
brand border
visible focus ring
```

Error:

```text
red border
error message underneath
```

---

# 28. Form Structure

Urutan:

```text
Label
Input
Helper text / Error
```

Contoh:

```text
Nomor WhatsApp
[ 08xxxxxxxxxx ]
Gunakan nomor WhatsApp aktif.
```

---

# 29. Validation Message

Gunakan bahasa manusia.

Baik:

```text
Nomor WhatsApp ini sudah digunakan.
```

Buruk:

```text
Constraint violation: users_whatsapp_number_key
```

---

# 30. Search Component

Search bar harus prominent terutama pada homepage.

Mobile:

```text
full width
```

Desktop:

```text
max width sekitar 560–640px
```

Search field:

```text
Search icon
Placeholder:
"Cari produk atau merchant..."
```

---

# 31. Product Card

Struktur:

```text
[Product Image]

Product Name
Price

Merchant Name
Availability Badge
```

Card tidak perlu memiliki banyak icon.

---

# 32. Product Card Image

Recommended aspect ratio:

```text
1:1
```

atau:

```text
4:3
```

Pilih satu dan gunakan konsisten.

Recommendation:

```text
1:1
```

karena cocok untuk marketplace dan grid mobile.

Gunakan:

```text
object-fit: cover
```

---

# 33. Product Card Text Rules

Product name:

```text
max 2 lines
```

Merchant name:

```text
max 1 line
```

Harga harus lebih menonjol daripada nama merchant.

---

# 34. Product Availability Badge

### Tersedia

```text
Tersedia
```

### Habis

```text
Habis
```

Jangan hanya menggunakan dot warna.

---

# 35. Product Detail Layout

## Mobile

```text
Image Gallery
Product Information
Availability
Merchant Info
Quantity
Primary Actions
Description
Category
Report
```

## Desktop

```text
Left:
Image Gallery

Right:
Name
Price
Availability
Merchant
Quantity
CTA
```

Description dan informasi tambahan dapat berada di bawah.

---

# 36. Product Gallery

Max 5 images.

Mobile:

```text
main image + horizontal thumbnail scroll
```

Desktop:

```text
main image + thumbnail rail/grid
```

Cover image menjadi image pertama.

---

# 37. Quantity Control

Structure:

```text
[-] 1 [+]
```

Minimum:

```text
1
```

Touch target setiap control minimal 40–44px.

---

# 38. Merchant Card

Minimal:

```text
Logo
Merchant Name
Verification Badge if verified
Short Description or Location
Operational Status
```

Jangan terlalu padat.

---

# 39. Verification Badge

Verified:

```text
✓ Terverifikasi
```

Badge harus sederhana.

Tidak perlu membuat badge terlihat seperti official government certification.

Unverified tidak harus memiliki badge besar.

Jika ditampilkan:

```text
Belum Diverifikasi
```

gunakan neutral style.

---

# 40. Merchant Public Page

Header:

```text
Logo
Merchant Name
Verification
Operational Status
Description
Address
Opening Hours
WhatsApp CTA
QR Action
```

Setelah header:

```text
Merchant Products
```

---

# 41. Operational Status Component

### Buka

```text
● Buka
```

### Tutup

```text
● Tutup
```

### Libur Sementara

```text
● Libur sementara
```

Warna adalah pendukung, teks tetap utama.

---

# 42. Cart Layout

Cart harus dikelompokkan berdasarkan merchant.

```text
Merchant A
----------------
Product Item
Product Item

Subtotal
[Checkout Merchant A]
```

Lalu merchant berikutnya.

---

# 43. Cart Product Item

Minimal:

```text
Thumbnail
Name
Price
Quantity Control
Subtotal
Remove
```

Mobile:

Gunakan layout compact.

Jangan membuat setiap item terlalu tinggi.

---

# 44. Checkout Layout

Struktur:

```text
Checkout Header

Merchant Information

Order Summary

Buyer Form

Fulfillment

Estimated Product Total

WhatsApp CTA
```

Pada mobile, CTA utama boleh sticky di bawah jika tidak menutupi konten.

---

# 45. Checkout Disclaimer

Gunakan copy jelas:

```text
Total di atas merupakan estimasi harga produk.
Ketersediaan, ongkir, dan total akhir akan dikonfirmasi merchant melalui WhatsApp.
```

---

# 46. WhatsApp CTA Copy

Gunakan:

```text
Lanjut ke WhatsApp
```

atau:

```text
Checkout via WhatsApp
```

Jangan:

```text
Bayar Sekarang
Pesanan Berhasil
Beli Sekarang
```

jika itu mengimplikasikan transaksi selesai.

---

# 47. Filter UI

## Mobile

Gunakan:

```text
Filter button
→ bottom sheet / drawer
```

Filter:

```text
Category
Merchant
Availability
Price Range
```

---

## Desktop

Gunakan sidebar atau horizontal filter controls tergantung layout.

Recommendation:

```text
Sidebar filter
+
product grid
```

---

# 48. Sorting UI

Dropdown sederhana:

```text
Urutkan:
Terbaru
Harga Terendah
Harga Tertinggi
```

---

# 49. Navbar — Public

Desktop:

```text
Logo
Produk
Merchant
Search / optional compact search
Cart
Masuk / Dashboard
```

Mobile:

```text
Logo
Search access
Cart
Menu
```

---

# 50. Mobile Bottom Navigation

Jika digunakan, baseline:

```text
Beranda
Produk
Merchant
Keranjang
```

Dashboard/auth action tidak perlu dipaksakan masuk bottom nav public.

---

# 51. Dashboard Layout

Desktop:

```text
Sidebar
Topbar
Main Content
```

Mobile:

```text
Topbar
Main Content
Bottom/Nav Drawer
```

Dashboard harus terasa seperti admin tool yang sederhana, bukan analytics-heavy SaaS.

---

# 52. Merchant Dashboard Navigation

```text
Overview
Produk
Profil Merchant
Verifikasi
Analytics
Notifikasi
Pengaturan Akun
```

---

# 53. Super Admin Navigation

```text
Overview
Merchant
Verifikasi
Produk
Kategori
Laporan
Banner
Merchant Pilihan
Pengaturan
```

---

# 54. Dashboard Card Rules

Metric card hanya digunakan untuk informasi ringkas.

Contoh merchant:

```text
Total Produk
Produk Tersedia
Produk Dibekukan
Klik WhatsApp
```

Tidak perlu semua section dibungkus card besar.

---

# 55. Dashboard Charts

Chart harus sederhana.

Recommendation:

```text
Line chart
```

untuk:

```text
Product Views
WhatsApp Clicks
```

Hindari:

- 3D chart;
- gradient area berlebihan;
- chart dekoratif tanpa data.

---

# 56. Table Design

Desktop admin dapat menggunakan table.

Header:

```text
neutral subtle background
```

Rows:

```text
44–56px height
```

Actions:

```text
View
Edit
Suspend
More
```

Destructive action jangan menjadi primary action.

---

# 57. Mobile Data List

Pada mobile, table kompleks harus berubah menjadi list/card compact.

Contoh product management:

```text
Image
Product Name
Status
Price
[More]
```

---

# 58. Status Badge System

Gunakan satu komponen `Badge`.

Variants:

```text
success
warning
error
info
neutral
```

Map:

```text
TERSEDIA → success
HABIS → neutral
TERVERIFIKASI → success
BELUM_DIVERIFIKASI → neutral/info
DITOLAK → error
SUSPENDED → error
BUKA → success
TUTUP → neutral
LIBUR_SEMENTARA → warning
```

---

# 59. Alert Component

Gunakan untuk state penting.

### Suspension Alert

```text
Merchant Anda sedang dibekukan.
Alasan: ...
```

### Verification Rejected

```text
Verifikasi ditolak.
Silakan perbarui bukti usaha dan kirim ulang.
```

---

# 60. Modal

Gunakan modal untuk:

```text
confirmation
destructive action
short focused forms
```

Jangan gunakan modal untuk halaman panjang.

---

# 61. Confirmation Dialog

Delete product:

```text
Hapus produk?

Produk "Koncok-Koncok" akan dihapus permanen.
Tindakan ini tidak dapat dibatalkan.

[Batal] [Hapus Produk]
```

---

# 62. Strong Confirmation — Merchant Delete

Karena lebih berisiko:

```text
Hapus merchant secara permanen?

Seluruh data merchant dan produk terkait dapat terhapus.
Tindakan ini tidak dapat dibatalkan.

[Batal] [Hapus Permanen]
```

Optional technical implementation dapat meminta merchant name confirmation.

---

# 63. Toast

Gunakan untuk feedback singkat:

```text
Produk berhasil disimpan.
Tautan berhasil disalin.
Laporan berhasil dikirim.
```

Toast tidak digunakan untuk error kritis yang membutuhkan tindakan.

---

# 64. Empty State

Empty state harus sederhana.

Contoh:

### Cart

```text
Keranjang masih kosong.

Temukan produk UMKM Sungairujing dan tambahkan produk yang ingin kamu tanyakan.

[Lihat Produk]
```

### Merchant Product

```text
Belum ada produk.
```

### Search

```text
Produk atau merchant tidak ditemukan.
Coba kata kunci lain atau hapus beberapa filter.
```

---

# 65. Loading State

Gunakan skeleton sederhana untuk:

```text
product grid
merchant cards
dashboard metrics
```

Jangan menggunakan loading animation dekoratif.

---

# 66. Error State

Error message harus:

- menjelaskan apa yang gagal;
- memberi next action.

Contoh:

```text
Produk tidak dapat dimuat.
Coba muat ulang halaman.
```

CTA:

```text
Coba Lagi
```

---

# 67. Suspended Product Public State

Jika direct URL dibuka:

```text
Produk tidak tersedia.
Produk ini tidak dapat ditampilkan saat ini.
```

Jangan expose internal moderation reason kepada visitor.

---

# 68. Suspended Merchant Public State

Public page dapat menampilkan:

```text
Merchant tidak tersedia saat ini.
```

Jangan tampilkan internal suspension reason kepada publik.

---

# 69. Merchant Dashboard Suspension State

Internal dashboard boleh menampilkan:

```text
Akun merchant sedang dibekukan.

Alasan:
{reason}

Anda masih dapat melihat dashboard, tetapi tidak dapat mengubah konten publik.
```

---

# 70. Verification UI

Status section:

```text
Belum Diverifikasi
Terverifikasi
Ditolak
```

Jika ditolak:

```text
Reason
Evidence uploader
Submit again
```

---

# 71. Business Evidence Upload

Max:

```text
3 files
```

UI harus menampilkan:

```text
File name
File type
Upload progress
Remove
```

Tambahkan copy:

```text
Bukti usaha hanya dapat dilihat oleh Anda dan Super Admin.
```

---

# 72. Product Image Upload

Max:

```text
5 images
```

UI:

```text
thumbnail grid
drag/drop optional desktop
add image
remove image
set as cover
```

Mobile harus tetap mudah digunakan tanpa drag-and-drop.

---

# 73. File Upload Feedback

State:

```text
Uploading
Success
Failed
Invalid format
Too large
Limit reached
```

---

# 74. Report Form

Flow:

```text
Reason
Additional Detail
Reporter Name (optional)
Reporter WhatsApp (optional)
Submit
```

Jika `Other`:

```text
detail required
```

Copy privasi sederhana:

```text
Nama dan nomor WhatsApp bersifat opsional.
```

---

# 75. Banner Design

Banner harus mendukung:

```text
Image
Title
Description
CTA
```

Gunakan banner yang cukup compact.

Jangan membuat hero kedua yang terlalu besar.

---

# 76. Featured Merchant Section

Desktop:

```text
4–5 cards
```

Mobile:

```text
horizontal scroll
```

atau:

```text
2-column grid
```

Pilih berdasarkan wireframe final.

---

# 77. Popular Product Section

Menampilkan maksimal:

```text
8 products
```

Gunakan product card yang sama dengan katalog.

Jangan membuat card versi lain tanpa alasan kuat.

---

# 78. Category Component

Kategori dapat menggunakan:

```text
compact icon/image + label
```

atau:

```text
text chip
```

Jika icon tidak tersedia atau tidak konsisten, gunakan card kategori sederhana dengan teks.

Jangan memakai icon generik yang salah makna.

---

# 79. Hero Section

Hero harus sederhana.

Content:

```text
Headline
Short description
Search
Optional CTA
Optional local/product visual
```

Contoh arah copy:

```text
Temukan Produk Lokal Sungairujing

Jelajahi produk UMKM lokal dan hubungi penjual langsung melalui WhatsApp.
```

Hindari copy hiperbolik seperti:

```text
Revolusi Belanja Masa Depan
Marketplace Terbaik No.1
```

---

# 80. About Section

Tujuan:

- menjelaskan marketplace;
- membangun konteks lokal;
- bukan filler.

Gunakan 1–2 paragraf singkat.

---

# 81. Footer

Minimal:

```text
Brand
Short Description
Navigation
Contact / Information
Copyright
```

Jangan terlalu banyak kolom.

---

# 82. QR UI

Merchant QR dapat ditampilkan di merchant dashboard dan public merchant page.

Action:

```text
Lihat QR
Download QR
```

QR harus memiliki sufficient quiet zone.

---

# 83. Accessibility — Contrast

Text harus memiliki contrast yang cukup.

Body text:

```text
neutral-800/900 on white
```

Hindari gray terlalu muda untuk text utama.

---

# 84. Accessibility — Focus

Semua interactive component harus memiliki visible focus state.

Jangan menghapus outline tanpa replacement.

---

# 85. Accessibility — Keyboard

Desktop keyboard user harus dapat menggunakan:

- navigation;
- search;
- form;
- modal;
- dropdown;
- buttons.

---

# 86. Accessibility — Label

Icon-only buttons harus mempunyai accessible name.

Contoh:

```text
aria-label="Hapus produk"
```

---

# 87. Accessibility — Image Alt

Product image:

```text
alt="{nama produk}"
```

Merchant logo:

```text
alt="Logo {nama merchant}"
```

Decorative image dapat menggunakan empty alt.

---

# 88. Touch Target

Minimum target:

```text
44 × 44 px
```

untuk action utama pada mobile.

---

# 89. Responsive Breakpoints

Baseline recommendation:

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Karena technical baseline kemungkinan Tailwind, breakpoint ini kompatibel dengan default Tailwind.

Final technical choice akan dikunci pada `TECHNICAL-SPEC.md`.

---

# 90. Mobile Product Grid

Recommended:

```text
2 columns
gap 12–16px
```

Jika informasi menjadi terlalu sempit pada device tertentu, fallback:

```text
1 column
```

---

# 91. Desktop Product Grid

Recommended:

```text
4 columns
gap 20–24px
```

---

# 92. Responsive Dashboard

Desktop:

```text
persistent sidebar
```

Tablet/mobile:

```text
collapsible drawer
or
compact navigation
```

---

# 93. Sticky Elements

Boleh digunakan untuk:

```text
mobile checkout CTA
product detail primary action
dashboard mobile header
```

Hindari sticky berlebihan yang mengurangi viewport.

---

# 94. Motion

Gunakan motion hanya untuk feedback.

Duration:

```text
150–250ms
```

Contoh:

```text
dropdown
modal
toast
accordion
```

Tidak perlu scroll animation kompleks.

---

# 95. Content Tone

Bahasa:

```text
Santai
Sopan
Jelas
Tidak bertele-tele
```

Contoh baik:

```text
Produk sedang habis.
Hubungi merchant untuk menanyakan ketersediaan.
```

---

# 96. CTA Language

Gunakan verb yang jelas:

```text
Lihat Produk
Tambah ke Keranjang
Lanjut ke WhatsApp
Simpan
Edit
Hapus
Laporkan
Kirim Verifikasi
```

Hindari:

```text
Explore Now
Get Started
Discover More
```

jika tidak perlu.

---

# 97. Price Formatting

Gunakan format Indonesia:

```text
Rp25.000
Rp125.000
```

Tidak perlu:

```text
Rp25.000,00
```

untuk UI marketplace biasa.

---

# 98. Date Formatting

Gunakan format Indonesia.

Contoh:

```text
23 September 2026
```

atau compact:

```text
23 Sep 2026
```

---

# 99. Phone Formatting

Display:

```text
0812-3456-7890
```

atau:

```text
+62 812-3456-7890
```

Database tetap menggunakan normalized format.

---

# 100. Breadcrumb

Gunakan pada desktop untuk detail page jika membantu.

Contoh:

```text
Beranda / Produk / Koncok-Koncok
```

Mobile dapat disederhanakan menjadi back navigation.

---

# 101. Pagination

Untuk katalog dan admin list, recommendation:

```text
pagination
```

lebih baik daripada infinite scroll untuk MVP karena:

- sederhana;
- mudah diuji;
- predictable;
- lebih ringan.

Jumlah item per page akan ditentukan Technical Specification.

---

# 102. Search Result Tabs

Jika diperlukan:

```text
Semua
Produk
Merchant
```

Tidak wajib pada MVP awal jika hasil gabungan sudah mudah dibaca.

---

# 103. Dashboard Data Density

Merchant dashboard:

```text
medium density
```

Super Admin:

```text
medium-high density
```

Tetap prioritaskan readability.

---

# 104. Mobile Forms

Gunakan satu kolom.

Desktop form juga sebaiknya tidak memaksakan terlalu banyak field sejajar.

Maximum form width recommendation:

```text
640–720px
```

---

# 105. Image Placeholder

Jika image tidak tersedia:

```text
neutral placeholder
+
simple image icon
```

Jangan gunakan random stock image.

---

# 106. Avatar / Logo Fallback

Merchant tanpa logo:

```text
initial-based fallback
```

Contoh:

```text
DB
```

untuk Dapur Bawean.

---

# 107. Component Inventory

Baseline reusable components:

```text
AppLogo
Navbar
MobileNavigation
Footer

Button
IconButton
Badge
Alert
Toast

Input
Textarea
Select
Checkbox
RadioGroup
SearchInput

Modal
ConfirmDialog
Drawer
Dropdown
Tabs

ProductCard
MerchantCard
CategoryCard
BannerCard

ProductGallery
QuantityControl
PriceDisplay
AvailabilityBadge
VerificationBadge
OperationalStatus

CartMerchantGroup
CartItem
CheckoutSummary

FileUploader
ImageUploader

EmptyState
ErrorState
Skeleton

MetricCard
SimpleChart
DataTable
Pagination

NotificationItem
ReportForm
QRCard
```

---

# 108. Component Reuse Rule

Jangan membuat komponen baru jika existing component dapat memenuhi kebutuhan dengan variant yang masuk akal.

Tetapi jangan memaksakan satu komponen terlalu generik sehingga sulit dipahami.

---

# 109. Component Naming

Gunakan nama berbasis fungsi, bukan appearance.

Baik:

```text
ProductCard
VerificationBadge
CheckoutSummary
```

Buruk:

```text
GreenBox
FancyCard
BigPanel
```

---

# 110. Public Page Baseline

```text
/
Products
Product Detail
Merchants
Merchant Detail
Cart
Checkout
Login
Register
```

---

# 111. Merchant Dashboard Page Baseline

```text
Overview
Products
Add Product
Edit Product
Profile
Verification
Analytics
Notifications
Account
```

---

# 112. Super Admin Page Baseline

```text
Overview
Merchants
Merchant Detail
Verification
Products
Categories
Reports
Banners
Featured Merchants
Settings
```

---

# 113. State Coverage Matrix

Setiap komponen relevan harus mempertimbangkan state:

```text
Default
Hover
Focus
Active
Loading
Disabled
Empty
Error
Success
```

Business-specific states:

```text
TERSEDIA
HABIS

BUKA
TUTUP
LIBUR_SEMENTARA

BELUM_DIVERIFIKASI
TERVERIFIKASI
DITOLAK

ACTIVE
SUSPENDED
```

---

# 114. Example Product Card Hierarchy

```text
┌────────────────────┐
│                    │
│    PRODUCT IMAGE   │
│                    │
├────────────────────┤
│ Koncok-Koncok      │
│ Rp20.000            │
│ Dapur Bawean       │
│ Tersedia           │
└────────────────────┘
```

Jangan menambahkan terlalu banyak metadata ke card.

---

# 115. Example Merchant Card Hierarchy

```text
┌─────────────────────────┐
│ [Logo] Dapur Bawean     │
│ ✓ Terverifikasi         │
│ Makanan khas Bawean     │
│ ● Buka                  │
└─────────────────────────┘
```

---

# 116. Example Merchant Dashboard Overview

```text
Selamat datang, Dapur Bawean

[Total Produk] [Tersedia]
[Dibekukan]    [Klik WhatsApp]

Aktivitas
[Simple line chart]

Status Merchant
[Terverifikasi]
```

---

# 117. Example Admin Overview

```text
Overview

[Total Merchant]
[Merchant Aktif]
[Merchant Dibekukan]

[Total Produk]
[Produk Dibekukan]
[Total Kategori]

Recent Reports
Pending Verification
```

Tidak perlu membuat banyak grafik yang tidak dibutuhkan.

---

# 118. Design QA Checklist

Sebelum halaman dianggap selesai:

## Hierarchy

- [ ] heading jelas;
- [ ] primary action jelas;
- [ ] price mudah ditemukan;
- [ ] state mudah dibaca.

## Mobile

- [ ] usable pada 360px width;
- [ ] tidak horizontal overflow;
- [ ] touch target memadai;
- [ ] form mudah diisi.

## Visual

- [ ] spacing konsisten;
- [ ] typography konsisten;
- [ ] radius konsisten;
- [ ] icon konsisten;
- [ ] tidak ada excessive decoration.

## State

- [ ] loading;
- [ ] empty;
- [ ] error;
- [ ] success;
- [ ] disabled.

## Accessibility

- [ ] contrast;
- [ ] labels;
- [ ] focus;
- [ ] alt text;
- [ ] keyboard where applicable.

---

# 119. Codex UI Guardrails

Codex tidak boleh secara otomatis:

```text
1. Menambahkan gradient dekoratif pada semua section.
2. Membuat semua container menjadi glass card.
3. Membuat hero sangat tinggi tanpa kebutuhan.
4. Menambahkan fake analytics/statistics.
5. Menggunakan lorem ipsum pada final implementation.
6. Menggunakan random stock photos sebagai product demo production.
7. Membuat CTA dengan wording yang menyiratkan pembayaran internal.
8. Membuat satu halaman penuh dengan cards jika grouping biasa lebih jelas.
9. Mengubah warna brand tanpa design decision.
10. Menambahkan animation library hanya untuk dekorasi.
```

---

# 120. Design Tokens Summary

```text
Brand:
Green

Background:
White / Neutral-50

Text:
Neutral-900

Border:
Neutral-200

Primary Radius:
10–14px

Base Spacing:
4px

Body Font:
Inter

Content Max Width:
1280px

Mobile Horizontal Padding:
16px

Desktop Horizontal Padding:
32px

Primary Button Height:
44–48px
```

---

# 121. Final Design Direction

Visual yang ingin dicapai:

```text
Marketplace lokal yang modern
↓
rapi
↓
ringan
↓
jelas
↓
terpercaya
↓
mudah dipakai dari HP
```

Bukan:

```text
Landing page teknologi generik
Dashboard SaaS kompleks
UI futuristik
Template marketplace penuh dekorasi
```

---

# 122. Technical Handoff

`TECHNICAL-SPEC.md` berikutnya harus menentukan bagaimana design system ini diwujudkan secara teknis, termasuk:

- Tailwind CSS setup;
- font loading;
- component primitives;
- icon library;
- image component;
- responsive implementation;
- form handling;
- toast/modal implementation;
- accessibility patterns;
- chart library;
- PWA UI behavior.

Technical decisions tidak boleh mengubah prinsip visual di dokumen ini tanpa requirement/design update.

---

# 123. Status

**DESIGN-SYSTEM.md v1.0 — APPROVED DESIGN BASELINE**

Tahap berikutnya:

```text
TECHNICAL-SPEC.md
→ IMPLEMENTATION-PLAN.md
→ AGENTS.md
→ Development with Codex
```
