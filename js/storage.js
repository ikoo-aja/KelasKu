/* ===== KelasKu — wrapper localStorage ===== */
const Store = {
  get(key, fallback = []) {
    try {
      const raw = localStorage.getItem("kelas_" + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error("Gagal baca " + key, e);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("kelas_" + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Gagal simpan " + key, e);
      return false;
    }
  },
  /* Ambil 1 item berdasar id */
  find(key, id) {
    return this.get(key).find((item) => item.id === id) || null;
  },
  /* Tambah item baru (id & dibuatPada diisi otomatis) */
  add(key, item) {
    const data = this.get(key);
    item.id = Utils.uid();
    item.dibuatPada = new Date().toISOString();
    data.push(item);
    return this.set(key, data) ? item : null;
  },
  /* Update item berdasar id */
  update(key, id, perubahan) {
    const data = this.get(key);
    const idx = data.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...perubahan };
    return this.set(key, data) ? data[idx] : null;
  },
  /* Hapus item berdasar id */
  remove(key, id) {
    const data = this.get(key).filter((item) => item.id !== id);
    return this.set(key, data);
  },
};

/* ===== Seed data awal (hanya sekali, saat pertama dibuka) =====
   Sumber data: "data siswa kelas xii rpl 1.xlsx" (36 siswa + wali kelas).
   Catatan: flag kelas_seeded baru di-set SETELAH hash password selesai,
   supaya kalau halaman ditutup sebelum hash selesai, seed jalan ulang dengan bersih.
   Versi seed = "5" (role-based access: admin/walas/sekre/bendahara/murid). */
(function seedData() {
  /* Migrasi data lama: PR tanpa pemilik -> jadi milik admin (biar tetap kebaca) */
  (function migrasiPr() {
    const pr = Store.get("pr");
    if (pr.some((p) => !p.pembuat)) {
      pr.forEach((p) => {
        if (!p.pembuat) p.pembuat = "u1";
      });
      Store.set("pr", pr);
    }
  })();

  if (localStorage.getItem("kelas_seeded") === "6") return;

  Promise.all([
    Utils.sha256("admin123"),
    Utils.sha256("walikelas123"),
    Utils.sha256("sekre123"),
    Utils.sha256("bendahara123"),
    Utils.sha256("murid123"),
  ]).then(([hashAdmin, hashWali, hashSekre, hashBendahara, hashMurid]) => {
    Store.set("info", {
      namaKelas: "XII Rekayasa Perangkat Lunak 1 (RPL 1)",
      namaSingkat: "XII RPL 1",
      waliKelas: "Siti Aisyah, S.Ag",
    });

    Store.set("users", [
      {
        id: "u1",
        nama: "Admin Kelas",
        username: "admin",
        passwordHash: hashAdmin,
        role: "admin",
      },
      {
        id: "u2",
        nama: "Siti Aisyah, S.Ag",
        username: "walikelas",
        passwordHash: hashWali,
        role: "walas",
      },
      {
        id: "u3",
        nama: "Sekretaris Kelas",
        username: "sekre",
        passwordHash: hashSekre,
        role: "sekre",
      },
      {
        id: "u4",
        nama: "Bendahara Kelas",
        username: "bendahara",
        passwordHash: hashBendahara,
        role: "bendahara",
      },
      {
        id: "u5",
        nama: "Murid (Contoh)",
        username: "murid",
        passwordHash: hashMurid,
        role: "murid",
      },
    ]);

    /* [NIS, NISN, Nama, L/P] — dari file data siswa kelas xii rpl 1.xlsx */
    const dataSiswa = [
      ["11238", "0087644092", "ABDUL MALIK HARAHAP", "L"],
      ["11240", "0095862580", "ADZIKRI VAUDILLAH ACHMAD", "L"],
      ["11248", "0091131625", "ALFREDO PARLUHUTAN RIBERY SITORUS", "L"],
      ["11249", "0083662604", "ALI RIDHO", "L"],
      ["11253", "0088825724", "ALVINA CHINTYA SYARIEF", "P"],
      ["11254", "0095104633", "ALVINO PRAMUDIA", "L"],
      ["11267", "0087843636", "ARKANANTA IRSYADILLAH", "L"],
      ["11273", "0081094553", "BILLY AKBAR FEBRYAN", "L"],
      ["11282", "0085845542", "DAFFA DIMASALIM", "L"],
      ["11285", "0072188668", "DARREN LIMRICH", "L"],
      ["11299", "0093245390", "FAIRUZ ILHAM", "L"],
      ["11303", "0093628687", "FARDHAN MARCELLO", "L"],
      ["11308", "0099098209", "FLORENCE DIAN KHARA KAURY", "P"],
      ["11309", "0089042233", "GHAIDA RAJWADHITA AMBARDI", "P"],
      ["11313", "0079863794", "HABIL RAMADHAN", "L"],
      ["11315", "0099546679", "HAIDAR DZAKI ALTAFALAH", "L"],
      ["11319", "0087058669", "HUSAIN ALI", "L"],
      ["11321", "0097677372", "IQBAL KHOIR", "L"],
      ["11324", "0093602305", "JETHRO MALANTON", "L"],
      ["11325", "0078708043", "KARAN SINIWASEN", "L"],
      ["11345", "0091173839", "MARTIN JUARA MARBUN", "L"],
      ["11352", "0086833768", "MUHAMAD PUTRA PRATAMA", "L"],
      ["11360", "0087809944", "MUHAMMAD FAWWAZ ARLEANSYAH", "L"],
      ["11365", "0088240214", "MUHAMMAD SYAMIL SHAFWAN", "L"],
      ["11370", "0085354032", "NABIL SENO ALDINI", "L"],
      ["11379", "0099170152", "NASYIFA CHYNTIA AIRA", "P"],
      ["11392", "0087766897", "NURUL AFSYAH", "P"],
      ["11397", "0095471974", "RAFFA PRANATA", "L"],
      ["11399", "0089032357", "RAFLY", "L"],
      ["11404", "3083537183", "RASKY MUHAMMAD", "L"],
      ["11411", "0158291923", "RENDY RAIHANDANIE", "L"],
      ["11412", "0088556016", "RIDHO ARIA SAPUTRA", "L"],
      ["11413", "0089505987", "RIFA FAJRIYATU ZIHNI", "P"],
      ["11415", "0082292279", "RIFQI AUNUR RAHMAN", "L"],
      ["11416", "0084343661", "RIO RIZQI SAPUTRA", "L"],
      ["11435", "0089838350", "SITI FATIMAH AZZAHRA", "P"],
    ];
    Store.set(
      "siswa",
      dataSiswa.map(([nis, nisn, nama, jenisKelamin]) => ({
        id: Utils.uid(),
        nama,
        nis,
        nisn,
        jenisKelamin,
        dibuatPada: new Date().toISOString(),
      }))
    );

    /* Mapel asli — dari jadwal XII RPL 1 */
    const mapelData = [
      ["Web + Aplikasi", "Pak Hadi"],
      ["Database", "Pak Ayi"],
      ["Bahasa Inggris", "Bu Ernin"],
      ["B. Jepang", "Sensei Maria"],
      ["PKK", "Bu Siti Khodijah"],
      ["Pengembangan Gim / Data Sains", "Pak Syaiful"],
      ["Matematika", "Pak Muhamad"],
      ["BK", "Bu Rita"],
      ["Agama", "Bu Siti Aisyah"],
      ["Bahasa Indonesia", "Bu Nina"],
      ["PPKn", "Bu Maya"],
      ["Kokurikuler", ""],
    ];
    const mapel = mapelData.map(([namaMapel, guruPengajar]) => ({
      id: Utils.uid(),
      namaMapel,
      guruPengajar,
      dibuatPada: new Date().toISOString(),
    }));
    Store.set("pelajaran", mapel);
    const mapelId = (nama) => mapel.find((m) => m.namaMapel === nama)?.id;

    /* Jadwal mingguan — dari data jadwal XII RPL 1.
       Entry istirahat (istirahat: true) tampil beda dan cuma sebagai info. */
    const jadwal = [];
    const tambah = (hari, nama, mulai, selesai) =>
      jadwal.push({
        id: Utils.uid(),
        hari,
        mapelId: mapelId(nama),
        jamMulai: mulai,
        jamSelesai: selesai,
        ruang: "",
        dibuatPada: new Date().toISOString(),
      });
    const istirahat = (hari, mulai, selesai) =>
      jadwal.push({
        id: Utils.uid(),
        hari,
        istirahat: true,
        jamMulai: mulai,
        jamSelesai: selesai,
        dibuatPada: new Date().toISOString(),
      });

    tambah("Senin", "Web + Aplikasi", "07:30", "11:35");
    istirahat("Senin", "09:45", "10:15");
    tambah("Senin", "Bahasa Inggris", "11:35", "15:00");
    istirahat("Senin", "12:15", "12:45");

    tambah("Selasa", "Database", "06:45", "10:55");
    istirahat("Selasa", "09:45", "10:15");
    tambah("Selasa", "B. Jepang", "10:55", "12:15");
    istirahat("Selasa", "12:15", "12:45");
    tambah("Selasa", "PKK", "12:15", "15:00");

    tambah("Rabu", "Pengembangan Gim / Data Sains", "06:45", "09:45");
    istirahat("Rabu", "09:45", "10:15");
    tambah("Rabu", "Matematika", "10:15", "12:15");
    istirahat("Rabu", "12:15", "12:45");
    tambah("Rabu", "BK", "12:45", "13:30");
    tambah("Rabu", "Agama", "13:30", "15:00");

    tambah("Kamis", "Web + Aplikasi", "06:45", "09:45");
    istirahat("Kamis", "09:45", "10:15");
    tambah("Kamis", "Bahasa Indonesia", "10:15", "11:35");
    tambah("Kamis", "Database", "11:35", "15:00");
    istirahat("Kamis", "12:15", "12:45");

    tambah("Jumat", "Kokurikuler", "07:00", "08:10");
    tambah("Jumat", "PKK", "08:10", "09:30");
    istirahat("Jumat", "09:30", "10:00");
    tambah("Jumat", "PPKn", "10:00", "11:15");
    tambah("Jumat", "Database", "11:15", "15:00");
    istirahat("Jumat", "11:30", "12:30");

    Store.set("jadwal", jadwal);

    /* ===== Kas mingguan semester 1 (2025) — dari UANG KAS XII RPL 1.xlsx =====
       Kode per minggu (22 char): 5=lunas Rp5.000, 3=sebagian Rp3.000, 1=sebagian Rp1.000,
       x=belum bayar, .=belum tercatat. Urutan siswa sama dengan daftar siswa di atas. */
    const kodeKas = [
      "55xxxx................", /* Abdul Malik Harahap */
      "..xxxx................", /* Adzikri Vaudillah Achmad */
      "55xxxx55..............", /* Alfredo Parluhutan Ribery Sitorus */
      "55xxxx................", /* Ali Ridho */
      "55xxxx................", /* Alvina Chintya Syarief */
      "55xxxx5...............", /* Alvino Pramudia */
      "5.xxxx................", /* Arkananta Irsyadillah */
      "5.xxxx................", /* Billy Akbar Febryan */
      "55xxxx5...............", /* Daffa Dimasalim */
      "55xxxx55..............", /* Darren Limrich */
      "55xxxx................", /* Fairuz Ilham */
      "55xxxx555.............", /* Fardhan Marcello */
      "55xxxx5555555555555555", /* Florence Dian Khara Kaury */
      "55xxxx55555...........", /* Ghaida Rajwadhita Ambardi */
      "5.xxxx................", /* Habil Ramadhan */
      "55xxxx................", /* Haidar Dzaki Alfatalah */
      "..xxxx................", /* Husain Ali */
      "55xxxx................", /* Iqbal Khoir */
      "3.xxxx................", /* Jethro Malanton */
      "5.xxxx................", /* Karan Siniwasen */
      "..xxxx................", /* Martin Juara Marbun */
      "55xxxx................", /* Muhamad Putra Pratama */
      "55xxxx................", /* Muhammad Fawwaz Arleansyah */
      "55xxxx................", /* Muhammad Syamil Shafwan */
      "51xxxx................", /* Nabil Seno Aldini */
      "55xxxx................", /* Nasyifa Chyntia Aira */
      "5.xxxx................", /* Nurul Afsyah */
      "5.xxxx................", /* Raffa Pranata */
      "5.xxxx................", /* Rafly */
      "55xxxx................", /* Rasky Muhammad */
      "5.xxxx................", /* Rendy Raihandanie */
      "55xxxx................", /* Ridho Aria Saputra */
      "..xxxx................", /* Rifa Fajriyatu Zihni */
      "55xxxx................", /* Rifqi Aunur Rahman */
      "55xxxx................", /* Rio Rizqi Saputra */
      "55xxxx................", /* Siti Fatimah Azzahra */
    ];
    const mingguSemester = [
      ["Juli", 6, 3], ["Juli", 6, 4],
      ["Agustus", 7, 1], ["Agustus", 7, 2], ["Agustus", 7, 3], ["Agustus", 7, 4],
      ["September", 8, 1], ["September", 8, 2], ["September", 8, 3], ["September", 8, 4],
      ["Oktober", 9, 1], ["Oktober", 9, 2], ["Oktober", 9, 3], ["Oktober", 9, 4],
      ["November", 10, 1], ["November", 10, 2], ["November", 10, 3], ["November", 10, 4],
      ["Desember", 11, 1], ["Desember", 11, 2], ["Desember", 11, 3], ["Desember", 11, 4],
    ];
    const dataSiswaFinal = Store.get("siswa");
    const kasMingguan = [];
    const totalPerMinggu = new Array(22).fill(0);
    kodeKas.forEach((kode, si) => {
      for (let w = 0; w < 22; w++) {
        const ch = kode[w];
        const [bulan, mIdx, ke] = mingguSemester[w];
        let status = "kosong", nominal = 0;
        if (ch === "5") { status = "lunas"; nominal = 5000; }
        else if (ch === "3") { status = "sebagian"; nominal = 3000; }
        else if (ch === "1") { status = "sebagian"; nominal = 1000; }
        else if (ch === "x") { status = "belum"; }
        totalPerMinggu[w] += nominal;
        kasMingguan.push({
          id: Utils.uid(),
          siswaId: dataSiswaFinal[si].id,
          minggu: "2025-" + bulan + "-" + ke,
          status,
          nominal,
        });
      }
    });
    Store.set("kasMingguan", kasMingguan);
    Store.set("pembayaran", []); // model tagihan bulanan lama diganti kas mingguan
    Store.set("kasKeluar", []);
    /* kas masuk per minggu biar saldo sesuai pemasukan semester 1 */
    const pad = (n) => String(n).padStart(2, "0");
    const kasMasuk = mingguSemester
      .map(([bulan, mIdx, ke], w) => {
        if (totalPerMinggu[w] <= 0) return null;
        const d = new Date(2025, mIdx, (ke - 1) * 7 + 4);
        return {
          id: Utils.uid(),
          deskripsi: "Kas mingguan — Minggu " + ke + " " + bulan + " 2025",
          jumlah: totalPerMinggu[w],
          tanggal: d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()),
          sumber: "iuran mingguan",
          dibuatPada: new Date().toISOString(),
        };
      })
      .filter(Boolean);
    Store.set("kasMasuk", kasMasuk);

    /* Contoh PR & tugas (per akun: field pembuat = id user pemilik tugas) */
    const tglN = (n) => {
      const d = new Date();
      d.setDate(d.getDate() + n);
      return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0")
      );
    };
    Store.set("pr", [
      {
        id: Utils.uid(),
        mapelId: mapelId("Web + Aplikasi"),
        judul: "Latihan membuat halaman web",
        deskripsi: "Kerjakan latihan halaman 20–25, dikumpulkan saat jam pelajaran.",
        tenggat: tglN(7),
        status: "belum",
        pembuat: "u2",
        dibuatPada: new Date().toISOString(),
      },
      {
        id: Utils.uid(),
        mapelId: mapelId("Database"),
        judul: "Baca modul Database bab 3",
        deskripsi: "Baca & rangkum, siap untuk kuis pekan depan.",
        tenggat: tglN(3),
        status: "belum",
        pembuat: "u3",
        dibuatPada: new Date().toISOString(),
      },
      {
        id: Utils.uid(),
        mapelId: mapelId("Matematika"),
        judul: "Latihan soal trigonometri",
        deskripsi: "Nomor 1–10 halaman 45.",
        tenggat: tglN(-2),
        status: "selesai",
        pembuat: "u5",
        dibuatPada: new Date().toISOString(),
      },
      {
        id: Utils.uid(),
        mapelId: mapelId("Bahasa Indonesia"),
        judul: "Membuat teks ulasan buku",
        deskripsi: "Pilih satu buku, tulis ulasannya.",
        tenggat: tglN(10),
        status: "belum",
        pembuat: "u1",
        dibuatPada: new Date().toISOString(),
      },
    ]);

    localStorage.setItem("kelas_seeded", "6");
  });
})();
