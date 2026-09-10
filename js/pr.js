/* ===== KelasKu — modul PR & tugas (per akun) =====
   Setiap akun punya daftar tugasnya sendiri (field pembuat = id user).
   Tugas dari akun lain tampil read-only di halaman "Pengingat Tugas". */
const PrPage = {
  render() {
    const me = Auth.user();
    const pr = Store.get("pr").filter((p) => p.pembuat === me.id);
    const mapel = Store.get("pelajaran");
    const hariIni = Utils.hariIni();

    const namaMapel = (id) => Store.find("pelajaran", id)?.namaMapel || "(mapel dihapus)";

    /* urutkan: yang belum selesai & paling dekat tenggat di atas */
    const urut = [...pr].sort((a, b) => {
      if (a.status !== b.status) return a.status === "selesai" ? 1 : -1;
      return (a.tenggat || "").localeCompare(b.tenggat || "");
    });

    return `
      <div class="section-head">
        <h3>PR &amp; Tugas Saya (${pr.length})</h3>
        <button class="btn btn-primary btn-sm" onclick="PrPage.formTambah()">+ Tambah PR</button>
      </div>
      <p class="text-muted" style="font-size:13px;margin-bottom:14px">
        Ini daftar tugas milikmu sendiri. Tugas dari akun lain bisa dilihat di menu
        <strong>Pengingat Tugas</strong>.
      </p>
      ${
        mapel.length === 0
          ? '<div class="card"><p class="text-muted">Tambahkan mata pelajaran dulu di menu Mata Pelajaran, lalu buat PR-nya.</p></div>'
          : pr.length === 0
          ? '<div class="card"><p class="text-muted">Belum ada PR-mu. Klik "+ Tambah PR" untuk menambahkan.</p></div>'
          : `
      <div class="pr-grid">
        ${urut
          .map((p) => {
            const lewat = p.status !== "selesai" && p.tenggat && p.tenggat < hariIni;
            return `
          <div class="pr-card">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
              <h4>${Utils.escapeHtml(p.judul)}</h4>
              ${
                p.status === "selesai"
                  ? '<span class="badge badge-selesai">Selesai</span>'
                  : lewat
                  ? '<span class="badge badge-terlambat">Terlambat</span>'
                  : '<span class="badge badge-belum-selesai">Belum</span>'
              }
            </div>
            <div class="pr-meta"><i class="fa-solid fa-book-open"></i> ${Utils.escapeHtml(namaMapel(p.mapelId))} · <i class="fa-solid fa-calendar-days"></i> tenggat ${Utils.formatTanggal(p.tenggat)}</div>
            ${p.deskripsi ? `<div class="pr-desc">${Utils.escapeHtml(p.deskripsi)}</div>` : ""}
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-sm ${p.status === "selesai" ? "btn-secondary" : "btn-primary"}" onclick="PrPage.toggleStatus('${p.id}')">
                ${p.status === "selesai" ? '<i class="fa-solid fa-rotate-left"></i> Batal selesai' : '<i class="fa-solid fa-check"></i> Tandai selesai'}
              </button>
              <button class="btn btn-sm btn-secondary" onclick="PrPage.formEdit('${p.id}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="PrPage.hapus('${p.id}')">Hapus</button>
            </div>
          </div>`;
          })
          .join("")}
      </div>`
      }
    `;
  },

  formTambah() {
    this.form(null);
  },
  formEdit(id) {
    this.form(Store.find("pr", id));
  },

  form(pr) {
    const mapel = Store.get("pelajaran");
    Utils.bukaModal(`
      <h3>${pr ? "Edit PR" : "Tambah PR"}</h3>
      <form id="formPr">
        <div class="form-group">
          <label>Mata Pelajaran</label>
          <select name="mapelId" required>
            ${mapel.map((m) => `<option value="${m.id}" ${pr?.mapelId === m.id ? "selected" : ""}>${Utils.escapeHtml(m.namaMapel)}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Judul PR</label>
          <input name="judul" required value="${Utils.escapeHtml(pr?.judul || "")}" placeholder="contoh: Latihan soal halaman 20" />
        </div>
        <div class="form-group">
          <label>Deskripsi (opsional)</label>
          <textarea name="deskripsi">${Utils.escapeHtml(pr?.deskripsi || "")}</textarea>
        </div>
        <div class="form-group">
          <label>Tenggat</label>
          <input name="tenggat" type="date" value="${pr?.tenggat || Utils.hariIni()}" required />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Utils.tutupModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    `);
    document.getElementById("formPr").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = {
        mapelId: fd.get("mapelId"),
        judul: fd.get("judul").trim(),
        deskripsi: fd.get("deskripsi").trim(),
        tenggat: fd.get("tenggat"),
        status: pr?.status || "belum",
        pembuat: pr?.pembuat || Auth.user()?.id,
      };
      if (pr) {
        Store.update("pr", pr.id, data);
        Utils.toast("PR diperbarui");
      } else {
        Store.add("pr", data);
        Utils.toast("PR ditambahkan — akun lain bisa lihat di Pengingat Tugas");
      }
      Utils.tutupModal();
      App.rerender();
    };
  },

  toggleStatus(id) {
    const pr = Store.find("pr", id);
    if (!pr || pr.pembuat !== Auth.user()?.id) return;
    Store.update("pr", id, { status: pr.status === "selesai" ? "belum" : "selesai" });
    App.rerender();
  },

  hapus(id) {
    const pr = Store.find("pr", id);
    if (!pr || pr.pembuat !== Auth.user()?.id) return;
    Utils.konfirmasi({
      judul: "Hapus PR & Tugas",
      pesan: "Hapus PR/tugas ini?",
      tipe: "danger",
      tombolYa: "Ya, Hapus",
      onYa: () => {
        Store.remove("pr", id);
        Utils.toast("PR dihapus");
        App.rerender();
      },
    });
  },
};