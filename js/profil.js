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
    `;
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