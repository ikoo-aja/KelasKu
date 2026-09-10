/* ===== KelasKu — autentikasi, session & role-based access ===== */
const Auth = {
  user() {
    try {
      return JSON.parse(sessionStorage.getItem("kelas_session"));
    } catch {
      return null;
    }
  },
  async login(username, password) {
    const users = Store.get("users");
    const user = users.find((u) => u.username === username);
    if (!user) return null;
    const hash = await Utils.sha256(password);
    if (hash !== user.passwordHash) return null;
    sessionStorage.setItem("kelas_session", JSON.stringify(user));
    return user;
  },
  logout() {
    sessionStorage.removeItem("kelas_session");
    location.hash = "";
    App.renderLogin();
  },
  isAdmin() {
    return this.user()?.role === "admin";
  },

  /* Label Indonesia untuk tiap role */
  labelRole(role) {
    return (
      {
        admin: "Admin Kelas",
        walas: "Wali Kelas",
        sekre: "Sekretaris",
        bendahara: "Bendahara",
        murid: "Murid",
      }[role] || role || "-"
    );
  },

  /* Hak akses per modul:
     "edit"    = boleh tambah/ubah/hapus
     "sebagian"= akses terbatas (PR: murid bisa tambah + tandai selesai, tanpa hapus/edit)
     "view"    = hanya lihat
     Matriks: admin edit semua; walas read-only (kecuali PR); sekre edit siswa/absen/mapel/jadwal;
     bendahara edit kas saja; murid lihat siswa/kas/mapel/jadwal + PR terbatas. */
  tabelBoleh() {
    return {
      admin:     { siswa: "edit", absen: "edit", kas: "edit", pelajaran: "edit", jadwal: "edit", pr: "edit" },
      walas:     { siswa: "view", absen: "view", kas: "view", pelajaran: "view", jadwal: "view", pr: "edit" },
      sekre:     { siswa: "edit", absen: "edit", kas: "view", pelajaran: "edit", jadwal: "edit", pr: "edit" },
      bendahara: { siswa: "view", absen: "view", kas: "edit", pelajaran: "view", jadwal: "view", pr: "edit" },
      murid:     { siswa: "view", absen: "view", kas: "view", pelajaran: "view", jadwal: "view", pr: "sebagian" },
    };
  },

  /* Hak akses untuk 1 modul: "edit" | "sebagian" | "view" */
  boleh(modul) {
    const tabel = this.tabelBoleh()[this.user()?.role];
    return (tabel && tabel[modul]) || "view";
  },

  /* Halaman yang boleh dibuka tiap role (menu sidebar) */
  menu() {
    const semua = ["dashboard", "siswa", "absen", "kas", "pelajaran", "jadwal", "pr", "pengingat", "profil"];
    const tabel = {
      admin: semua,
      walas: semua,
      sekre: semua,
      bendahara: semua,
      /* murid: lihat data siswa, kas, mapel, jadwal + PR & pengingat; tanpa dashboard & absensi */
      murid: ["siswa", "kas", "pelajaran", "jadwal", "pr", "pengingat", "profil"],
    };
    return tabel[this.user()?.role] || [];
  },

  bolehHalaman(halaman) {
    return this.menu().includes(halaman);
  },

  /* Halaman pembuka setelah login (murid langsung ke Data Siswa) */
  halamanDefault() {
    const menu = this.menu();
    return menu.includes("dashboard") ? "dashboard" : menu[0] || "dashboard";
  },
};