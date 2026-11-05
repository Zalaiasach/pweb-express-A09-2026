# Backend Express MLBB Shop
| Nama | NRP |
| --- | --- |
| Afriezal Suryapraba Laiasach | 5027251096 | 
| Muhammad Yusuf | 5027251067 | 
| Sebastian Panjaitan | 5027251040 |

Panduan ini ditujukan untuk anggota kelompok agar dapat meng-clone repositori dan menjalankan proyek di komputer lokal masing-masing tanpa kendala koneksi atau konfigurasi modul.

---

## Prasyarat Sistem
Pastikan di komputer Anda sudah terpasang:
1. **Node.js** (versi 20 atau 22/24 LTS)
2. **Git**
3. **VS Code** (atau text editor pilihan)
4. **Postman** (untuk pengujian endpoint)

---

##  Langkah-Langkah Menjalankan Proyek

### 1. Clone Repositori
Buka terminal (Git Bash, Command Prompt, atau PowerShell), lalu jalankan perintah berikut:

```bash
git clone https://github.com/Zalaiasach/pweb-express-A09-2026.git
cd pweb-express-A09-2026
```

---

### 2. Install Dependensi
Unduh semua library yang diperlukan oleh proyek:

```bash
npm install
```

---

### 3. Buat File Konfigurasi `.env`
File `.env` tidak ada di GitHub karena alasan keamanan kredensial. Buat file baru bernama `.env` tepat di root project (sejajar dengan `package.json`), lalu isi dengan string koneksi database Neon kelompok kita:

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]-pooler.[REGION].aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST].[REGION].aws.neon.tech/neondb?sslmode=require"
PORT=3000
```
*(Mintalah nilai connection string lengkap di atas kepada rekan kelompok Anda).*

---

### 4. Sinkronisasi Prisma Client
Jalankan perintah ini untuk membuat Prisma Client yang sesuai dengan skema database terbaru:

```bash
npx prisma generate
```

> **Catatan Seeding:** 
> Database di Neon cloud sudah di-seed (133 Hero, 892 Skin, 3 Player). Anda **tidak wajib** menjalankan `npm run seed` lagi kecuali database di-reset. Jika ingin melihat data tabel secara visual di browser, jalankan:
> ```bash
> npx prisma studio
> ```

---

### 5. Jalankan Server Lokal
Nyalakan server development menggunakan:

```bash
npm run dev
```

Jika berhasil, terminal akan menampilkan output:
```text
Server berjalan di http://localhost:3000
```

Buka browser di `http://localhost:3000/health`. Anda akan melihat respons:
```json
{
  "status": true,
  "message": "Server MLBB Shop berjalan dengan baik"
}
```

---

##  Struktur Proyek Saat Ini

```text
pweb-express-A09-2026/
├── data/
│   ├── heroes.json         # Dataset 133 hero
│   └── skins.json          # Dataset 892 skin
├── prisma/
│   ├── migrations/         # Riwayat migrasi Prisma
│   ├── schema.prisma       # Model database (Hero, Skin, Player, PlayerHero)
│   └── seed.ts             # Script truncate & seeding awal
├── src/
│   ├── routes/
│   │   ├── hero.ts         # Endpoint /api/heroes
│   │   └── skin.ts         # Endpoint /api/skins
│   ├── db.ts               # Inisialisasi adapter Neon & PrismaClient
│   ├── index.ts            # Entrypoint Express server
│   └── middleware.ts       # Logger, Error Handler, & Not Found
├── .env                    # Environment variables (JANGAN dicommit)
├── .gitignore
├── package.json
└── tsconfig.json
```

---

##  Status Fitur & Pembagian Lanjutan

| Fitur / Endpoint | Status | Penanggung Jawab |
| :--- | :--- | :--- |
| **Setup & Health Check** (`GET /health`) | Selesai | Tahap 0 |
| **Fitur 1 (Middleware)**: Logger, Not Found, Error Handler | Selesai | Orang 1 |
| **Fitur 2 (Hero)**: `GET /api/heroes`, `GET /:id`, `POST /` | Selesai | Orang 1 |
| **Fitur 3 (Skin)**: `GET /api/skins`, `GET /:id` | Selesai | Orang 1 |
| **Fitur 4 (Player)**: CRUD Player | Selesai | Orang 2 |
| **Fitur 5 (Top Up & Match)**: `/topup`, `/matches` | Selesai | Orang 2 |
| **Fitur 6 (Beli Hero)**: `POST /api/players/:player_id/heroes` | **Belum** | Orang 3 |
| **Fitur 7 (Statistik)**: `GET /api/statistics` | **Belum** | Orang 3 |

---

##  Panduan Membuat Fitur Baru 

1. Buat file router baru di folder `src/routes/` (misalnya `player.ts` atau `transaction.ts`).
2. Gunakan instance `prisma` dan `HttpError` yang sudah tersedia:
   ```typescript
   import { Router } from 'express';
   import { prisma } from '../db.js';
   import { HttpError } from '../middleware.js';

   const router = Router();
   // tulis route di sini
   export default router;
   ```
3. Daftarkan router tersebut di `src/index.ts` sebelum `app.use(notFoundMiddleware);`.
4. Jika ingin melempar error validasi, gunakan:
   ```typescript
   throw new HttpError(400, 'Pesan error validasi');
   ```
5. Pastikan selalu membuat branch git baru sebelum mengerjakan fitur agar tidak terjadi conflict:
   ```bash
   git checkout -b fitur-player
   ```
