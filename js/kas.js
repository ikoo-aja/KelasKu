/* ===== KelasKu — modul kas kelas =====
   Kas mingguan semester 1 (2025): Rp5.000/minggu, 22 minggu = Rp110.000/siswa.
   Data dari file UANG KAS XII RPL 1.xlsx. */
const TAGIHAN_PER_MINGGU = 5000;
const MINGGU_SEMESTER = [
  ["Juli", 3], ["Juli", 4],
  ["Agustus", 1], ["Agustus", 2], ["Agustus", 3], ["Agustus", 4],
  ["September", 1], ["September", 2], ["September", 3], ["September", 4],
  ["Oktober", 1], ["Oktober", 2], ["Oktober", 3], ["Oktober", 4],
  ["November", 1], ["November", 2], ["November", 3], ["November", 4],
  ["Desember", 1], ["Desember", 2], ["Desember", 3], ["Desember", 4],
];
const TOTAL_TAGIHAN = MINGGU_SEMESTER.length * TAGIHAN_PER_MINGGU; // 110.000
const mingguKey = (bulan, ke) => "2025-" + bulan + "-" + ke;
const labelMinggu = (key) => {
  const [, bulan, ke] = (key || "").split("-");
  return bulan ? "Minggu " + ke + " " + bulan : key;
};

const KasPage = {
  render() {
    const bisaEdit = Auth.boleh("kas") === "edit";
    const masuk = Store.get("kasMasuk");
    const keluar = Store.get("kasKeluar");
    const siswa = Store.get("siswa");

    const totalMasuk = masuk.reduce((sum, t) => sum + Number(t.jumlah || 0), 0);
    const totalKeluar = keluar.reduce((sum, t) => sum + Number(t.jumlah || 0), 0);
    const saldo = totalMasuk - totalKeluar;

    /* Kas personal: kas mingguan semester 1 (Rp5.000/minggu x 22 minggu) */
    const mingguan = Store.get("kasMingguan");
    const dibayarOleh = {};
    mingguan.forEach((m) => {
      if (m.status === "lunas" || m.status === "sebagian") {
        dibayarOleh[m.siswaId] = (dibayarOleh[m.siswaId] || 0) + Number(m.nominal || 0);
      }
    });
    const kasPersonal = siswa.map((s) => {
      const dibayar = dibayarOleh[s.id] || 0;
      return { siswa: s, dibayar, sisa: TOTAL_TAGIHAN - dibayar };
    });

    return `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-coins"></i></div><div class="stat-value text-success">${Utils.formatRupiah(totalMasuk)}</div><div class="stat-label">Total Masuk</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-money-bill-wave"></i></div><div class="stat-value text-danger">${Utils.formatRupiah(totalKeluar)}</div><div class="stat-label">Total Keluar</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fa-solid fa-building-columns"></i></div><div class="stat-value">${Utils.formatRupiah(saldo)}</div><div class="stat-label">Saldo Kas</div></div>
      </div>

      <div class="section-head">
        <h3>Transaksi Kas</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-sm btn-secondary" onclick="KasPage.formEkspor()"><i class="fa-solid fa-file-export"></i> Ekspor</button>
          ${
            bisaEdit
              ? `<button class="btn btn-primary btn-sm" onclick="KasPage.formTransaksi('masuk')">+ Kas Masuk</button>
          <button class="btn btn-danger btn-sm" onclick="KasPage.formTransaksi('keluar')">+ Kas Keluar</button>`
              : ""
          }
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tanggal</th><th>Jenis</th><th>Deskripsi</th><th>Jumlah</th>${bisaEdit ? "<th>Aksi</th>" : ""}</tr></thead>
          <tbody>
            ${
              [...masuk.map((t) => ({ ...t, _jenis: "masuk" })),
               ...keluar.map((t) => ({ ...t, _jenis: "keluar" }))]
                .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
                .map(
                  (t) => `
              <tr>
                <td>${Utils.formatTanggal(t.tanggal)}</td>
                <td>${t._jenis === "masuk" ? '<span class="text-success">Masuk</span>' : '<span class="text-danger">Keluar</span>'}</td>
                <td>${Utils.escapeHtml(t.deskripsi)}</td>
                <td class="${t._jenis === "masuk" ? "text-success" : "text-danger"}">${Utils.formatRupiah(t.jumlah)}</td>
                ${bisaEdit ? `<td><button class="btn btn-sm btn-danger" onclick="KasPage.hapusTransaksi('${t._jenis}', '${t.id}')">Hapus</button></td>` : ""}
              </tr>`
                )
                .join("") ||
              '<tr><td colspan="' + (bisaEdit ? 5 : 4) + '" class="empty-row">Belum ada transaksi.</td></tr>'
            }
          </tbody>
        </table>
      </div>

      <div class="card mt-16">
        <div class="section-head">
          <h3>Kas Personal Siswa</h3>
          ${bisaEdit ? '<button class="btn btn-sm btn-secondary" onclick="KasPage.formBayar()">+ Catat Pembayaran</button>' : ""}
        </div>
        <p class="text-muted" style="font-size:13px;margin-bottom:10px">
          Tagihan kas: <strong>${Utils.formatRupiah(TAGIHAN_PER_MINGGU)}/minggu</strong> · Semester 1 (${MINGGU_SEMESTER.length} minggu × ${Utils.formatRupiah(TAGIHAN_PER_MINGGU)} = ${Utils.formatRupiah(TOTAL_TAGIHAN)})
        </p>
        <div class="table-wrap" style="box-shadow:none">
          <table>
            <thead><tr><th>Siswa</th><th>Dibayar</th><th>Sisa</th><th>Status</th></tr></thead>
            <tbody>
              ${
                kasPersonal.length === 0
                  ? '<tr><td colspan="4" class="empty-row">Belum ada siswa.</td></tr>'
                  : kasPersonal
                      .sort((a, b) => b.sisa - a.sisa)
                      .map(
                        (k) => `
                <tr>
                  <td><strong>${Utils.escapeHtml(k.siswa.nama)}</strong></td>
                  <td>${Utils.formatRupiah(k.dibayar)}</td>
                  <td class="${k.sisa > 0 ? "text-danger" : "text-success"}">${Utils.formatRupiah(k.sisa)}</td>
                  <td>${
                    k.sisa <= 0
                      ? '<span class="badge badge-lunas">Lunas</span>'
                      : '<span class="badge badge-belum">Belum Lunas</span>'
                  }</td>
                </tr>`
                      )
                      .join("")
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="card mt-16">
        <div class="section-head">
          <h3><i class="fa-solid fa-calendar-week"></i> Rekap Kas Mingguan — Semester 1 (2025)</h3>
        </div>
        <div class="table-wrap" style="box-shadow:none">
          <table class="kas-matrix">
            <thead>
              <tr>
                <th>Siswa</th>
                ${MINGGU_SEMESTER.map(([b, k]) => `<th title="${b} minggu ${k}">${b.slice(0, 3)} ${k}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${
                siswa.length === 0
                  ? '<tr><td colspan="23" class="empty-row">Belum ada siswa.</td></tr>'
                  : siswa
                      .map((s) => {
                        const cell = {};
                        mingguan
                          .filter((m) => m.siswaId === s.id)
                          .forEach((m) => (cell[m.minggu] = m));
                        return `
                <tr>
                  <td><strong>${Utils.escapeHtml(s.nama)}</strong></td>
                  ${MINGGU_SEMESTER.map(([b, k]) => {
                    const rec = cell[mingguKey(b, k)];
                    if (!rec || rec.status === "kosong")
                      return '<td class="kas-cell"><span class="kas-dot kas-kosong" title="belum tercatat">—</span></td>';
                    if (rec.status === "lunas")
                      return '<td class="kas-cell"><span class="kas-dot kas-lunas" title="lunas 5rb"><i class="fa-solid fa-check"></i></span></td>';
                    if (rec.status === "sebagian")
                      return `<td class="kas-cell"><span class="kas-partial" title="bayar sebagian">${Utils.formatRupiah(rec.nominal).replace("Rp", "")}</span></td>`;
                    return '<td class="kas-cell"><span class="kas-dot kas-belum" title="belum bayar"><i class="fa-solid fa-xmark"></i></span></td>';
                  }).join("")}
                </tr>`;
                      })
                      .join("")
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ===== Ekspor data kas (gaya seragam dengan ekspor PR & absen) ===== */
  formEkspor() {
    Utils.bukaModal(`
      <h3><i class="fa-solid fa-file-export"></i> Ekspor Data Kas</h3>
      <p class="text-muted" style="font-size:12.5px;margin:-4px 0 12px">
        Pilih data yang mau diunduh — hasilnya berkas CSV siap dibuka di Excel.
      </p>
      <div class="form-group">
        <label>Jenis data</label>
        <select id="kasEksporJenis" onchange="KasPage.gantiJenisEkspor()">
          <option value="transaksi">Transaksi kas (masuk &amp; keluar)</option>
          <option value="personal">Rekap kas per siswa</option>
          <option value="mingguan">Rekap kas mingguan (matriks)</option>
        </select>
      </div>
      <p class="form-hint" id="kasEksporInfo"></p>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="Utils.tutupModal()">Batal</button>
        <button type="button" class="btn btn-primary" onclick="KasPage.unduhEkspor()"><i class="fa-solid fa-file-csv"></i> Unduh CSV</button>
      </div>
    `);
    this.gantiJenisEkspor();
  },

  gantiJenisEkspor() {
    const jenis = document.getElementById("kasEksporJenis")?.value || "transaksi";
    const info = document.getElementById("kasEksporInfo");
    if (!info) return;
    info.textContent =
      jenis === "transaksi"
        ? "Semua kas masuk & keluar beserta total dan saldo akhir."
        : jenis === "personal"
        ? "Jumlah yang sudah dibayar & sisa tagihan tiap siswa."
        : "Status pembayaran tiap siswa per minggu, seperti tabel matriks mingguan.";
  },

  unduhEkspor() {
    const jenis = document.getElementById("kasEksporJenis")?.value || "transaksi";
    if (jenis === "transaksi") this.exportTransaksiCsv();
    else if (jenis === "personal") this.exportPersonalCsv();
    else this.exportMingguanCsv();
  },

  exportTransaksiCsv() {
    const semua = [
      ...Store.get("kasMasuk").map((t) => ({ ...t, _jenis: "Masuk" })),
      ...Store.get("kasKeluar").map((t) => ({ ...t, _jenis: "Keluar" })),
    ].sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));
    if (semua.length === 0) return Utils.toast("Belum ada transaksi kas", "error");

    const totalMasuk = semua
      .filter((t) => t._jenis === "Masuk")
      .reduce((s, t) => s + Number(t.jumlah || 0), 0);
    const totalKeluar = semua
      .filter((t) => t._jenis === "Keluar")
      .reduce((s, t) => s + Number(t.jumlah || 0), 0);

    const baris = [["Tanggal", "Hari", "Jenis", "Deskripsi", "Jumlah"]];
    semua.forEach((t) =>
      baris.push([
        t.tanggal || "",
        t.tanggal ? Utils.namaHari(t.tanggal) : "",
        t._jenis,
        t.deskripsi || "",
        Number(t.jumlah || 0),
      ])
    );
    baris.push(["", "", "TOTAL MASUK", "", totalMasuk]);
    baris.push(["", "", "TOTAL KELUAR", "", totalKeluar]);
    baris.push(["", "", "SALDO AKHIR", "", totalMasuk - totalKeluar]);

    Utils.tutupModal();
    App.downloadCsv("kas-transaksi-" + Utils.hariIni() + ".csv", baris);
    Utils.toast(semua.length + " transaksi diekspor ke CSV");
  },

  exportPersonalCsv() {
    const siswa = Store.get("siswa");
    if (siswa.length === 0) return Utils.toast("Belum ada data siswa", "error");
    const dibayarOleh = {};
    Store.get("kasMingguan").forEach((m) => {
      if (m.status === "lunas" || m.status === "sebagian") {
        dibayarOleh[m.siswaId] = (dibayarOleh[m.siswaId] || 0) + Number(m.nominal || 0);
      }
    });
    const urut = siswa
      .map((s) => {
        const dibayar = dibayarOleh[s.id] || 0;
        return { s, dibayar, sisa: TOTAL_TAGIHAN - dibayar };
      })
      .sort((a, b) => b.sisa - a.sisa);

    const baris = [["Nama", "NIS", "Dibayar", "Sisa", "Status"]];
    urut.forEach((r) =>
      baris.push([
        r.s.nama,
        r.s.nis || "",
        r.dibayar,
        r.sisa,
        r.sisa <= 0 ? "Lunas" : "Belum Lunas",
      ])
    );
    baris.push([
      "TOTAL",
      "",
      urut.reduce((s, r) => s + r.dibayar, 0),
      urut.reduce((s, r) => s + r.sisa, 0),
      "",
    ]);

    Utils.tutupModal();
    App.downloadCsv("kas-per-siswa-" + Utils.hariIni() + ".csv", baris);
    Utils.toast(siswa.length + " baris rekap kas diekspor ke CSV");
  },

  exportMingguanCsv() {
    const siswa = Store.get("siswa");
    const mingguan = Store.get("kasMingguan");
    if (siswa.length === 0 || mingguan.length === 0) {
      return Utils.toast("Belum ada data kas mingguan", "error");
    }

    const baris = [
      [
        "Nama",
        "NIS",
        ...MINGGU_SEMESTER.map(([b, k]) => "Minggu " + k + " " + b),
        "Dibayar",
        "Sisa",
      ],
    ];
    siswa.forEach((s) => {
      const cell = {};
      mingguan.filter((m) => m.siswaId === s.id).forEach((m) => (cell[m.minggu] = m));
      let dibayar = 0;
      const kolom = MINGGU_SEMESTER.map(([b, k]) => {
        const rec = cell[mingguKey(b, k)];
        if (!rec || rec.status === "kosong") return "-";
        if (rec.status === "lunas") {
          dibayar += Number(rec.nominal || 0);
          return "Lunas";
        }
        if (rec.status === "sebagian") {
          dibayar += Number(rec.nominal || 0);
          return "Sebagian " + Number(rec.nominal || 0);
        }
        return "Belum";
      });
      baris.push([s.nama, s.nis || "", ...kolom, dibayar, TOTAL_TAGIHAN - dibayar]);
    });

    Utils.tutupModal();
    App.downloadCsv("kas-mingguan-semester-1-" + Utils.hariIni() + ".csv", baris);
    Utils.toast(siswa.length + " baris matriks kas diekspor ke CSV");
  },

  formTransaksi(jenis) {
    Utils.bukaModal(`
      <h3>${jenis === "masuk" ? "Kas Masuk" : "Kas Keluar"}</h3>
      <form id="formKas">
        <div class="form-group">
          <label>Deskripsi</label>
          <input name="deskripsi" required placeholder="${jenis === "masuk" ? "contoh: Kas bulan September" : "contoh: Beli tinta printer"}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Jumlah (Rp)</label>
            <input name="jumlah" type="number" min="1" required />
          </div>
          <div class="form-group">
            <label>Tanggal</label>
            <input name="tanggal" type="date" value="${Utils.hariIni()}" required />
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Utils.tutupModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    `);
    document.getElementById("formKas").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = {
        deskripsi: fd.get("deskripsi").trim(),
        jumlah: Number(fd.get("jumlah")),
        tanggal: fd.get("tanggal"),
        [jenis === "masuk" ? "sumber" : "tujuan"]: "kas kelas",
      };
      Store.add(jenis === "masuk" ? "kasMasuk" : "kasKeluar", data);
      Utils.tutupModal();
      Utils.toast("Transaksi disimpan");
      App.rerender();
    };
  },

  hapusTransaksi(jenis, id) {
    Utils.konfirmasi({
      judul: "Hapus Transaksi",
      pesan: "Hapus transaksi ini?",
      tipe: "danger",
      tombolYa: "Ya, Hapus",
      onYa: () => {
        Store.remove(jenis === "masuk" ? "kasMasuk" : "kasKeluar", id);
        Utils.toast("Transaksi dihapus");
        App.rerender();
      },
    });
  },

  formBayar() {
    const siswa = Store.get("siswa");
    if (siswa.length === 0) return Utils.toast("Tambahkan siswa dulu", "error");
    Utils.bukaModal(`
      <h3>Catat Pembayaran Kas</h3>
      <form id="formBayar">
        <div class="form-group">
          <label>Siswa</label>
          <select name="siswaId" required>
            ${siswa.map((s) => `<option value="${s.id}">${Utils.escapeHtml(s.nama)}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Minggu</label>
          <select name="minggu" required>
            ${MINGGU_SEMESTER.map(
              ([b, k]) => `<option value="${mingguKey(b, k)}">${labelMinggu(mingguKey(b, k))} 2025</option>`
            ).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Nominal (Rp)</label>
          <input name="nominal" type="number" min="1" value="5000" required />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Utils.tutupModal()">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
      </form>
    `);
    document.getElementById("formBayar").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const minggu = fd.get("minggu");
      const nominal = Number(fd.get("nominal"));
      const s = Store.find("siswa", fd.get("siswaId"));
      /* catat kas mingguan siswa (upsert per siswa+minggu) */
      const lama = Store.get("kasMingguan").filter(
        (m) => m.siswaId === fd.get("siswaId") && m.minggu === minggu
      );
      if (lama.length > 0) {
        Store.update("kasMingguan", lama[0].id, {
          nominal,
          status: nominal >= TAGIHAN_PER_MINGGU ? "lunas" : "sebagian",
          tanggalBayar: Utils.hariIni(),
        });
      } else {
        Store.add("kasMingguan", {
          siswaId: fd.get("siswaId"),
          minggu,
          nominal,
          status: nominal >= TAGIHAN_PER_MINGGU ? "lunas" : "sebagian",
          tanggalBayar: Utils.hariIni(),
        });
      }
      /* catat juga sebagai kas masuk biar saldo ikut bertambah */
      Store.add("kasMasuk", {
        deskripsi: `Kas ${s?.nama || "Siswa"} (${labelMinggu(minggu)})`,
        jumlah: nominal,
        tanggal: Utils.hariIni(),
        sumber: "pembayaran siswa",
      });
      Utils.tutupModal();
      Utils.toast("Pembayaran dicatat");
      App.rerender();
    };
  },
};
