# Product Requirements Document (PRD)
## Sungairujing Marketplace

**Version:** 1.0  
**Status:** Final Requirement Baseline  
**Platform:** Responsive Web / Progressive Web App (PWA)  
**Primary Language:** Bahasa Indonesia  
**Development Approach:** Mobile-first  
**Project:** Sungairujing Marketplace  

---

## 1. Product Overview

Sungairujing Marketplace adalah platform marketplace lokal berbasis web/PWA yang menyediakan etalase digital bersama bagi UMKM Desa Sungairujing.

Platform membantu masyarakat menemukan produk lokal, melihat profil merchant, menyusun keranjang, lalu melanjutkan pemesanan melalui WhatsApp merchant.

Website tidak menangani pembayaran atau penyelesaian transaksi secara internal. Konfirmasi stok aktual, ongkir, pembayaran, dan pengiriman dilakukan langsung antara calon pembeli dan merchant melalui WhatsApp.

Alur utama produk:

```text
Temukan Produk
      ↓
Lihat Detail
      ↓
Tambah ke Keranjang
      ↓
Checkout per Merchant
      ↓
Buka WhatsApp
      ↓
Pembeli ↔ Merchant
```

---

## 2. Problem Statement

UMKM Sungairujing belum memiliki etalase digital bersama yang menyajikan informasi produk secara terstruktur dan mudah ditemukan.

Promosi masih banyak bergantung pada jejaring pribadi dan aplikasi pesan. Akibatnya:

- informasi produk mudah tenggelam;
- calon pembeli harus menanyakan informasi yang sama berulang kali;
- katalog produk tidak terorganisasi;
- masyarakat sulit menemukan UMKM dan produk lokal secara terpusat;
- merchant belum memiliki profil digital yang konsisten.

Sungairujing Marketplace berfokus memperbaiki proses discovery, katalog, dan komunikasi awal transaksi tanpa memaksakan sistem transaksi digital penuh.

---

## 3. Product Goals

Sungairujing Marketplace harus memungkinkan:

1. Masyarakat menemukan produk UMKM Sungairujing dengan mudah.
2. UMKM memiliki halaman merchant dan katalog digital sendiri.
3. Pengunjung dapat mencari dan memfilter produk tanpa akun.
4. Pengunjung dapat memasukkan produk dari beberapa merchant ke keranjang.
5. Checkout dilakukan secara terpisah untuk setiap merchant.
6. Pemesanan dilanjutkan melalui WhatsApp.
7. Merchant dapat mengelola profil dan produknya secara mandiri.
8. Super Admin dapat menjaga kualitas marketplace melalui verifikasi dan moderasi.
9. Sistem dapat mengukur minat pengguna melalui product views dan WhatsApp clicks.
10. Website nyaman digunakan terutama melalui smartphone.
11. Website dapat dipasang sebagai PWA pada perangkat yang mendukung.

---

## 4. Product Principles

### 4.1 Simple
Pengguna tidak perlu memahami alur marketplace yang kompleks.

### 4.2 No Forced Buyer Account
Pembeli tidak wajib membuat akun.

### 4.3 WhatsApp-first Transaction
Website menangani discovery, katalog, keranjang, dan persiapan pesanan. Penyelesaian transaksi dilakukan melalui komunikasi langsung dengan merchant.

### 4.4 Merchant Autonomy
Merchant dapat mendaftar, membuat produk, dan memperbarui katalog tanpa menunggu approval produk.

### 4.5 Moderated Marketplace
Kebebasan publikasi diimbangi sistem report, verifikasi merchant, suspension, dan moderasi Super Admin.

### 4.6 Mobile First
Pengalaman smartphone menjadi prioritas utama.

### 4.7 Truthful Metrics
Klik WhatsApp tidak boleh dipresentasikan sebagai penjualan atau pesanan berhasil.

---

## 5. User Roles

### 5.1 Pengunjung / Calon Pembeli

Tidak membutuhkan login.

Kemampuan utama:

- melihat homepage;
- melihat katalog produk;
- melihat daftar merchant;
- search produk dan merchant;
- filter produk;
- melihat detail produk;
- melihat detail merchant;
- menambahkan produk ke keranjang;
- checkout per merchant;
- membuka WhatsApp merchant;
- share produk;
- melaporkan produk;
- melaporkan merchant.

### 5.2 Admin Merchant

Memerlukan login.

Kemampuan utama:

- mengelola profil merchant;
- mengelola produk milik sendiri;
- mengatur status operasional;
- mengunggah bukti usaha;
- melihat status verifikasi;
- melihat analytics;
- melihat notifikasi internal;
- mengelola password akun.

### 5.3 Super Admin

Memerlukan login.

Kemampuan utama:

- mengelola merchant;
- melakukan verifikasi merchant;
- mengelola produk secara administratif;
- membekukan produk;
- membekukan merchant;
- mengelola kategori;
- menangani laporan;
- mengelola banner;
- memilih merchant unggulan;
- melihat statistik marketplace.

---

## 6. Primary User Journey

```text
Homepage
   ↓
Search / Category / Produk Populer
   ↓
Product Listing
   ↓
Product Detail
   ↓
Add to Cart
   ↓
Cart grouped by Merchant
   ↓
Checkout Merchant
   ↓
Buyer Information
   ↓
Generate Order Summary
   ↓
Open WhatsApp
   ↓
Buyer ↔ Merchant
```

Website berhenti pada tahap **Open WhatsApp**.

Setelah itu, sistem tidak mengetahui apakah transaksi benar-benar terjadi.

---

## 7. Merchant Journey

```text
Register
   ↓
Merchant Account Created
   ↓
Login
   ↓
Dashboard
   ↓
Complete Merchant Profile
   ↓
Upload Business Evidence
   ↓
Create Products
   ↓
Products Published
```

Verifikasi berjalan terpisah:

```text
Business Evidence
      ↓
Super Admin Review
      ↓
Verified / Rejected
```

Merchant tetap boleh berjualan meskipun belum terverifikasi.

---

## 8. Authentication Requirements

### FR-AUTH-01
Merchant dapat melakukan registrasi menggunakan nomor WhatsApp.

### FR-AUTH-02
Nomor WhatsApp harus unik.

### FR-AUTH-03
Password minimal 8 karakter.

### FR-AUTH-04
Merchant dapat login menggunakan nomor WhatsApp dan password.

### FR-AUTH-05
Merchant dapat logout.

### FR-AUTH-06
Merchant dapat mengganti password dengan memasukkan password lama.

### FR-AUTH-07
Nomor WhatsApp akun hanya dapat diubah melalui Super Admin.

### FR-AUTH-08
Registrasi Super Admin tidak tersedia secara publik.

### FR-AUTH-09
Registrasi merchant tidak menggunakan OTP pada MVP awal.

### FR-AUTH-10
Sistem dirancang untuk mendukung pemulihan password otomatis melalui WhatsApp.

**Catatan:** implementasi pemulihan password melalui WhatsApp bergantung pada provider/API yang dipilih pada Technical Specification.

---

## 9. Merchant Registration

Data registrasi merchant:

- nama pemilik;
- nama merchant;
- nomor WhatsApp;
- password;
- alamat merchant;
- checkbox persetujuan syarat dan ketentuan.

Bukti usaha dikumpulkan setelah akun dibuat melalui alur verifikasi merchant,
bukan sebagai syarat registrasi awal.

Email tidak diwajibkan.

Aturan utama:

```text
1 nomor WhatsApp = 1 akun
```

Untuk MVP:

```text
1 merchant = 1 Admin Merchant
```

Namun desain database harus memungkinkan dukungan multi-admin merchant di masa depan tanpa redesign besar.

---

## 10. Merchant Profile Requirements

Data profil merchant:

- nama merchant;
- slug unik;
- logo/foto;
- deskripsi;
- alamat/lokasi;
- nomor WhatsApp;
- jam operasional;
- status operasional;
- status verifikasi.

Status operasional:

```text
BUKA
TUTUP
LIBUR_SEMENTARA
```

### FR-MER-01
Merchant dapat mengedit profilnya sendiri.

### FR-MER-02
Setiap merchant mempunyai slug unik.

### FR-MER-03
Merchant dapat mengunggah logo/foto.

### FR-MER-04
Merchant dapat mengatur jam operasional.

### FR-MER-05
Merchant dapat mengubah status operasional.

### FR-MER-06
Halaman publik merchant tersedia pada pola URL:

```text
/merchant/{slug}
```

---

## 11. Merchant Verification

Status verifikasi:

```text
BELUM_DIVERIFIKASI
TERVERIFIKASI
DITOLAK
```

Merchant tetap boleh berjualan ketika belum diverifikasi.

Bukti usaha:

- maksimal 3 file;
- bersifat privat;
- hanya merchant pemilik dan Super Admin yang dapat mengakses.

Contoh bukti usaha dapat berupa:

- foto banner usaha;
- foto tempat usaha;
- foto produk/jualan;
- nomor atau dokumen legalitas usaha;
- bukti lain yang relevan.

### FR-VER-01
Super Admin dapat melihat bukti usaha merchant.

### FR-VER-02
Super Admin dapat menerima verifikasi.

### FR-VER-03
Super Admin dapat menolak verifikasi.

### FR-VER-04
Penolakan dapat disertai alasan.

### FR-VER-05
Merchant terverifikasi memperoleh badge publik.

### FR-VER-06
Merchant yang ditolak dapat memperbarui bukti dan mengajukan verifikasi ulang.

---

## 12. Product Requirements

Data produk:

- nama;
- slug;
- maksimal 5 foto;
- foto cover;
- deskripsi;
- harga;
- kategori;
- satuan;
- status ketersediaan;
- merchant;
- status moderasi.

Status ketersediaan:

```text
TERSEDIA
HABIS
```

Tidak ada numeric inventory.

Tidak ada sistem variant khusus. Informasi seperti ukuran, rasa, atau berat tambahan ditulis pada deskripsi produk.

### FR-PRO-01
Merchant dapat membuat produk.

### FR-PRO-02
Merchant hanya dapat mengelola produk miliknya sendiri.

### FR-PRO-03
Produk langsung tampil setelah dibuat apabila merchant tidak sedang dibekukan.

### FR-PRO-04
Merchant dapat mengedit produk miliknya.

### FR-PRO-05
Merchant dapat menghapus produk permanen setelah confirmation dialog.

### FR-PRO-06
Super Admin dapat membekukan produk.

### FR-PRO-07
Produk yang dibekukan tidak tampil kepada publik.

### FR-PRO-08
Super Admin dapat menghapus produk bermasalah.

### FR-PRO-09
Alasan moderasi harus dapat disimpan.

---

## 13. Product Images

Ketentuan:

- maksimal 5 gambar per produk;
- format JPG/JPEG, PNG, dan WebP;
- merchant dapat memilih satu gambar sebagai cover;
- gambar harus dioptimasi atau dikompresi;
- upload harus divalidasi di server.

Validasi minimal:

- file type;
- file size;
- file count;
- ownership.

---

## 14. Product Categories

Kategori bersifat global.

### FR-CAT-01
Super Admin dapat membuat kategori.

### FR-CAT-02
Super Admin dapat mengedit kategori.

### FR-CAT-03
Super Admin dapat menghapus kategori sesuai aturan integritas data.

### FR-CAT-04
Merchant hanya dapat memilih kategori yang tersedia.

Merchant tidak dapat membuat kategori sendiri.

---

## 15. Homepage Requirements

Struktur homepage:

```text
Navbar
Hero + Search
Kategori
Produk Populer
Merchant Pilihan
Banner / Promo
Tentang Sungairujing Marketplace
Footer
```

Hero harus mengomunikasikan dua pesan utama:

1. temukan dan beli produk UMKM Sungairujing;
2. dukung pertumbuhan UMKM lokal.

---

## 16. Search, Filter, and Sorting

### Global Search

Search mencari:

- produk;
- merchant.

### Filter Produk

- kategori;
- merchant;
- status ketersediaan;
- rentang harga.

### Sorting

- terbaru;
- harga terendah;
- harga tertinggi.

---

## 17. Product Card

Card produk minimal menampilkan:

- foto cover;
- nama produk;
- harga;
- nama merchant;
- status tersedia/habis.

Lokasi merchant tidak ditampilkan pada product card.

---

## 18. Product Detail

Product Detail menampilkan:

- galeri foto;
- nama produk;
- harga;
- deskripsi;
- kategori;
- status ketersediaan;
- merchant;
- lokasi merchant;
- quantity;
- tombol tambah ke keranjang;
- tombol hubungi/pesan via WhatsApp;
- tombol share;
- tombol laporkan produk.

---

## 19. Public Merchant Page

Halaman publik merchant menampilkan:

- logo/foto;
- nama merchant;
- badge verifikasi jika terverifikasi;
- deskripsi;
- alamat;
- jam operasional;
- status operasional;
- nomor/tombol WhatsApp;
- daftar produk;
- QR merchant.

Tersedia juga halaman **Semua Merchant**.

---

## 20. Cart Requirements

Cart tidak memerlukan akun.

Cart dapat menyimpan produk dari beberapa merchant sekaligus, tetapi dikelompokkan berdasarkan merchant.

Contoh:

```text
Keranjang

Dapur Bawean
├── Koncok-Koncok ×2
└── Ghule Merah ×1
[Checkout Dapur Bawean]

Toko Oleh-Oleh
├── Kerupuk Sangar ×3
└── Kerupuk Leko ×2
[Checkout Toko Oleh-Oleh]
```

### FR-CART-01
Produk dikelompokkan berdasarkan merchant.

### FR-CART-02
Pembeli dapat menyimpan produk dari beberapa merchant.

### FR-CART-03
Checkout dilakukan per merchant.

### FR-CART-04
Pembeli dapat mengubah quantity.

### FR-CART-05
Pembeli dapat menghapus item.

### FR-CART-06
Cart harus tetap tersedia setelah refresh selama local storage/browser storage masih tersedia.

---

## 21. Checkout Requirements

Data checkout:

- nama;
- nomor WhatsApp;
- alamat/lokasi;
- metode pemenuhan;
- catatan.

Metode pemenuhan:

```text
AMBIL_SENDIRI
DIANTAR
```

### FR-CHK-01
Sistem menghitung subtotal produk.

### FR-CHK-02
Sistem menghitung total estimasi harga produk.

### FR-CHK-03
Sistem tidak menghitung ongkir.

### FR-CHK-04
Sistem membuat kode referensi checkout.

Contoh:

```text
SRM-260923-A7K2
```

### FR-CHK-05
Sistem membuat pesan WhatsApp terstruktur.

### FR-CHK-06
Sistem membuka WhatsApp merchant.

### FR-CHK-07
Checkout tidak membuat order record di database.

---

## 22. WhatsApp Checkout Message

Format dasar:

```text
Halo {Nama Merchant}, saya ingin menanyakan pesanan
dari Sungairujing Marketplace.

2x Koncok-Koncok — Rp40.000
1x Kerupuk Sangar — Rp15.000

Total estimasi: Rp55.000

Nama: Dimas
No. WhatsApp: 08xxxxxxxx
Metode: Diantar
Alamat: ...
Catatan: ...
Kode: SRM-XXXX

Mohon konfirmasi ketersediaan dan total pembayarannya.
```

Harga yang ditampilkan merupakan estimasi berdasarkan data website.

Merchant tetap melakukan konfirmasi final melalui WhatsApp.

---

## 23. No Internal Order System

MVP tidak menyimpan order di database.

Karena:

```text
Klik WhatsApp
≠
Pesanan dikonfirmasi
≠
Transaksi terjadi
≠
Pembayaran berhasil
```

MVP tidak memiliki:

- order management;
- order status;
- payment status;
- transaction history;
- sales report.

---

## 24. Analytics Requirements

### Product Views

Popularitas produk dihitung dari kunjungan halaman detail produk.

Untuk mengurangi refresh spam:

```text
1 browser
+ 1 produk
+ 24 jam
= maksimal 1 counted view
```

### WhatsApp Clicks

Sumber klik yang dilacak:

```text
PRODUCT_DETAIL
MERCHANT_PROFILE
CHECKOUT
```

### FR-ANA-01
Merchant dapat melihat jumlah product views.

### FR-ANA-02
Merchant dapat melihat WhatsApp clicks.

### FR-ANA-03
Filter waktu:

```text
Hari ini
7 hari
30 hari
Semua waktu
```

### FR-ANA-04
Dashboard menyediakan grafik sederhana.

### FR-ANA-05
WhatsApp clicks tidak boleh disebut penjualan atau pesanan.

---

## 25. Popular Products

Homepage menampilkan maksimal **8 Produk Populer**.

Popularitas ditentukan dari jumlah valid product detail views.

Istilah yang digunakan adalah:

**Produk Populer**

bukan:

**Produk Terlaris**

karena sistem tidak memiliki data transaksi aktual.

---

## 26. Featured Merchants

Super Admin dapat memilih maksimal **5 merchant** sebagai Merchant Pilihan.

Merchant tersebut ditampilkan di homepage.

---

## 27. Banner / Promo Management

Super Admin dapat mengelola banner dengan data:

- judul;
- deskripsi singkat;
- gambar;
- teks CTA;
- target link;
- tanggal mulai;
- tanggal selesai;
- status aktif/nonaktif.

Banner hanya tampil apabila aktif dan berada pada periode tayang yang sesuai.

---

## 28. Reporting System

Pengunjung dapat melaporkan:

```text
Produk
Merchant
```

Data pelapor:

- nama — opsional;
- nomor WhatsApp — opsional.

Kategori laporan:

- barang ilegal/terlarang;
- produk berbahaya;
- penipuan/informasi menyesatkan;
- foto/deskripsi tidak sesuai;
- spam;
- lainnya.

Kategori **Lainnya** memungkinkan pengguna mengisi alasan sendiri.

Status laporan:

```text
BARU
DITINJAU
SELESAI
DITOLAK
```

### FR-REP-01
Laporan tidak menyebabkan auto-suspension.

### FR-REP-02
Super Admin melakukan review manual.

### FR-REP-03
Super Admin dapat membekukan produk atau merchant setelah review.

### FR-REP-04
Alasan moderasi harus dapat disimpan.

---

## 29. Merchant Suspension

Super Admin dapat:

- melihat merchant;
- mengedit merchant;
- membekukan merchant;
- mengaktifkan kembali merchant;
- menghapus merchant permanen.

Ketika merchant dibekukan:

- merchant tetap dapat login;
- alasan pembekuan dapat dilihat;
- merchant tidak dapat melakukan perubahan yang memengaruhi konten publik;
- seluruh produk merchant disembunyikan dari marketplace publik.

---

## 30. Deletion Rules

### Product

Merchant dapat menghapus produk secara permanen setelah confirmation dialog.

Contoh:

```text
Hapus "Koncok-Koncok"?
Tindakan ini tidak dapat dibatalkan.
```

### Merchant

Tersedia dua tindakan administratif:

```text
Bekukan Merchant
→ reversible

Hapus Permanen
→ irreversible
```

Penghapusan permanen merchant membutuhkan konfirmasi kuat.

Relasi analytics, report, file, dan resource lain harus ditangani secara eksplisit pada Database Design.

---

## 31. Product Sharing

Product Detail menyediakan fitur Share.

Prioritas implementasi:

```text
Web Share API
      ↓
Copy Link fallback
```

---

## 32. Merchant QR Code

Setiap merchant memiliki QR yang mengarah ke:

```text
/merchant/{slug}
```

QR dapat digunakan pada:

- toko;
- banner;
- poster;
- kemasan;
- media promosi.

Tidak ada QR individual untuk produk pada MVP.

---

## 33. Internal Notifications

Merchant dapat menerima notifikasi internal dashboard untuk kejadian administratif.

Contoh:

- verifikasi disetujui;
- verifikasi ditolak;
- produk dibekukan;
- merchant dibekukan.

MVP tidak membutuhkan:

- push notification;
- email notification;
- WhatsApp notification otomatis untuk notifikasi dashboard.

---

## 34. Merchant Dashboard

Information Architecture:

```text
Dashboard
├── Overview
├── Produk
│   ├── Semua Produk
│   └── Tambah Produk
├── Profil Merchant
├── Verifikasi
├── Analytics
├── Notifikasi
└── Pengaturan Akun
```

Overview minimal menampilkan:

- total produk;
- produk tersedia;
- produk dibekukan;
- klik WhatsApp.

Analytics:

- product views;
- WhatsApp clicks;
- filter waktu;
- grafik sederhana.

---

## 35. Super Admin Dashboard

Information Architecture:

```text
Dashboard
├── Overview
├── Merchant
├── Verifikasi Merchant
├── Produk
├── Kategori
├── Laporan
├── Banner / Promo
├── Merchant Pilihan
└── Pengaturan
```

Overview minimal menampilkan:

- total merchant;
- merchant aktif;
- merchant dibekukan;
- total produk;
- produk dibekukan;
- total kategori.

---

## 36. PWA Requirements

Website harus:

- responsive;
- mobile-first;
- memiliki web app manifest;
- memiliki icon aplikasi;
- mendukung Add to Home Screen pada browser yang kompatibel;
- tetap berfungsi normal sebagai website jika instalasi PWA tidak tersedia.

---

## 37. UI/UX Direction

Arah visual:

**Modern Marketplace × Identitas Lokal Sungairujing/Bawean**

Prioritas:

```text
User Friendly
>
Dekorasi
```

Hindari:

- gradient berlebihan;
- glassmorphism berlebihan;
- card untuk setiap elemen;
- dekorasi tanpa fungsi;
- animasi berlebihan;
- marketing copy generik;
- statistik palsu;
- filler section;
- tampilan yang terasa seperti template AI.

Utamakan:

- hierarchy yang jelas;
- typography konsisten;
- whitespace;
- kualitas foto produk;
- navigation clarity;
- CTA clarity;
- mobile usability;
- consistency;
- accessibility.

Identitas lokal harus hadir melalui brand, copy, fotografi, dan konten, bukan ornamen yang dipaksakan.

---

## 38. Non-Functional Requirements

### NFR-01 — Responsive
Target perangkat:

```text
Smartphone
↓
Tablet
↓
Desktop
```

### NFR-02 — Performance
Gambar harus dioptimasi.

Halaman publik harus cukup ringan untuk jaringan seluler.

### NFR-03 — Server-side Authorization
Authorization tidak boleh hanya bergantung pada UI.

### NFR-04 — Tenant Isolation
Admin Merchant tidak boleh membaca atau memodifikasi resource merchant lain.

Contoh aturan:

```text
IF authenticated_user.merchant_id != resource.merchant_id
THEN reject request
```

### NFR-05 — Password Security
Password tidak boleh disimpan dalam bentuk plaintext.

### NFR-06 — Private Business Evidence
Bukti usaha tidak boleh tersedia sebagai public file tanpa authorization.

### NFR-07 — Upload Validation
Server harus memvalidasi file type, file size, file count, dan ownership.

### NFR-08 — Browser Support
Target browser modern:

- Chrome;
- Edge;
- Safari;
- Firefox.

### NFR-09 — Accessibility
Komponen interaktif harus memiliki label yang sesuai dan dapat digunakan dengan keyboard jika relevan.

### NFR-10 — Data Integrity
Relasi delete/cascade/restrict/set-null harus didefinisikan secara eksplisit pada Database Design.

### NFR-11 — Build Quality
Production build tidak boleh diteruskan jika terdapat critical build/test failure.

---

## 39. MVP Acceptance Criteria

### Pengunjung

MVP dianggap memenuhi kebutuhan pengunjung apabila:

- homepage dapat dibuka dengan baik;
- katalog dapat dijelajahi;
- search bekerja;
- filter bekerja;
- detail produk dapat dibuka;
- detail merchant dapat dibuka;
- multi-merchant cart bekerja;
- checkout per merchant bekerja;
- pesan WhatsApp terbentuk dengan benar;
- report produk/merchant dapat dikirim.

### Merchant

MVP dianggap memenuhi kebutuhan merchant apabila:

- registrasi bekerja;
- login/logout bekerja;
- profil dapat dikelola;
- produk dapat dibuat;
- produk dapat diedit;
- produk dapat dihapus;
- upload gambar bekerja;
- bukti usaha dapat dikirim;
- status verifikasi dapat dilihat;
- analytics dapat dilihat;
- merchant tidak dapat mengakses data merchant lain.

### Super Admin

MVP dianggap memenuhi kebutuhan Super Admin apabila:

- merchant dapat dikelola;
- verifikasi dapat dilakukan;
- kategori dapat dikelola;
- produk dapat dimoderasi;
- laporan dapat ditangani;
- merchant dapat dibekukan/diaktifkan;
- banner dapat dikelola;
- merchant pilihan dapat dikelola.

### System

MVP dianggap layak apabila:

- mobile responsive;
- production build berhasil;
- tidak ada critical defect;
- authorization diuji;
- file privat terlindungi;
- PWA dapat dipasang pada environment yang mendukung.

---

## 40. Out of Scope

Fitur berikut sengaja tidak dibangun pada MVP:

```text
❌ Akun pembeli
❌ Wishlist
❌ Rating
❌ Review
❌ Payment gateway
❌ Pembayaran internal
❌ Shipping API
❌ Ongkir otomatis
❌ Numeric inventory
❌ Product variants system
❌ Order database
❌ Order management
❌ Transaction history
❌ Sales analytics
❌ Product approval sebelum publish
❌ Product QR
❌ Multi-language
❌ Native mobile app
```

Fitur-fitur tersebut tidak boleh ditambahkan otomatis hanya karena umum ditemukan pada marketplace lain.

---

## 41. Technical Baseline

Baseline yang sudah disepakati:

```text
Frontend / Full-stack
Next.js + React + TypeScript

Database
PostgreSQL

Architecture
Mobile-first
Server-side authorization

Version Control
Git + GitHub
```

Keputusan berikut belum dikunci di PRD:

- ORM;
- authentication library;
- object storage;
- hosting;
- image processing;
- WhatsApp API/provider;
- analytics implementation.

Keputusan tersebut akan dibuat pada **Technical Specification**.

---

## 42. Deployment Strategy

Selama development:

- aplikasi di-deploy online menggunakan domain/subdomain platform;
- custom domain dipasang setelah aplikasi stabil;
- database memiliki seed/demo data;
- demo data harus memungkinkan pengujian marketplace tanpa input ulang manual.

---

## 43. Development Discipline

Alur kerja:

```text
Implement
↓
Lint
↓
Test
↓
Build
↓
Audit
↓
Commit
↓
Next Phase
```

Tidak melanjutkan fase jika perubahan sebelumnya menyebabkan build/test utama gagal.

Contoh commit:

```text
feat: implement merchant registration
feat: implement public product catalog
feat: implement multi-merchant cart
feat: implement whatsapp checkout
fix: enforce merchant product ownership
```

---

## 44. Project Priority

Jika waktu pengembangan terbatas, prioritas:

```text
1. Fungsi benar
2. UI/UX bagus
3. Keamanan
4. Performa
5. PWA
6. Fitur tambahan
```

Keamanan dasar tetap bersifat wajib walaupun berada pada urutan ketiga.

Authentication, authorization, merchant ownership, password handling, upload validation, dan perlindungan data privat tidak boleh dikorbankan.

---

## 45. Important Product Constraints

1. Website bukan payment marketplace.
2. Website tidak mengetahui transaksi final.
3. Klik WhatsApp bukan order atau sale.
4. Checkout hanya dapat dilakukan per merchant.
5. Merchant tidak membutuhkan approval untuk mulai mempublikasikan produk.
6. Verifikasi merchant tidak memblokir penjualan.
7. Produk atau merchant bermasalah ditangani melalui moderasi.
8. Buyer account tidak tersedia pada MVP.
9. Super Admin tidak memiliki public registration.
10. Semua resource merchant wajib dilindungi server-side berdasarkan ownership.

---

## 46. Technical Decisions Pending

Dokumen berikutnya harus menetapkan:

- Business Rules;
- User Flow;
- Database Design;
- Design System;
- Technical Specification;
- Implementation Plan;
- AGENTS.md;
- Testing Strategy.

PRD tidak boleh digunakan untuk memilih teknologi detail sebelum Technical Specification selesai.

---

## 47. Source of Truth

Urutan prioritas keputusan proyek:

```text
Requirement Interview Final
        ↓
PRD.md
        ↓
Business Rules
        ↓
Technical Specification
        ↓
Implementation Plan
        ↓
Source Code
```

Apabila terdapat perbedaan dengan proposal awal, keputusan requirement terbaru yang sudah disepakati menjadi acuan implementasi MVP.

---

## 48. PRD Status

**PRD Sungairujing Marketplace v1.0: APPROVED BASELINE FOR NEXT DESIGN PHASE**

Tahap berikutnya:

```text
Business Rules
→ User Flow
→ Database Design
→ Design System
→ Technical Specification
→ Implementation Plan
→ AGENTS.md
→ Development with Codex
```
