# KelasKu — XII Rekayasa Perangkat Lunak 1

**KelasKu** adalah aplikasi web untuk membantu wali kelas dan pengurus kelas mengelola administrasi **XII Rekayasa Perangkat Lunak 1 (RPL 1)** — kehadiran siswa, tugas, jadwal pelajaran, dan data siswa — dari satu tempat.

Dibangun dengan **HTML, CSS, dan JavaScript murni**: cepat, ringan, tanpa instalasi, tanpa server, dan responsif di HP maupun laptop.

## Tentang Aplikasi

KelasKu merapikan administrasi kelas sehari-hari yang biasanya tercerai-berai:

- **Kehadiran siswa** — pencatatan absensi harian yang cepat, rapi, dan dapat diaudit
- **PR & tugas** — setiap tugas tercatat per mata pelajaran beserta tenggatnya
- **Jadwal pelajaran** — susunan jadwal mingguan lengkap dengan guru pengajar dan jam istirahat
- **Data siswa** — data lengkap kelas (NIS, NISN, jenis kelamin) sebagai dasar semua modul
- **Pemantauan harian** — dashboard ringkasan kondisi kelas hari ini

## Fitur Utama

| Modul | Fungsi |
|---|---|
| **Dashboard** | Ringkasan kelas hari ini: kehadiran, tugas, dan jadwal dalam satu layar |
| **Data Siswa** | Data lengkap 36 siswa XII RPL 1 — NIS, NISN, jenis kelamin |
| **Absensi** | Absen harian dengan alur cepat (tandai semua hadir → sesuaikan → konfirmasi sekali), lihat absen per tanggal, rekap per rentang tanggal, riwayat dengan log audit, ekspor CSV |
| **Mata Pelajaran** | Daftar mata pelajaran beserta guru pengajar |
| **Jadwal** | Jadwal Senin–Jumat lengkap dengan jam istirahat dan guru pengajar |
| **PR & Tugas** | Daftar tugas pribadi per akun — tambah, tandai selesai, edit, dan hapus tugas sendiri |
| **Pengingat Tugas** | Tugas yang dibuat akun lain tampil read-only sebagai pengingat bersama |

## Keunggulan

- **Antarmuka profesional** — tema terang & gelap yang dapat diganti, seluruhnya berbahasa Indonesia
- **Cepat & ringan** — tanpa framework dan tanpa proses build
- **Data tersimpan otomatis** di browser — tidak membutuhkan server
- **Laporan** — ekspor rekap kehadiran ke file CSV
- **Privasi** — seluruh data berada di perangkat pengguna

## Teknologi

- HTML + CSS + JavaScript (ES6)
- Penyimpanan data: localStorage browser
- Ikon: Font Awesome

## Pengguna & Hak Akses

KelasKu mendukung beberapa peran dengan hak akses berbeda:

| Peran | Hak Akses |
|---|---|
| **Admin Kelas** | Mengelola seluruh data: siswa, absensi, jadwal, mata pelajaran, dan PR & tugas |
| **Wali Kelas** | Memantau seluruh modul dan ikut mengelola PR & tugas |
| **Sekretaris** | Mengelola absensi, jadwal, mata pelajaran, data siswa, dan PR & tugas |
| **Bendahara** | Mengelola administrasi kelas sesuai tanggung jawabnya, serta PR & tugas |
| **Murid** | Melihat data siswa, jadwal, dan mata pelajaran, serta menambah dan menandai PR & tugas |

Setiap akun dapat mengubah **nama tampilan** dan **password** melalui menu **Profil**.

## Privasi Data

- Seluruh data tersimpan di browser masing-masing perangkat (localStorage) — tidak dikirim ke server mana pun.
- Akses edit dibatasi sesuai peran agar administrasi tetap tertib.