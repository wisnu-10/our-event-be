# Our Event — Backend API

API untuk platform tiket event **Our Event**: admin membuat dan menjual tiket event,
customer membeli tiket dengan bukti transfer yang diverifikasi manual, superadmin mengelola akun admin.

> Dokumen perencanaan: [`PRD.md`](../PRD.md) dan [`plan/`](../plan/README.md).

## Fitur Utama

- **Autentikasi cookie** — JWT access + refresh token via cookie httpOnly, login/register/logout/session.
- **Tiga role** — `SUPERADMIN` (kelola admin), `ADMIN` (CRUD event, verifikasi pembayaran, dashboard),
  `CUSTOMER` (buat order, upload bukti, lihat tiket).
- **Event** — CRUD, publish/unpublish (DRAFT/PUBLISHED/CLOSED), kuota, banner, kategori, filter wilayah.
- **Order & ticketing** — kode order unik, expired otomatis (job 10 menit), upload bukti bayar (maks 5MB),
  approve/reject + generate tiket QR (Cloudinary, fallback data-URL).
- **Wilayah** — proxy API provinsi/kota dengan cache.
- **Dashboard** — statistik event, order per status, pendapatan.
- **Soft delete** — semua tabel memakai `deletedAt`; data terhapus disembunyikan, bukan dihapus fisik.

## Tech Stack

| Lapisan   | Teknologi                              |
| --------- | -------------------------------------- |
| Runtime   | Node.js 20+                            |
| Framework | Express 5 + TypeScript                 |
| Database  | PostgreSQL                             |
| ORM       | Prisma 6                               |
| Auth      | JWT (access + refresh, cookie httpOnly)|
| Upload    | Multer + Cloudinary                    |
| Validasi  | Zod                                    |
| QR        | qrcode                                 |
| Keamanan  | Helmet, CORS whitelist, rate limiting  |

## Prasyarat

- Node.js 20+ dan npm.
- PostgreSQL berjalan dan database sudah dibuat.
- Akun Cloudinary (opsional — tanpa ini upload bukti/QR memakai fallback, dan upload bukti akan 503).

## Quick Start

```bash
cd backend
npm install

# 1. Salin contoh env lalu isi nilainya
cp .env.example .env

# 2. Migrasi database + generate client
npm run prisma:migrate

# 3. Isi data awal (superadmin, admin, customer, 3 event contoh)
npm run prisma:seed

# 4. Jalankan server
npm run dev
```

Server jalan di `http://localhost:5000`, cek `GET /api/health`.

## Environment Variables

Salin dari `.env.example`:

| Variabel              | Wajib | Default                         | Guna                              |
| --------------------- | ----- | ------------------------------- | --------------------------------- |
| `DATABASE_URL`        | Ya    | –                               | Koneksi PostgreSQL                |
| `PORT`                | Tidak | `5000`                          | Port server                       |
| `FRONTEND_URL`        | Tidak | `http://localhost:3000`         | Origin frontend (CORS + cookie)   |
| `JWT_ACCESS_SECRET`   | Ya    | –                               | Secret access token (15 mnt)      |
| `JWT_REFRESH_SECRET`  | Ya    | –                               | Secret refresh token (7 hari)     |
| `JWT_ACCESS_EXPIRES`  | Tidak | `15m`                           | Umur access token                 |
| `JWT_REFRESH_EXPIRES` | Tidak | `7d`                            | Umur refresh token                |
| `CLOUDINARY_CLOUD_NAME` | Tidak | –                             | Upload bukti bayar & QR           |
| `CLOUDINARY_API_KEY`  | Tidak | –                               | Upload bukti bayar & QR           |
| `CLOUDINARY_API_SECRET` | Tidak | –                             | Upload bukti bayar & QR           |
| `REGION_API_URL`      | Tidak | konoland API                    | Sumber data provinsi/kota         |
| `REGION_TIMEOUT_MS`   | Tidak | `8000`                          | Timeout upstream wilayah (ms)     |
| `MAX_UPLOAD_MB`       | Tidak | `5`                             | Batas ukuran file upload (MB)     |
| `ORDER_EXPIRY_HOURS`  | Tidak | `24`                            | Umur order sebelum kedaluwarsa    |
| `MAX_QTY_PER_ORDER`   | Tidak | `5`                             | Maks tiket per order              |

## Script NPM

| Script            | Guna                                              |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Dev server dengan hot-reload (`tsx watch`)        |
| `npm run build`   | Kompilasi TypeScript ke `dist/`                   |
| `npm start`       | Jalankan hasil build                              |
| `npm run typecheck` | Cek tipe tanpa emit (`tsc --noEmit`)            |
| `npm run prisma:generate` | Generate Prisma Client                  |
| `npm run prisma:migrate`  | Buat + terapkan migrasi (development)     |
| `npm run prisma:deploy`   | Terapkan migrasi (production)             |
| `npm run prisma:seed`     | Isi data awal                         |
| `npm run prisma:studio`   | GUI database Prisma Studio            |

## Struktur Folder

```
src/
├── app.ts                  # Entry point: middleware global + mount router
├── prisma.ts               # Instance PrismaClient (tunggal)
├── config/                 # *.config.ts — env, CORS, Prisma, Cloudinary
├── helpers/                # *.helper.ts — jwt, bcrypt, cookie, AppError, upload, dsb.
├── middlewares/            # *.middleware.ts — auth, validasi, error, upload
├── types/                  # DTO + augmentasi Express
└── modules/
    └── <nama-modul>/
        ├── <nama>.controller.ts   # Object controller (set cookie, kirim respons)
        ├── <nama>.router.ts       # Definisi route + middleware
        ├── <nama>.service.ts      # Object service (logika bisnis + Prisma)
        └── validators/            # Skema Zod per modul

prisma/
├── schema.prisma           # Model User, Event, Order, Ticket
├── migrations/             # Riwayat migrasi SQL
├── seed.ts                 # Orkestrator seed
└── seeds/                  # Seed per domain (superadmin, demo-users, events)
```

## Konvensi

- **Respons sukses**: `{ "success": true, "message": "...", "data": {...} }`.
- **Respons gagal**: `{ "success": false, "message": "...", "data": null }` (via `AppError` + flag `expose`).
- **Auth**: token di cookie httpOnly (`accessToken`, `refreshToken`); guard `jwtVerify()` membaca cookie,
  `roleverify([...])` membatasi role. Register publik selalu `CUSTOMER`.
- **Validasi**: semua input body/query/params divalidasi Zod di level router.
- **Soft delete**: hapus = isi `deletedAt`; semua query memfilter `deletedAt: null`; akun terhapus tidak bisa login;
  user yang punya event/order aktif ditolak hapus (409).

## Alur Kerja Database

- Development: `npm run prisma:migrate` (buat migrasi baru bila schema berubah).
- Production: `npm run prisma:deploy` (hanya terapkan).
- Setelah pull perubahan schema: `npm run prisma:generate`.
- Catatan Windows: bila `prisma generate` gagal dengan error `EPERM` (file client dikunci dev-server),
  hentikan dulu dev-server, generate, lalu jalankan lagi.
