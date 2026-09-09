# 🎓 KelasKu — Aplikasi Kelas XII RPL 1

Web app sederhana untuk mengelola kehidupan kelas: **kas, absensi, PR & tugas, jadwal, mata pelajaran, dan data siswa**. Dibuat dengan HTML + CSS + JavaScript murni (tanpa framework, tanpa build step) dan menyimpan data di **localStorage** browser.

## ✨ Fitur

- **Landing page** — hero animasi, statistik live dari data, marquee mapel, dan 6 kartu fitur
- **Login** — akun default: `admin` / `admin123` (admin kelas) dan `walikelas` / `walikelas123` (wali kelas), password di-hash SHA-256
- **Seed data asli** — 36 siswa XII RPL 1 (NIS, NISN, L/P) + wali kelas **Siti Aisyah, S.Ag** dari file `data siswa kelas xii rpl 1.xlsx`
- **Jadwal asli** — 12 mapel + guru pengajar, jadwal Senin–Jumat lengkap dengan jam istirahat (seed dari jadwal XII RPL 1)
- **Dashboard** — ringkasan siswa, absen hari ini, PR terdekat, saldo kas, jadwal hari ini
- **Data Siswa** — CRUD daftar siswa: NIS, NISN, jenis kelamin
- **Absensi** — absen harian (hadir/sakit/izin/alpa), rekap 30 hari, export CSV
- **Kas Kelas** — transaksi masuk/keluar, saldo otomatis, kas personal **Rp5.000/minggu** (semester 1: 22 minggu = Rp110.000) + rekap matriks mingguan, export CSV
- **Mata Pelajaran** — daftar mapel + guru pengajar
- **Jadwal** — jadwal mingguan per hari (Senin–Jumat) dengan guru pengajar & jam istirahat
- **PR & Tugas** — tugas per mapel dengan tenggat + status selesai
- Responsif (mobile friendly), UI bahasa Indonesia

## 🚀 Menjalankan Lokal

Cukup buka `index.html` di browser, atau jalankan server mini:

```bash
# Python
python -m http.server 8080

# atau Node
npx serve .
```

Lalu buka `http://localhost:8080`.

> ⚠️ Data disimpan di localStorage browser — data di perangkat A tidak muncul di perangkat B.

## 🌐 Deploy Gratis

### GitHub Pages
1. Push semua file ke repo GitHub.
2. Buka **Settings → Pages**.
3. Source: `Deploy from a branch`, branch: `main`, folder: `/ (root)`.
4. Save — situs live di `https://username.github.io/nama-repo/`.

### Vercel
1. Import repo di [vercel.com](https://vercel.com) (atau drag & drop folder di `vercel.com/new`).
2. Framework Preset: **Other** (tidak perlu build command).
3. Deploy.

### Netlify
1. Buka [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag & drop folder project — selesai.

## 📁 Struktur

```
├── index.html          # SPA shell + login
├── css/
│   ├── style.css       # tema & layout
│   ├── components.css  # tombol, form, modal, toast
│   └── landing.css     # landing page (hero, animasi, fitur)
├── js/
│   ├── storage.js      # wrapper localStorage + seed data
│   ├── utils.js        # helper (tanggal, rupiah, modal, toast)
│   ├── auth.js         # login/session
│   ├── siswa.js        # modul data siswa
│   ├── absen.js        # modul absensi
│   ├── kas.js          # modul kas kelas
│   ├── pelajaran.js    # modul mapel
│   ├── jadwal.js       # modul jadwal
│   ├── pr.js           # modul PR & tugas
│   ├── app.js          # router + dashboard
│   └── landing.js      # interaktivitas landing page
└── README.md
```

## ⚠️ Catatan

- Login & data murni client-side — cocok untuk pemakaian internal kelas, bukan untuk data sensitif.
- Ganti password admin: login → buka DevTools Console → ikuti petunjuk, atau minta fitur "ganti password" ditambahkan.
- Menambah akun siswa: belum ada UI-nya — bisa ditambahkan sebagai pengembangan berikutnya.
