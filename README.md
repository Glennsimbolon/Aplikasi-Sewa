# GASPOL RC Arena

Aplikasi web sewa RC (mobil/drone remote control) dengan 6 modul bisnis: Sewa RC, Toko RC,
Reparasi & Modifikasi, Workshop, Kompetisi, dan Food Court — sesuai skema platform yang diberikan.

## Cara menjalankan di VS Code

1. **Buka folder ini** di VS Code (`File > Open Folder...`).
2. **Buka terminal** di VS Code (`` Ctrl+` `` atau `View > Terminal`).
3. **Install dependency** (butuh [Node.js](https://nodejs.org) versi 18+ terpasang):
   ```bash
   npm install
   ```
4. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```
5. Buka browser ke alamat yang muncul di terminal (biasanya `http://localhost:5173`) — akan
   terbuka otomatis.

## Struktur proyek

```
gaspol-rc/
├── index.html          # entry point HTML
├── package.json        # daftar dependency & script
├── tailwind.config.js  # konfigurasi Tailwind CSS
├── postcss.config.js
├── vite.config.js
└── src/
    ├── main.jsx         # render React ke DOM
    ├── index.css        # import Tailwind
    └── App.jsx          # seluruh aplikasi (komponen utama + semua modul)
```

## Build untuk produksi

```bash
npm run build
```

Hasil build statis akan ada di folder `dist/`, siap di-deploy ke Vercel, Netlify, atau hosting
statis lainnya. Untuk preview hasil build secara lokal:

```bash
npm run preview
```

## Yang bisa kamu ubah dengan mudah

- **Data unit RC, harga, kelas, kompetisi, menu** — semua ada di bagian atas `src/App.jsx`
  dalam array `FLEET`, `STORE_ITEMS`, `SERVICES`, `CLASSES`, `COMPETITIONS`, `MENU`.
- **Warna & tema** — objek `C` di awal `src/App.jsx` (asphalt, amber, green, red, dll).
- **Font** — di variabel `FONTS`, memakai Google Fonts (Rajdhani + Inter + JetBrains Mono).

## Langkah selanjutnya (belum ada di versi ini)

- Koneksi ke backend/database sungguhan (saat ini semua data masih statis/mock di frontend).
- Sistem login untuk role Owner, Admin, Kasir, Teknisi, Tenant, Customer.
- Integrasi pembayaran (Midtrans/Xendit/DOKU) dan channel online (marketplace, website).
- Dashboard admin/owner untuk laporan, master data, dan pengaturan settlement food court.
