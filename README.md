# Sungairujing Marketplace

Sungairujing Marketplace adalah aplikasi marketplace lokal berbasis web untuk membantu masyarakat menemukan produk UMKM Desa Sungairujing dan menghubungi merchant melalui WhatsApp.

## Status pengembangan

**Phase 0 — Repository & Application Foundation** telah selesai. Foundation aplikasi dan struktur repository sudah siap; fitur marketplace belum diimplementasikan dan Phase 1 belum dimulai.

## Stack foundation

- Next.js dengan App Router
- React
- TypeScript strict mode
- Tailwind CSS
- ESLint
- npm

## Prasyarat

- Node.js 20.9 atau lebih baru
- npm

## Instalasi

```bash
npm install
```

Salin `.env.example` menjadi file environment lokal hanya ketika konfigurasi suatu fase membutuhkannya. Jangan commit credential atau secret.

## Development

```bash
npm run dev
```

Aplikasi tersedia secara default di `http://localhost:3000`.

## Validasi yang tersedia

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test
npm run build
npm run test:e2e
```

## Dokumentasi

Requirement, business rules, user flow, database design, design system, technical specification, dan implementation plan tersedia dalam direktori [`docs`](docs/).

Sebelum melakukan development, baca [`AGENTS.md`](AGENTS.md) dan dokumentasi yang relevan. Implementasi harus mengikuti batas scope serta urutan prioritas dokumentasi yang ditetapkan di sana.
