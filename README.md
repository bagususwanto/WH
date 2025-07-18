# Warehouse Management System (WMS)

Sistem manajemen gudang (WMS) terintegrasi berbasis web, terdiri dari backend (Node.js/Express), frontend admin mendukung pengelolaan stok, laporan, dan master data. frontend order mendukung order dan approval.

---

## Fitur Utama

- **Manajemen Gudang:** Stok, material, storage, dan pergerakan barang
- **Order & Approval:** Proses pemesanan, persetujuan multi-level, histori
- **Manajemen User & Role:** Hak akses berbasis role, multi plant/divisi
- **Laporan & Dashboard:** Visualisasi data, grafik, dan export Excel
- **Notifikasi:** In-app notification
- **Integrasi:** API RESTful, siap integrasi dengan sistem lain

---

## Struktur Project

```
WH/
  backend/         # Backend API (Node.js, Express, Sequelize)
  frontend/        # Frontend Admin (React, Vite)
  frontend-order/  # Frontend Order/User (React, Vite)
  flow/            # Diagram alur & ERD
  docker-compose.yml
  README.md
```

---

## Instalasi & Menjalankan

### Prasyarat

- Node.js >= 18
- npm >= 9
- Docker (opsional, untuk deployment)

### 1. Clone Repository

```bash
git clone https://github.com/bagususwanto/WH
cd WH
```

### 2. Setup Backend

```bash
cd backend
npm install
# Konfigurasi database di config/config.json
npm run migrate   # Jika menggunakan Sequelize migration
npm start         # atau: node App.js
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev       # Jalankan di http://localhost:3001
```

### 4. Setup Frontend Order

```bash
cd ../frontend-order
npm install
npm run dev       # Jalankan di http://localhost:3002
```

### 5. (Opsional) Jalankan dengan Docker Compose

```bash
docker-compose up --build
```

---

## Konfigurasi

- **Database:** Atur koneksi di `backend/utils/Database.js`
- **Environment:** Tambahkan file `.env` jika diperlukan (misal untuk secret, API key, dsb)
- **Port default:**
  - Backend: 5000
  - Frontend: 3001
  - Frontend Order: 3002

---

## Dokumentasi API (Singkat)

- Endpoint utama: `http://localhost:5000/api/`
- Contoh endpoint:
  - `POST /api/auth/login` — Login user
  - `GET /api/material` — List material
  - `POST /api/order` — Buat order
  - `GET /api/dashboard` — Data dashboard
- Dokumentasi lengkap: lihat folder `backend/routes/` dan `controllers/`

---

## Kontribusi

1. Fork & clone repo
2. Buat branch fitur: `git checkout -b fitur-anda`
3. Commit & push perubahan
4. Buat Pull Request

---

## Lisensi

Lisensi internal DxTeam

---

## Kontak & Bantuan

- Email: bagus_uswanto@outlook.com
- Dokumentasi teknis: lihat folder `flow/`

---

> Untuk pertanyaan lebih lanjut, silakan hubungi tim pengembang.
