/* ===== KelasKu — modul absensi ===== */
const AbsenPage = {
  tanggalTerpilih: Utils.hariIni(),
  rekapDari: null,
  rekapSampai: null,

  render() {
    const isAdmin = Auth.isAdmin();
    const siswa = Store.get("siswa").sort((a, b) => a.nama.localeCompare(b.nama));
    const absenHariIni = Store.get("absen").filter(
      (a) => a.tanggal === this.tanggalTerpilih
    );

    /* Rekap 30 hari terakhir */
    const semuaAbsen = Store.get("absen");
    const logHapus = Store.get("log")
      .filter((l) => l.aksi === "hapus_absen")
      .sort((a, b) => (b.dibuatPada || "").localeCompare(a.dibuatPada || ""));
    const batas = new Date();
    batas.setDate(batas.getDate() - 30);
    const batasIso =
      batas.getFullYear() +
      "-" +
      String(batas.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(batas.getDate()).padStart(2, "0");
    const rekap = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
    semuaAbsen
      .filter((a) => a.tanggal >= batasIso)
      .forEach((a) => {
        if (rekap[a.status] !== undefined) rekap[a.status]++;
      });

    /* Rekap per rentang tanggal (per siswa) */
    const rek = this.hitungRekapRentang();

    return `
      <div class="section-head">
        <h3>Absensi Harian</h3>
      </div>

      ${
        isAdmin
          ? `
      <div class="card">
        <div class="absen-toolbar">
          <label class="text-muted">Tanggal:</label>
          <input type="date" id="absenTanggal" value="${this.tanggalTerpilih}" onchange="AbsenPage.gantiTanggal(this.value)" />
          <span class="text-muted" style="font-size:13px">${Utils.namaHari(this.tanggalTerpilih)}</span>
          <span style="flex:1"></span>
          <button class="btn btn-sm btn-secondary" onclick="AbsenPage.isiSemua('hadir')">Semua Hadir</button>
        </div>
        ${
          siswa.length === 0
            ? '<p class="text-muted">Belum ada siswa. Tambahkan di menu Data Siswa.</p>'
            : `
        <div class="table-wrap" style="box-shadow:none">
          <table>
            <thead><tr><th>Siswa</th><th>Status</th><th>Keterangan</th></tr></thead>
            <tbody>
              ${siswa
                .map((s) => {
                  const rec = absenHariIni.find((a) => a.siswaId === s.id);
                  const status = rec?.status || "";
                  return `
                <tr>
                  <td><strong>${Utils.escapeHtml(s.nama)}</strong></td>
                  <td>
                    <select class="absen-select" onchange="AbsenPage.simpan('${s.id}', this.value, '')">
                      <option value="" ${!status ? "selected" : ""}>— pilih —</option>
                      <option value="hadir" ${status === "hadir" ? "selected" : ""}>Hadir</option>
                      <option value="sakit" ${status === "sakit" ? "selected" : ""}>Sakit</option>
                      <option value="izin" ${status === "izin" ? "selected" : ""}>Izin</option>
                      <option value="alpa" ${status === "alpa" ? "selected" : ""}>Alpa</option>
                    </select>
                  </td>
                  <td>
                    <input type="text" class="absen-ket" style="width:100%" placeholder="ket..." value="${Utils.escapeHtml(rec?.keterangan || "")}"
                      onchange="AbsenPage.simpan('${s.id}', '${status || "hadir"}', this.value)" />
                  </td>
                </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>`
        }
      </div>`
          : ""
      }

      <div class="card mt-16">
        <div class="section-head">
          <h3><i class="fa-solid fa-calendar-days"></i> Rekap Absen per Rentang Tanggal</h3>
          <button class="btn btn-sm btn-secondary" onclick="AbsenPage.exportRekapCsv()"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
        </div>
        <div class="absen-toolbar">
          <label class="text-muted">Dari:</label>
          <input type="date" id="rekapDari" value="${this.rekapDari}" onchange="AbsenPage.gantiRekapDari(this.value)" />
          <label class="text-muted">Sampai:</label>
          <input type="date" id="rekapSampai" value="${this.rekapSampai}" onchange="AbsenPage.gantiRekapSampai(this.value)" />
          <span class="text-muted" style="font-size:13px">${Utils.formatTanggal(rek.dari)} – ${Utils.formatTanggal(rek.sampai)} · ${rek.hariTercatat} hari tercatat</span>
          <span style="flex:1"></span>
          <button class="btn btn-sm btn-secondary" onclick="AbsenPage.setRekapHari(7)">7 Hari</button>
          <button class="btn btn-sm btn-secondary" onclick="AbsenPage.setRekapHari(30)">30 Hari</button>
        </div>
        <div class="stat-grid">
          <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div><div class="stat-value text-success">${rek.tot.hadir}</div><div class="stat-label">Hadir</div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-thermometer-half"></i></div><div class="stat-value text-warning">${rek.tot.sakit}</div><div class="stat-label">Sakit</div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-file-lines"></i></div><div class="stat-value" style="color:var(--info)">${rek.tot.izin}</div><div class="stat-label">Izin</div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-circle-xmark"></i></div><div class="stat-value text-danger">${rek.tot.alpa}</div><div class="stat-label">Alpa</div></div>
        </div>
        <div class="table-wrap" style="box-shadow:none">
          <table>
            <thead><tr><th>Nama Siswa</th><th>Hadir</th><th>Sakit</th><th>Izin</th><th>Alpa</th><th>Total</th><th>Kehadiran</th></tr></thead>
            <tbody>
              ${rek.rows
                .map(
                  (r) => `
                <tr>
                  <td><strong>${Utils.escapeHtml(r.nama)}</strong></td>
                  <td class="text-success">${r.hadir}</td>
                  <td class="text-warning">${r.sakit}</td>
                  <td style="color:var(--info)">${r.izin}</td>
                  <td class="text-danger">${r.alpa}</td>
                  <td>${r.total}</td>
                  <td>${r.total ? Math.round((r.hadir / r.total) * 100) + "%" : "-"}</td>
                </tr>`
                )
                .join("")}
              <tr style="border-top:2px solid var(--border)">
                <td><strong>Total</strong></td>
                <td><strong>${rek.tot.hadir}</strong></td>
                <td><strong>${rek.tot.sakit}</strong></td>
                <td><strong>${rek.tot.izin}</strong></td>
                <td><strong>${rek.tot.alpa}</strong></td>
                <td><strong>${rek.tot.total}</strong></td>
                <td><strong>${rek.tot.total ? Math.round((rek.tot.hadir / rek.tot.total) * 100) + "%" : "-"}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card mt-16">
        <h3>Rekap 30 Hari Terakhir</h3>
        <div class="stat-grid">
          <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div><div class="stat-value text-success">${rekap.hadir}</div><div class="stat-label">Hadir</div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-thermometer-half"></i></div><div class="stat-value text-warning">${rekap.sakit}</div><div class="stat-label">Sakit</div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-file-lines"></i></div><div class="stat-value" style="color:var(--info)">${rekap.izin}</div><div class="stat-label">Izin</div></div>
          <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-circle-xmark"></i></div><div class="stat-value text-danger">${rekap.alpa}</div><div class="stat-label">Alpa</div></div>
        </div>
      </div>

      <div class="card mt-16">
        <div class="section-head">
          <h3>Riwayat Absen (terbaru)</h3>
          <button class="btn btn-sm btn-secondary" onclick="AbsenPage.exportCsv()">Export CSV</button>
        </div>
        <div class="table-wrap" style="box-shadow:none">
          <table>
            <thead><tr><th>Tanggal</th><th>Nama</th><th>Status</th><th>Keterangan</th>${isAdmin ? "<th>Aksi</th>" : ""}</tr></thead>
            <tbody>
              ${
                semuaAbsen.length === 0
                  ? '<tr><td colspan="' + (isAdmin ? 5 : 4) + '" class="empty-row">Belum ada data absen.</td></tr>'
                  : [...semuaAbsen]
                      .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
                      .slice(0, 50)
                      .map((a) => {
                        const s = Store.find("siswa", a.siswaId);
                        return `
                    <tr>
                      <td>${Utils.formatTanggal(a.tanggal)}</td>
                      <td>${Utils.escapeHtml(s?.nama || "(siswa dihapus)")}</td>
                      <td><span class="badge badge-${a.status}">${a.status}</span></td>
                      <td>${Utils.escapeHtml(a.keterangan || "-")}</td>
                      ${
                        isAdmin
                          ? `<td>
                        <button class="btn btn-sm btn-danger" onclick="AbsenPage.hapus('${a.id}')"><i class="fa-solid fa-trash-can"></i> Hapus</button>
                      </td>`
                          : ""
                      }
                    </tr>`;
                      })
                      .join("")
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="card mt-16">
        <h3><i class="fa-solid fa-clock-rotate-left"></i> Log Penghapusan Absen</h3>
        ${
          logHapus.length === 0
            ? '<p class="text-muted">Belum ada penghapusan — riwayat aman.</p>'
            : `
        <div class="table-wrap" style="box-shadow:none">
          <table>
            <thead><tr><th>Waktu</th><th>Oleh</th><th>Data</th><th>Alasan</th></tr></thead>
            <tbody>
              ${logHapus
                .map(
                  (l) => `
                <tr>
                  <td>${Utils.formatWaktu(l.dibuatPada)}</td>
                  <td>${Utils.escapeHtml(l.oleh || "-")}</td>
                  <td>${Utils.escapeHtml(l.detail?.namaSiswa || "-")} · ${Utils.formatTanggal(l.detail?.tanggal)} <span class="badge badge-${l.detail?.status}">${l.detail?.status}</span></td>
                  <td>${Utils.escapeHtml(l.alasan || "-")}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`
        }
      </div>
    `;
  },

  /* Hapus 1 riwayat absen (wajib isi alasan, tercatat di log) */
  hapus(id) {
    const rec = Store.find("absen", id);
    if (!rec) return;
    const s = Store.find("siswa", rec.siswaId);
    Utils.bukaModal(`
      <h3><i class="fa-solid fa-trash-can"></i> Hapus Riwayat Absen</h3>
      <p class="text-muted" style="font-size:13.5px;margin-bottom:14px">
        ${Utils.escapeHtml(s?.nama || "(siswa dihapus)")} · ${Utils.formatTanggal(rec.tanggal)} ·
        <span class="badge badge-${rec.status}">${rec.status}</span>
      </p>
      <div class="form-group">
        <label>Alasan penghapusan <span style="color:var(--danger)">*</span></label>
        <textarea id="alasanHapus" required placeholder="contoh: salah input, seharusnya izin bukan alpa"></textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="Utils.tutupModal()">Batal</button>
        <button type="button" class="btn btn-danger" onclick="AbsenPage.prosesHapus('${id}')"><i class="fa-solid fa-trash-can"></i> Ya, Hapus</button>
      </div>
    `);
  },

  prosesHapus(id) {
    const alasan = document.getElementById("alasanHapus").value.trim();
    if (!alasan) {
      Utils.toast("Alasan wajib diisi dulu", "error");
      return;
    }
    const rec = Store.find("absen", id);
    if (!rec) {
      Utils.tutupModal();
      return;
    }
    const s = Store.find("siswa", rec.siswaId);
    /* catat ke log dulu, baru hapus */
    Store.add("log", {
      aksi: "hapus_absen",
      oleh: Auth.user()?.nama || "-",
      alasan,
      detail: {
        tanggal: rec.tanggal,
        namaSiswa: s?.nama || "(siswa dihapus)",
        status: rec.status,
        keterangan: rec.keterangan || "",
      },
    });
    Store.remove("absen", id);
    Utils.tutupModal();
    Utils.toast("Riwayat absen dihapus & tercatat di log");
    App.rerender();
  },

  gantiTanggal(tgl) {
    this.tanggalTerpilih = tgl || Utils.hariIni();
    App.rerender();
  },

  /* Hitung rekap per rentang tanggal (dipakai render & export) */
  hitungRekapRentang() {
    if (!this.rekapDari || !this.rekapSampai) {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      this.rekapDari =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");
      this.rekapSampai = Utils.hariIni();
    }
    let dari = this.rekapDari;
    let sampai = this.rekapSampai;
    if (dari > sampai) [dari, sampai] = [sampai, dari];
    const siswa = Store.get("siswa").sort((a, b) => a.nama.localeCompare(b.nama));
    const absenRentang = Store.get("absen").filter(
      (a) => a.tanggal >= dari && a.tanggal <= sampai
    );
    const rows = siswa.map((s) => {
      const c = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
      absenRentang
        .filter((a) => a.siswaId === s.id)
        .forEach((a) => {
          if (c[a.status] !== undefined) c[a.status]++;
        });
      c.total = c.hadir + c.sakit + c.izin + c.alpa;
      return { nama: s.nama, ...c };
    });
    const tot = rows.reduce(
      (t, r) => {
        t.hadir += r.hadir;
        t.sakit += r.sakit;
        t.izin += r.izin;
        t.alpa += r.alpa;
        t.total += r.total;
        return t;
      },
      { hadir: 0, sakit: 0, izin: 0, alpa: 0, total: 0 }
    );
    return {
      dari,
      sampai,
      rows,
      tot,
      hariTercatat: new Set(absenRentang.map((a) => a.tanggal)).size,
    };
  },

  gantiRekapDari(tgl) {
    this.rekapDari = tgl || this.rekapDari;
    App.rerender();
  },

  gantiRekapSampai(tgl) {
    this.rekapSampai = tgl || this.rekapSampai;
    App.rerender();
  },

  /* Setel rentang: n hari terakhir sampai hari ini */
  setRekapHari(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    this.rekapDari =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");
    this.rekapSampai = Utils.hariIni();
    App.rerender();
  },

  exportRekapCsv() {
    const rek = this.hitungRekapRentang();
    const baris = [["Nama", "Hadir", "Sakit", "Izin", "Alpa", "Total", "Kehadiran %"]];
    rek.rows.forEach((r) =>
      baris.push([
        r.nama,
        r.hadir,
        r.sakit,
        r.izin,
        r.alpa,
        r.total,
        r.total ? Math.round((r.hadir / r.total) * 100) : 0,
      ])
    );
    baris.push([
      "TOTAL",
      rek.tot.hadir,
      rek.tot.sakit,
      rek.tot.izin,
      rek.tot.alpa,
      rek.tot.total,
      rek.tot.total ? Math.round((rek.tot.hadir / rek.tot.total) * 100) : 0,
    ]);
    App.downloadCsv("rekap-absen-" + rek.dari + "-sd-" + rek.sampai + ".csv", baris);
  },

  /* Simpan/update absen 1 siswa (upsert per tanggal) */
  simpan(siswaId, status, keterangan) {
    if (!status) return;
    const semua = Store.get("absen");
    const idx = semua.findIndex(
      (a) => a.siswaId === siswaId && a.tanggal === this.tanggalTerpilih
    );
    if (idx >= 0) {
      semua[idx].status = status;
      semua[idx].keterangan = keterangan;
    } else {
      semua.push({
        id: Utils.uid(),
        tanggal: this.tanggalTerpilih,
        siswaId,
        status,
        keterangan,
        dibuatPada: new Date().toISOString(),
      });
    }
    Store.set("absen", semua);
  },

  isiSemua(status) {
    const siswa = Store.get("siswa");
    siswa.forEach((s) => this.simpan(s.id, status, ""));
    Utils.toast("Semua siswa ditandai " + status);
    App.rerender();
  },

  exportCsv() {
    const semua = Store.get("absen");
    if (semua.length === 0) return Utils.toast("Belum ada data absen", "error");
    const baris = [["Tanggal", "Nama", "Status", "Keterangan"]];
    [...semuaAbsen_sorted(semua)].forEach((a) => {
      const s = Store.find("siswa", a.siswaId);
      baris.push([a.tanggal, s?.nama || "", a.status, a.keterangan || ""]);
    });
    App.downloadCsv("absen.csv", baris);
  },
};

/* helper kecil untuk sort */
function semuaAbsen_sorted(list) {
  return [...list].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}
