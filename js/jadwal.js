/* ===== KelasKu — modul jadwal pelajaran ===== */
const JADWAL_HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const JadwalPage = {
  render() {
    const bisaEdit = Auth.boleh("jadwal") === "edit";
    const jadwal = Store.get("jadwal");
    const mapel = Store.get("pelajaran");

    const namaMapel = (id) => Store.find("pelajaran", id)?.namaMapel || "(mapel dihapus)";

    return `
      <div class="section-head">
        <h3>Jadwal Pelajaran Mingguan</h3>
        ${bisaEdit ? '<button class="btn btn-primary btn-sm" onclick="JadwalPage.formTambah()">+ Tambah Jadwal</button>' : ""}
      </div>
      ${
        mapel.length === 0
          ? '<div class="card"><p class="text-muted">Tambahkan mata pelajaran dulu di menu Mata Pelajaran, lalu buat jadwalnya.</p></div>'
          : `
      <div class="jadwal-grid">
        ${JADWAL_HARI.map(
          (hari) => `
        <div class="jadwal-day">
          <h3>${hari}</h3>
          ${
            jadwal
              .filter((j) => j.hari === hari)
              .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai))
              .map(
                (j) => {
                  const guru = j.istirahat ? "" : Store.find("pelajaran", j.mapelId)?.guruPengajar || "";
                  return `
            <div class="jadwal-item${j.istirahat ? " jadwal-istirahat" : ""}">
              <strong>${j.istirahat ? '<i class="fa-solid fa-mug-hot"></i> Istirahat' : Utils.escapeHtml(namaMapel(j.mapelId))}</strong>
              <span class="jam">${j.jamMulai} – ${j.jamSelesai}${j.ruang ? " · " + Utils.escapeHtml(j.ruang) : ""}</span>
              ${guru ? `<span class="jam jadwal-guru"><i class="fa-solid fa-chalkboard-user"></i> ${Utils.escapeHtml(guru)}</span>` : ""}
              ${
                bisaEdit && !j.istirahat
                  ? `<div style="margin-top:6px">
                <button class="btn btn-sm btn-secondary" onclick="JadwalPage.formEdit('${j.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="JadwalPage.hapus('${j.id}')">Hapus</button>
              </div>`
                  : ""
              }
            </div>`;
                }
              )
              .join("") || '<p class="text-muted" style="font-size:13px">—</p>'
          }
        </div>`
        ).join("")}
      </div>`
      }
    `;
  },

  formTambah() {
    this.form(null);
  },
  formEdit(id) {
    this.form(Store.find("jadwal", id));
  },

  form(jadwal) {
    const mapel = Store.get("pelajaran");
    Utils.bukaModal(`
      <h3>${jadwal ? "Edit Jadwal" : "Tambah Jadwal"}</h3>
      <form id="formJadwal">
        <div class="form-group">
          <label>Mata Pelajaran</label>
          <select name="mapelId" required>
            ${mapel.map((m) => `<option value="${m.id}" ${jadwal?.mapelId === m.id ? "selected" : ""}>${Utils.escapeHtml(m.namaMapel)}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Hari</label>
            <select name="hari">
              ${JADWAL_HARI.map((h) => `<option ${jadwal?.hari === h ? "selected" : ""}>${h}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Ruang (opsional)</label>
            <input name="ruang" value="${Utils.escapeHtml(jadwal?.ruang || "")}" placeholder="contoh: Lab RPL" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Jam Mulai</label>
            <input name="jamMulai" type="time" value="${jadwal?.jamMulai || "07:30"}" required />
          </div>
          <div class="form-group">
            <label>Jam Selesai</label>
            <input name="jamSelesai" type="time" value="${jadwal?.jamSelesai || "09:00"}" required />
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Utils.tutupModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    `);
    document.getElementById("formJadwal").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = {
        mapelId: fd.get("mapelId"),
        hari: fd.get("hari"),
        jamMulai: fd.get("jamMulai"),
        jamSelesai: fd.get("jamSelesai"),
        ruang: fd.get("ruang").trim(),
      };
      if (jadwal) {
        Store.update("jadwal", jadwal.id, data);
        Utils.toast("Jadwal diperbarui");
      } else {
        Store.add("jadwal", data);
        Utils.toast("Jadwal ditambahkan");
      }
      Utils.tutupModal();
      App.rerender();
    };
  },

  hapus(id) {
    Utils.konfirmasi({
      judul: "Hapus Jadwal",
      pesan: "Hapus jadwal ini?",
      tipe: "danger",
      tombolYa: "Ya, Hapus",
      onYa: () => {
        Store.remove("jadwal", id);
        Utils.toast("Jadwal dihapus");
        App.rerender();
      },
    });
  },
};
