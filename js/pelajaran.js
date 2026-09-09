/* ===== KelasKu — modul mata pelajaran ===== */
const PelajaranPage = {
  render() {
    const isAdmin = Auth.isAdmin();
    const mapel = Store.get("pelajaran").sort((a, b) =>
      a.namaMapel.localeCompare(b.namaMapel)
    );

    return `
      <div class="section-head">
        <h3>Mata Pelajaran (${mapel.length})</h3>
        ${isAdmin ? '<button class="btn btn-primary btn-sm" onclick="PelajaranPage.formTambah()">+ Tambah Mapel</button>' : ""}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>No</th><th>Mata Pelajaran</th><th>Guru Pengajar</th>${isAdmin ? "<th>Aksi</th>" : ""}</tr></thead>
          <tbody>
            ${
              mapel.length === 0
                ? '<tr><td colspan="4" class="empty-row">Belum ada mata pelajaran.</td></tr>'
                : mapel
                    .map(
                      (m, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${Utils.escapeHtml(m.namaMapel)}</strong></td>
                <td>${Utils.escapeHtml(m.guruPengajar || "-")}</td>
                ${
                  isAdmin
                    ? `<td>
                  <button class="btn btn-sm btn-secondary" onclick="PelajaranPage.formEdit('${m.id}')">Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="PelajaranPage.hapus('${m.id}')">Hapus</button>
                </td>`
                    : ""
                }
              </tr>`
                    )
                    .join("")
            }
          </tbody>
        </table>
      </div>
    `;
  },

  formTambah() {
    this.form(null);
  },
  formEdit(id) {
    this.form(Store.find("pelajaran", id));
  },

  form(mapel) {
    Utils.bukaModal(`
      <h3>${mapel ? "Edit Mapel" : "Tambah Mapel"}</h3>
      <form id="formMapel">
        <div class="form-group">
          <label>Nama Mapel</label>
          <input name="namaMapel" required value="${Utils.escapeHtml(mapel?.namaMapel || "")}" />
        </div>
        <div class="form-group">
          <label>Guru Pengajar (opsional)</label>
          <input name="guruPengajar" value="${Utils.escapeHtml(mapel?.guruPengajar || "")}" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Utils.tutupModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    `);
    document.getElementById("formMapel").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = {
        namaMapel: fd.get("namaMapel").trim(),
        guruPengajar: fd.get("guruPengajar").trim(),
      };
      if (mapel) {
        Store.update("pelajaran", mapel.id, data);
        Utils.toast("Mapel diperbarui");
      } else {
        Store.add("pelajaran", data);
        Utils.toast("Mapel ditambahkan");
      }
      Utils.tutupModal();
      App.rerender();
    };
  },

  hapus(id) {
    const m = Store.find("pelajaran", id);
    if (!confirm(`Hapus mapel "${m?.namaMapel}"? Jadwal & PR terkait tidak ikut terhapus.`)) return;
    Store.remove("pelajaran", id);
    Utils.toast("Mapel dihapus");
    App.rerender();
  },
};
