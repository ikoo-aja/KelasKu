/* ===== KelasKu — modul profil (edit nama & password) ===== */
const ProfilPage = {
  render() {
    const user = Auth.user();
    if (!user) return "";
    return `
      <div class="section-head">
        <h3>Profil Saya</h3>
      </div>
      <div class="card">
        <div class="profil-head">
          <span class="avatar avatar-lg">${Utils.escapeHtml((user.nama || "?").charAt(0).toUpperCase())}</span>
          <div>
            <h4 style="margin:0 0 4px">${Utils.escapeHtml(user.nama)}</h4>
            <p class="text-muted" style="margin:0;font-size:13.5px">
              <i class="fa-solid fa-user"></i> @${Utils.escapeHtml(user.username)} ·
              <span class="badge badge-role">${Utils.escapeHtml(Auth.labelRole(user.role))}</span>
            </p>
          </div>
        </div>

        <form id="formProfil" onsubmit="ProfilPage.simpan(event)" style="margin-top:20px">
          <div class="form-group">
            <label>Nama tampilan</label>
            <input name="nama" required value="${Utils.escapeHtml(user.nama)}" />
          </div>
          <h4 style="margin:20px 0 6px;font-size:15px">Ganti Password</h4>
          <p class="text-muted" style="font-size:12.5px;margin:0 0 10px">
            Kosongkan kolom password jika tidak ingin menggantinya.
          </p>
          <div class="form-row">
            <div class="form-group">
              <label>Password lama</label>
              <div class="pass-field">
                <input name="lama" type="password" autocomplete="current-password" placeholder="••••••••" />
                <button type="button" class="pass-eye" onclick="ProfilPage.togglePass(this)" title="Lihat password"><i class="fa-solid fa-eye"></i></button>
              </div>
            </div>
            <div class="form-group">
              <label>Password baru</label>
              <div class="pass-field">
                <input name="baru" type="password" autocomplete="new-password" placeholder="min. 6 karakter" />
                <button type="button" class="pass-eye" onclick="ProfilPage.togglePass(this)" title="Lihat password"><i class="fa-solid fa-eye"></i></button>
              </div>
            </div>
            <div class="form-group">
              <label>Ulangi password baru</label>
              <div class="pass-field">
                <input name="ulang" type="password" autocomplete="new-password" placeholder="••••••••" />
                <button type="button" class="pass-eye" onclick="ProfilPage.togglePass(this)" title="Lihat password"><i class="fa-solid fa-eye"></i></button>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Simpan Profil</button>
          </div>
        </form>
      </div>
      ${Auth.isAdmin() ? this.kartuCadangan() : ""}
    `;
  },

  /* Kartu cadangan & pemulihan data (khusus admin) — biar data yang keliru
     terhapus masih bisa dikembalikan */
  kartuCadangan() {
    const daftar = Store.daftarCadangan();
    const hitung = (c) =>
      Object.values(c.data).reduce((s, raw) => {
        try {
          const v = JSON.parse(raw);
          return s + (Array.isArray(v) ? v.length : 1);
        } catch {
          return s + 1;
        }
      }, 0);
    return `
      <div class="card" style="margin-top:18px">
        <div class="section-head" style="margin-bottom:10px">
          <h4 style="margin:0;font-size:16px"><i class="fa-solid fa-clock-rotate-left"></i> Cadangan &amp; Pemulihan Data</h4>
          <button class="btn btn-secondary btn-sm" onclick="ProfilPage.buatCadangan()"><i class="fa-solid fa-plus"></i> Buat Cadangan</button>
        </div>
        <p class="text-muted" style="font-size:12.5px;margin:0 0 12px">
          Cadangan dibuat otomatis setiap kali data dihapus atau aplikasi diperbarui — maksimal
          ${Store.CADANGAN_MAKS} cadangan terakhir. Memulihkan cadangan tidak mengubah data akun &amp; password.
        </p>
        ${
          daftar.length === 0
            ? '<p class="text-muted" style="font-size:13px">Belum ada cadangan.</p>'
            : daftar
                .map(
                  (c) => `
          <div class="cadangan-item">
            <div>
              <strong>${Utils.formatWaktu(c.waktu)}</strong>
              <span class="text-muted">${Utils.escapeHtml(c.alasan)} · ${hitung(c)} data</span>
            </div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-sm btn-secondary" onclick="ProfilPage.pulihkan('${c.id}')"><i class="fa-solid fa-rotate-left"></i> Pulihkan</button>
              <button class="btn btn-sm btn-danger" onclick="ProfilPage.hapusCadangan('${c.id}')" title="Hapus cadangan"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </div>`
                )
                .join("")
        }
      </div>
    `;
  },

  buatCadangan() {
    if (!Store.cadangkan("Cadangan manual")) return Utils.toast("Gagal membuat cadangan", "error");
    Utils.toast("Cadangan dibuat");
    App.renderApp();
  },

  pulihkan(id) {
    const c = Store.daftarCadangan().find((x) => x.id === id);
    if (!c) return;
    Utils.konfirmasi({
      judul: "Pulihkan Cadangan",
      pesan:
        "Data akan dikembalikan ke kondisi <b>" +
        Utils.formatWaktu(c.waktu) +
        "</b> (" +
        Utils.escapeHtml(c.alasan) +
        ").<br><br>Data yang sekarang otomatis dicadangkan lebih dulu, jadi masih bisa dibatalkan.",
      tombolYa: "Ya, Pulihkan",
      onYa: () => {
        if (!Store.pulihkan(id)) return Utils.toast("Gagal memulihkan data", "error");
        Utils.tutupModal();
        Utils.toast("Data berhasil dipulihkan");
        App.renderApp();
      },
    });
  },

  hapusCadangan(id) {
    Utils.konfirmasi({
      judul: "Hapus Cadangan",
      pesan: "Hapus cadangan ini? Tindakan ini tidak bisa dibatalkan.",
      tipe: "danger",
      tombolYa: "Ya, Hapus",
      onYa: () => {
        Store.hapusCadangan(id);
        Utils.toast("Cadangan dihapus");
        App.renderApp();
      },
    });
  },

  /* Blind eye: lihat/sembunyikan password di kolom profil */
  togglePass(btn) {
    const input = btn.parentElement.querySelector("input");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.querySelector("i").className = "fa-solid " + (show ? "fa-eye-slash" : "fa-eye");
    btn.title = show ? "Sembunyikan password" : "Lihat password";
  },

  async simpan(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const user = Auth.user();
    if (!user) return;

    const nama = (fd.get("nama") || "").trim();
    if (!nama) return Utils.toast("Nama tidak boleh kosong", "error");

    const lama = (fd.get("lama") || "").trim();
    const baru = (fd.get("baru") || "").trim();
    const ulang = (fd.get("ulang") || "").trim();

    if (lama || baru || ulang) {
      if (!lama) return Utils.toast("Isi password lama dulu", "error");
      if (baru.length < 6) return Utils.toast("Password baru minimal 6 karakter", "error");
      if (baru !== ulang) return Utils.toast("Konfirmasi password baru tidak sama", "error");
      const hashLama = await Utils.sha256(lama);
      if (hashLama !== user.passwordHash) return Utils.toast("Password lama salah", "error");
    }

    const perubahan = { nama };
    if (baru) perubahan.passwordHash = await Utils.sha256(baru);
    Store.update("users", user.id, perubahan);

    /* perbarui session biar nama langsung ke-update */
    const fresh = Store.find("users", user.id);
    sessionStorage.setItem("kelas_session", JSON.stringify(fresh));

    Utils.toast(baru ? "Profil & password diperbarui" : "Profil diperbarui");
    App.renderApp();
  },
};