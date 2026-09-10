/* ===== KelasKu — modul data siswa ===== */
const SiswaPage = {
  render() {
    const bisaEdit = Auth.boleh("siswa") === "edit";
    const siswa = Store.get("siswa").sort((a, b) => a.nama.localeCompare(b.nama));

    return `
      <div class="section-head">
        <h3>Daftar Siswa (${siswa.length})</h3>
        ${bisaEdit ? '<button class="btn btn-primary btn-sm" onclick="SiswaPage.formTambah()">+ Tambah Siswa</button>' : ""}
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>No</th><th>Nama</th><th>NIS</th><th>NISN</th><th>L/P</th>${bisaEdit ? "<th>Aksi</th>" : ""}</tr>
          </thead>
          <tbody>
            ${
              siswa.length === 0
                ? '<tr><td colspan="6" class="empty-row">Belum ada siswa. Tambahkan siswa dulu.</td></tr>'
                : siswa
                    .map(
                      (s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${Utils.escapeHtml(s.nama)}</strong></td>
                <td>${Utils.escapeHtml(s.nis || "-")}</td>
                <td>${Utils.escapeHtml(s.nisn || "-")}</td>
                <td>${s.jenisKelamin || "-"}</td>
                ${
                  bisaEdit
                    ? `<td>
                  <button class="btn btn-sm btn-secondary" onclick="SiswaPage.formEdit('${s.id}')">Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="SiswaPage.hapus('${s.id}')">Hapus</button>
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
    this.form(Store.find("siswa", id));
  },

  form(siswa) {
    Utils.bukaModal(`
      <h3>${siswa ? "Edit Siswa" : "Tambah Siswa"}</h3>
      <form id="formSiswa">
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input name="nama" required value="${Utils.escapeHtml(siswa?.nama || "")}" />
        </div>
        <div class="form-group">
          <label>NIS</label>
          <input name="nis" value="${Utils.escapeHtml(siswa?.nis || "")}" />
        </div>
        <div class="form-group">
          <label>NISN (opsional)</label>
          <input name="nisn" value="${Utils.escapeHtml(siswa?.nisn || "")}" />
        </div>
        <div class="form-group">
          <label>Jenis Kelamin</label>
          <select name="jenisKelamin">
            <option value="">— pilih —</option>
            <option value="L" ${siswa?.jenisKelamin === "L" ? "selected" : ""}>Laki-laki</option>
            <option value="P" ${siswa?.jenisKelamin === "P" ? "selected" : ""}>Perempuan</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Utils.tutupModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    `);
    document.getElementById("formSiswa").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = {
        nama: fd.get("nama").trim(),
        nis: fd.get("nis").trim(),
        nisn: fd.get("nisn").trim(),
        jenisKelamin: fd.get("jenisKelamin"),
      };
      if (siswa) {
        Store.update("siswa", siswa.id, data);
        Utils.toast("Siswa diperbarui");
      } else {
        Store.add("siswa", data);
        Utils.toast("Siswa ditambahkan");
      }
      Utils.tutupModal();
      App.rerender();
    };
  },

  hapus(id) {
    const s = Store.find("siswa", id);
    Utils.konfirmasi({
      judul: "Hapus Siswa",
      pesan: `Hapus siswa <strong>"${Utils.escapeHtml(s?.nama || "")}"</strong>?<br><span style="font-size:12.5px;opacity:.7">Data absen & PR terkait tidak ikut terhapus.</span>`,
      tipe: "danger",
      tombolYa: "Ya, Hapus",
      onYa: () => {
        Store.remove("siswa", id);
        Utils.toast("Siswa dihapus");
        App.rerender();
      },
    });
  },
};
