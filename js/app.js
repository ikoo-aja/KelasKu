/* ===== KelasKu — app utama: router, login, dashboard ===== */
const App = {
  pages: {
    dashboard: { title: "Dashboard", modul: null },
    siswa: { title: "Data Siswa", modul: () => SiswaPage },
    absen: { title: "Absensi", modul: () => AbsenPage },
    kas: { title: "Kas Kelas", modul: () => KasPage },
    pelajaran: { title: "Mata Pelajaran", modul: () => PelajaranPage },
    jadwal: { title: "Jadwal", modul: () => JadwalPage },
    pr: { title: "PR & Tugas", modul: () => PrPage },
    pengingat: { title: "Pengingat Tugas", modul: () => PengingatPage },
    profil: { title: "Profil", modul: () => ProfilPage },
  },

  init() {
    document.getElementById("loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });
    /* toggle lihat/sembunyi password */
    document.getElementById("loginTogglePass").addEventListener("click", () => {
      const pw = document.getElementById("loginPassword");
      const toggle = document.getElementById("loginTogglePass");
      const show = pw.type === "password";
      pw.type = show ? "text" : "password";
      toggle.innerHTML = show
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
      pw.focus();
    });
    /* tombol buka login (landing page) */
    document.querySelectorAll("[data-buka-login]").forEach((btn) =>
      btn.addEventListener("click", () => this.bukaLogin())
    );
    document.getElementById("loginClose").addEventListener("click", () => {
      this.renderLogin();
      this.tutupSidebar();
    });
    document.getElementById("logoutBtn").addEventListener("click", () => Auth.logout());
    document.getElementById("menuBtn").addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("open");
      document.getElementById("sidebarBackdrop").classList.toggle("show");
    });
    document.getElementById("sidebarBackdrop").addEventListener("click", () => this.tutupSidebar());
    window.addEventListener("hashchange", () => this.route());
    this.route();
  },

  tutupSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarBackdrop").classList.remove("show");
  },

  async handleLogin() {
    const btn = document.getElementById("loginBtn");
    const spinner = document.getElementById("loginSpinner");
    const errEl = document.getElementById("loginError");
    const errText = document.getElementById("loginErrorText");
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    btn.disabled = true;
    spinner.classList.remove("hidden");
    errEl.classList.add("hidden");

    const user = await Auth.login(username, password);

    btn.disabled = false;
    spinner.classList.add("hidden");

    if (!user) {
      errText.textContent = "Username atau password salah. Coba lagi ya.";
      errEl.classList.remove("hidden");
      return;
    }
    this.renderApp();
    location.hash = "#/" + Auth.halamanDefault();
    this.route();
  },

  /* Tampilkan landing page (belum login) */
  renderLogin() {
    document.getElementById("appShell").classList.add("hidden");
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("landingScreen").classList.remove("hidden");
  },

  /* Buka overlay login dari landing */
  bukaLogin() {
    const errEl = document.getElementById("loginError");
    errEl.classList.add("hidden");
    document.getElementById("loginErrorText").textContent = "";
    const pw = document.getElementById("loginPassword");
    pw.value = "";
    pw.type = "password";
    document.getElementById("loginTogglePass").innerHTML = '<i class="fa-solid fa-eye"></i>';
    document.getElementById("loginScreen").classList.remove("hidden");
    document.getElementById("loginUsername").focus();
  },

  renderApp() {
    const user = Auth.user();
    if (!user) return this.renderLogin();
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("landingScreen").classList.add("hidden");
    document.getElementById("appShell").classList.remove("hidden");
    document.getElementById("userNama").textContent = user.nama;
    document.getElementById("userRole").textContent = Auth.labelRole(user.role);
    document.getElementById("userAvatar").textContent = user.nama.charAt(0).toUpperCase();
    /* nama kelas dari data */
    const info = Store.get("info", {});
    document.getElementById("sidebarSub").textContent = info.namaSingkat || "XII RPL 1";
    document.title = "KelasKu — " + (info.namaSingkat || "XII RPL 1");
    this.route();
  },

  route() {
    if (!Auth.user()) {
      this.renderLogin();
      return;
    }
    let halaman = (location.hash.replace("#/", "") || "dashboard").split("?")[0];
    /* guard: halaman tak dikenal atau tak diizinkan role -> kembali ke halaman default */
    if (!this.pages[halaman] || !Auth.bolehHalaman(halaman)) {
      halaman = Auth.halamanDefault();
    }
    this.render(halaman);
  },

  render(halaman) {
    const conf = this.pages[halaman];
    document.getElementById("pageTitle").textContent = conf.title;

    /* tampilkan menu sesuai role & tandai yang aktif */
    document.querySelectorAll("#sidebarNav a").forEach((a) => {
      const on = Auth.bolehHalaman(a.dataset.page);
      a.classList.toggle("hidden", !on);
      a.classList.toggle("active", on && a.dataset.page === halaman);
    });

    /* render konten */
    const modul = conf.modul ? conf.modul() : null;
    document.getElementById("pageContent").innerHTML = modul
      ? modul.render()
      : this.renderDashboard();

    this.tutupSidebar();
  },

  rerender() {
    const halaman = (location.hash.replace("#/", "") || "dashboard").split("?")[0];
    this.render(this.pages[halaman] ? halaman : "dashboard");
  },

  renderDashboard() {
    const siswa = Store.get("siswa");
    const absen = Store.get("absen");
    const pr = Store.get("pr");
    const masuk = Store.get("kasMasuk");
    const keluar = Store.get("kasKeluar");
    const saldo = masuk.reduce((s, t) => s + Number(t.jumlah || 0), 0) -
      keluar.reduce((s, t) => s + Number(t.jumlah || 0), 0);
    const hariIni = Utils.hariIni();
    const info = Store.get("info", {});
    const user = Auth.user();

    /* absen hari ini */
    const absenHariIni = absen.filter((a) => a.tanggal === hariIni);
    const hadir = absenHariIni.filter((a) => a.status === "hadir").length;

    /* PR belum selesai milikku & terdekat */
    const prAktif = pr
      .filter((p) => p.pembuat === user.id && p.status !== "selesai")
      .sort((a, b) => (a.tenggat || "").localeCompare(b.tenggat || ""))
      .slice(0, 5);

    /* jadwal hari ini */
    const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const hariSekarang = namaHari[new Date().getDay()];
    const jadwalHariIni = Store.get("jadwal")
      .filter((j) => j.hari === hariSekarang)
      .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

    const namaMapel = (id) => Store.find("pelajaran", id)?.namaMapel || "(mapel dihapus)";

    const namaUser = (user?.nama || "").split(",")[0] || "Teman";

    return `
      <div class="dash-welcome">
        <div>
          <h3>Halo, <strong>${Utils.escapeHtml(namaUser)}</strong> <i class="fa-solid fa-face-smile"></i></h3>
          <p>
            <span><i class="fa-solid fa-calendar-day"></i> ${Utils.tanggalPanjang()}</span>
            <span class="dash-kelas"><i class="fa-solid fa-school"></i> ${Utils.escapeHtml(info.namaSingkat || "XII RPL 1")}</span>
          </p>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-users"></i></div><div class="stat-value">${siswa.length}</div><div class="stat-label">Total Siswa</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div><div class="stat-value text-success">${hadir}</div><div class="stat-label">Hadir Hari Ini</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-clipboard-list"></i></div><div class="stat-value text-warning">${pr.filter((p) => p.pembuat === user.id && p.status !== "selesai").length}</div><div class="stat-label">PR Belum Selesai</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-building-columns"></i></div><div class="stat-value">${Utils.formatRupiah(saldo)}</div><div class="stat-label">Saldo Kas</div></div>
      </div>

      <div class="dash-grid">
        <div class="card">
          <h3><i class="fa-solid fa-calendar-days"></i> Jadwal Hari Ini (${hariSekarang})</h3>
          ${
            jadwalHariIni.length === 0
              ? '<p class="text-muted">Tidak ada jadwal hari ini.</p>'
              : jadwalHariIni
                  .map(
                    (j) => {
                      const guru = j.istirahat ? "" : Store.find("pelajaran", j.mapelId)?.guruPengajar || "";
                      return `
            <div class="jadwal-item${j.istirahat ? " jadwal-istirahat" : ""}">
              <strong>${j.istirahat ? '<i class="fa-solid fa-mug-hot"></i> Istirahat' : Utils.escapeHtml(namaMapel(j.mapelId))}</strong>
              <span class="jam">${j.jamMulai} – ${j.jamSelesai}${j.ruang ? " · " + Utils.escapeHtml(j.ruang) : ""}</span>
              ${guru ? `<span class="jam jadwal-guru"><i class="fa-solid fa-chalkboard-user"></i> ${Utils.escapeHtml(guru)}</span>` : ""}
            </div>`;
                    }
                  )
                  .join("")
          }
        </div>

        <div class="card">
          <h3><i class="fa-solid fa-clipboard-list"></i> PR Terdekat</h3>
          ${
            prAktif.length === 0
              ? '<p class="text-muted">Tidak ada PR belum selesai. <i class="fa-solid fa-face-grin-stars"></i></p>'
              : prAktif
                  .map(
                    (p) => `
            <div class="jadwal-item" style="border-left-color: var(--warning)">
              <strong>${Utils.escapeHtml(p.judul)}</strong>
              <span class="jam">${Utils.escapeHtml(namaMapel(p.mapelId))} · tenggat ${Utils.formatTanggal(p.tenggat)}</span>
            </div>`
                  )
                  .join("")
          }
        </div>

        <div class="card">
          <h3><i class="fa-solid fa-circle-check"></i> Absen Hari Ini</h3>
          ${
            absenHariIni.length === 0
              ? '<p class="text-muted">Belum ada absen hari ini.</p>'
              : absenHariIni
                  .map(
                    (a) => `
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:14px">
              <span>${Utils.escapeHtml(Store.find("siswa", a.siswaId)?.nama || "(siswa dihapus)")}</span>
              <span class="badge badge-${a.status}">${a.status}</span>
            </div>`
                  )
                  .join("")
          }
        </div>
      </div>
    `;
  },

  /* Download data sebagai CSV (dipakai modul lain) */
  downloadCsv(namaFile, baris) {
    const csv = baris
      .map((row) =>
        row.map((sel) => '"' + String(sel).replace(/"/g, '""') + '"').join(",")
      )
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = namaFile;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
