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
| **Absensi** | Absen harian dengan alur cepat (tandai semua hadir → sesuaikan → konfirmasi sekali), lihat absen per tanggal, rekap per rentang tanggal, riwayat dengan log audit, serta **ekspor rekap ke CSV** (per siswa, per hari, atau riwayat lengkap) |
| **Mata Pelajaran** | Daftar mata pelajaran beserta guru pengajar |
| **Jadwal** | Jadwal Senin–Jumat lengkap dengan jam istirahat dan guru pengajar |
| **PR & Tugas** | Daftar tugas pribadi per akun — tambah, **impor cepat** dari catatan yang ditempel, **ekspor ke TXT/CSV** untuk arsip, tandai selesai, edit, dan hapus tugas sendiri, plus pilihan **bagikan sebagai pengingat** |
| **Pengingat Tugas** | Tugas yang dibagikan akun lain tampil read-only sebagai pengingat bersama |
| **Profil** | Ubah nama tampilan & password, serta **cadangan dan pemulihan data** |

## Keunggulan

- **Antarmuka profesional** — tema terang & gelap yang dapat diganti, seluruhnya berbahasa Indonesia
- **Cepat & ringan** — tanpa framework dan tanpa proses build
- **Data tersimpan otomatis** di browser — tidak membutuhkan server
- **Data aman** — pembaruan aplikasi tidak pernah menimpa data yang sudah ada, dan cadangan otomatis tersedia sebelum data dihapus
- **Laporan** — ekspor rekap kehadiran ke file CSV (per siswa, per hari, atau riwayat lengkap) dan ekspor daftar PR & tugas ke TXT/CSV
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

### Impor Cepat PR & Tugas

Untuk memasukkan banyak tugas sekaligus, gunakan tombol **Impor Cepat**: tempel saja catatan tugas — **satu baris menjadi satu tugas**. Setiap baris dapat berupa judul saja, atau `Judul | Mapel | Tenggat | Deskripsi` (mapel, tenggat, dan deskripsi opsional; tenggat bebas format seperti `25/09/2026`, `2026-09-25`, atau `25 Sep 2026`). Urutan kolom 2–4 dibaca otomatis — mana pun yang berbentuk tanggal dianggap tenggat, teks pertama menjadi mapel, dan teks berikutnya menjadi deskripsi. Tersedia pula mapel & tenggat default untuk baris yang tidak menyebutkannya, pratinjau jumlah tugas sebelum disimpan, dan pilihan berbagi sebagai pengingat untuk seluruh hasil impor. Maksimal 200 baris per impor.

### Ekspor & Cadangan Tugas

Tombol **Ekspor** menyimpan daftar tugas ke berkas:

- **TXT** — satu baris per tugas dengan format yang sama seperti Impor Cepat (`Judul | Mapel | Tenggat | Deskripsi`), sehingga berkasnya bisa ditempel balik kapan saja lewat Impor Cepat. Tugas yang sudah selesai ditandai `[x]` dan penanda itu ikut terbaca saat diimpor kembali, jadi status tidak hilang.
- **CSV** — tabel berkolom judul, mapel, tenggat, deskripsi, dan status untuk dibuka di Excel atau diarsipkan.

Ekspor dapat dibatasi ke **tugas sendiri** saja, atau disertakan dengan pengingat dari akun lain (tugas pribadi akun lain tidak pernah ikut terekspor).

### Berbagi Tugas sebagai Pengingat

Setiap akun mengelola daftar tugasnya sendiri. Saat menambah atau mengedit tugas, pemiliknya dapat memilih **bagikan sebagai pengingat** — tugas tersebut lalu tampil di halaman **Pengingat Tugas** akun lain (hanya untuk dilihat), sehingga seluruh kelas dapat saling mengingatkan tanpa bisa mengubah tugas milik orang lain.

## Privasi Data

- Seluruh data tersimpan di browser masing-masing perangkat (localStorage) — tidak dikirim ke server mana pun.
- Akses edit dibatasi sesuai peran agar administrasi tetap tertib.
- Pembaruan data bawaan aplikasi bersifat **non-destruktif**: data yang sudah diisi tidak pernah ditimpa, dan setiap penghapusan didahului cadangan otomatis yang dapat dipulihkan kembali dari menu Profil.