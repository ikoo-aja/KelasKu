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
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" onclick="PrPage.formEkspor()"><i class="fa-solid fa-file-export"></i> Ekspor</button>
          <button class="btn btn-secondary btn-sm" onclick="PrPage.formImpor()"><i class="fa-solid fa-file-import"></i> Impor Cepat</button>
          <button class="btn btn-primary btn-sm" onclick="PrPage.formTambah()">+ Tambah PR</button>
        </div>
      </div>
      <p class="text-muted" style="font-size:13px;margin-bottom:14px">
        Ini daftar tugas milikmu sendiri. Tugas dari akun lain bisa dilihat di menu
        <strong>Pengingat Tugas</strong>. Punya catatan banyak? Pakai
        <strong>Impor Cepat</strong> — tempel saja, satu baris jadi satu tugas.
      </p>
      ${
        mapel.length === 0
          ? '<div class="card"><p class="text-muted">Tambahkan mata pelajaran dulu di menu Mata Pelajaran, lalu buat PR-nya.</p></div>'
          : pr.length === 0
          ? '<div class="card"><p class="text-muted">Belum ada PR-mu. Klik "+ Tambah PR" untuk satu tugas, atau <strong>Impor Cepat</strong> untuk menempel banyak catatan sekaligus.</p></div>'
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
            ${
              p.bagikan !== false
                ? '<div class="pr-share-tag" title="Tampil di halaman Pengingat Tugas akun lain"><i class="fa-solid fa-bell"></i> Dibagikan ke Pengingat</div>'
                : '<div class="pr-share-tag pr-share-off"><i class="fa-solid fa-lock"></i> Pribadi</div>'
            }
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
        <label class="switch-field">
          <span class="switch">
            <input type="checkbox" name="bagikan" ${pr?.bagikan === false ? "" : "checked"} />
            <span class="switch-track"><span class="switch-thumb"></span></span>
          </span>
          <span class="switch-info">
            <strong>Bagikan sebagai pengingat</strong>
            <span>Tugas ini tampil di halaman <b>Pengingat Tugas</b> akun lain. Matikan kalau ingin disimpan pribadi saja.</span>
          </span>
        </label>
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
        bagikan: fd.get("bagikan") === "on",
      };
      if (pr) {
        Store.update("pr", pr.id, data);
        Utils.toast("PR diperbarui");
      } else {
        Store.add("pr", data);
        Utils.toast(
          data.bagikan
            ? "PR ditambahkan & dibagikan ke Pengingat Tugas"
            : "PR ditambahkan (pribadi)"
        );
      }
      Utils.tutupModal();
      App.rerender();
    };
  },

  /* ===== Ekspor PR & tugas (format sama persis dengan Impor Cepat) ===== */
  formEkspor() {
    const me = Auth.user();
    const jumlahSaya = Store.get("pr").filter((p) => p.pembuat === me.id).length;
    const jumlahSemua = this.daftarEkspor("semua").length;
    Utils.bukaModal(`
      <h3><i class="fa-solid fa-file-export"></i> Ekspor PR &amp; Tugas</h3>
      <p class="text-muted" style="font-size:12.5px;margin:-4px 0 12px">
        Hasil ekspor berformat sama dengan <strong>Impor Cepat</strong>, jadi bisa ditempel balik kapan saja
        (satu baris = satu tugas, tugas yang sudah selesai ditandai <code>[x]</code>).
      </p>
      <div class="form-group">
        <label>Data yang diekspor</label>
        <select id="eksporLingkup">
          <option value="saya">Tugas saya saja (${jumlahSaya})</option>
          <option value="semua">Tugas saya + pengingat dari akun lain (${jumlahSemua})</option>
        </select>
      </div>
      <p class="form-hint">
        <strong>TXT</strong> — untuk arsip &amp; ditempel balik ke Impor Cepat.
        <strong>CSV</strong> — untuk Excel (judul, mapel, tenggat, deskripsi, status).
      </p>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="Utils.tutupModal()">Batal</button>
        <button type="button" class="btn btn-secondary" onclick="PrPage.unduhEkspor('csv')"><i class="fa-solid fa-file-csv"></i> Unduh CSV</button>
        <button type="button" class="btn btn-primary" onclick="PrPage.unduhEkspor('txt')"><i class="fa-solid fa-file-lines"></i> Unduh TXT</button>
      </div>
    `);
  },

  /* Daftar tugas yang akan diekspor. "semua" = milik sendiri + tugas yang
     dibagikan akun lain (tugas pribadi akun lain tetap tidak ikut). */
  daftarEkspor(lingkup) {
    const me = Auth.user();
    const semua = Store.get("pr");
    const pilih =
      lingkup === "semua"
        ? semua.filter((p) => p.pembuat === me.id || p.bagikan !== false)
        : semua.filter((p) => p.pembuat === me.id);
    return [...pilih].sort((a, b) => {
      if (a.status !== b.status) return a.status === "selesai" ? 1 : -1;
      return (a.tenggat || "").localeCompare(b.tenggat || "");
    });
  },

  /* Satu tugas -> satu baris format Impor Cepat: Judul | Mapel | Tenggat | Deskripsi */
  barisEkspor(p) {
    const mapel = Store.find("pelajaran", p.mapelId)?.namaMapel || "";
    const kolom = [p.judul, mapel, p.tenggat, p.deskripsi].filter(
      (x) => String(x ?? "").trim() !== ""
    );
    return (p.status === "selesai" ? "[x] " : "") + kolom.join(" | ");
  },

  unduhEkspor(format) {
    const lingkup = document.getElementById("eksporLingkup")?.value || "saya";
    const daftar = this.daftarEkspor(lingkup);
    if (daftar.length === 0) return Utils.toast("Belum ada tugas untuk diekspor", "error");
    const namaFile = "pr-tugas-" + Utils.hariIni() + (format === "csv" ? ".csv" : ".txt");

    if (format === "csv") {
      const baris = [["Judul", "Mapel", "Tenggat", "Deskripsi", "Status"]];
      daftar.forEach((p) =>
        baris.push([
          p.judul,
          Store.find("pelajaran", p.mapelId)?.namaMapel || "",
          p.tenggat || "",
          p.deskripsi || "",
          p.status === "selesai" ? "Selesai" : "Belum",
        ])
      );
      App.downloadCsv(namaFile, baris);
    } else {
      this.unduhTeks(
        namaFile,
        daftar.map((p) => this.barisEkspor(p)).join("\r\n") + "\r\n"
      );
    }

    Utils.tutupModal();
    Utils.toast(daftar.length + " tugas diekspor ke " + format.toUpperCase());
  },

  unduhTeks(namaFile, isi) {
    Utils.unduhTeks(namaFile, isi);
  },

  /* ===== Impor cepat: tempel banyak tugas sekaligus (1 baris = 1 tugas) ===== */
  formImpor() {
    const mapel = Store.get("pelajaran");
    if (mapel.length === 0) {
      return Utils.toast("Tambahkan mata pelajaran dulu di menu Mata Pelajaran", "error");
    }
    const iso = (d) =>
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");
    const t7 = new Date();
    t7.setDate(t7.getDate() + 7);

    Utils.bukaModal(`
      <h3><i class="fa-solid fa-file-import"></i> Impor Cepat PR &amp; Tugas</h3>
      <p class="text-muted" style="font-size:12.5px;margin:-4px 0 12px">
        Tempel catatanmu — <strong>satu baris = satu tugas</strong>.
        Format: <code>Judul</code> · <code>Judul | Mapel</code> · <code>Judul | Mapel | Tenggat | Deskripsi</code>
        (mapel, tenggat, &amp; deskripsi opsional — tenggat bebas: <code>25/09/2026</code>, <code>2026-09-25</code>, <code>25 Sep 2026</code>).
      </p>
      <form id="formImpor">
        <div class="form-group">
          <label>Daftar tugas</label>
          <textarea class="impor-area" name="daftar" rows="9" placeholder="Latihan soal hal 20 | Matematika | 25/09/2026&#10;Rangkum bab 3 Database&#10;- Kumpulkan video PKK | PKK | 30 Sep&#10;Kirim link tugas ke grup | Web + Aplikasi | 28/09/2026 | jangan lupa lampirkan link GitHub"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Mapel untuk baris tanpa mapel</label>
            <select name="mapelId">
              ${mapel.map((m) => `<option value="${m.id}">${Utils.escapeHtml(m.namaMapel)}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Tenggat untuk baris tanpa tenggat</label>
            <input type="date" name="tenggat" value="${iso(t7)}" />
          </div>
        </div>
        <label class="switch-field">
          <span class="switch">
            <input type="checkbox" name="bagikan" checked />
            <span class="switch-track"><span class="switch-thumb"></span></span>
          </span>
          <span class="switch-info">
            <strong>Bagikan semua sebagai pengingat</strong>
            <span>Tugas hasil impor tampil di halaman <b>Pengingat Tugas</b> akun lain. Matikan kalau ingin pribadi.</span>
          </span>
        </label>
        <p class="form-hint" id="imporInfo"><i class="fa-solid fa-circle-info"></i> Tempel daftar tugas di atas…</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Utils.tutupModal()">Batal</button>
          <button type="submit" class="btn btn-primary" id="imporSimpan" disabled>
            <i class="fa-solid fa-file-import"></i> Impor Tugas
          </button>
        </div>
      </form>
    `);

    const form = document.getElementById("formImpor");
    const area = form.querySelector('[name="daftar"]');
    const info = document.getElementById("imporInfo");
    const tombol = document.getElementById("imporSimpan");

    const pratinjau = () => {
      const { tugas, takDikenal, dilewati } = this.parseImpor(area.value);
      if (tugas.length === 0) {
        info.innerHTML = '<i class="fa-solid fa-circle-info"></i> Tempel daftar tugas di atas…';
        tombol.disabled = true;
        tombol.innerHTML = '<i class="fa-solid fa-file-import"></i> Impor Tugas';
        return;
      }
      const mapelDikenal = tugas.filter((t) => t.mapelId).length;
      const berdeskripsi = tugas.filter((t) => t.deskripsi).length;
      info.innerHTML =
        `<i class="fa-solid fa-circle-check" style="color:var(--success)"></i> <strong>${tugas.length}</strong> tugas siap diimpor ` +
        `<span style="color:var(--text-soft)">(${mapelDikenal} mapel dikenali` +
        (takDikenal.length ? `, ${takDikenal.length} pakai mapel default` : "") +
        (berdeskripsi ? `, ${berdeskripsi} berdeskripsi` : "") +
        (dilewati ? `, ${dilewati} baris dilewati` : "") +
        ")</span>";
      tombol.disabled = false;
      tombol.innerHTML = '<i class="fa-solid fa-file-import"></i> Impor ' + tugas.length + " Tugas";
    };

    area.addEventListener("input", pratinjau);
    pratinjau();

    form.onsubmit = (e) => {
      e.preventDefault();
      const { tugas } = this.parseImpor(area.value);
      if (tugas.length === 0) return Utils.toast("Belum ada tugas untuk diimpor", "error");
      const bagikan = form.querySelector('[name="bagikan"]').checked;
      const mapelDefault = form.querySelector('[name="mapelId"]').value;
      const tenggatDefault = form.querySelector('[name="tenggat"]').value || Utils.hariIni();
      const pembuat = Auth.user()?.id;
      tugas.forEach((t) =>
        Store.add("pr", {
          mapelId: t.mapelId || mapelDefault,
          judul: t.judul,
          deskripsi: t.deskripsi || "",
          tenggat: t.tenggat || tenggatDefault,
          status: t.status || "belum",
          pembuat,
          bagikan,
        })
      );
      Utils.tutupModal();
      Utils.toast(
        tugas.length + " tugas berhasil diimpor" + (bagikan ? " & dibagikan ke Pengingat" : " (pribadi)")
      );
      App.rerender();
    };
  },

  /* Baca teks tempelan jadi daftar tugas.
     Tiap baris: Judul | Mapel | Tenggat | Deskripsi (kolom 2–4 opsional & fleksibel),
     boleh diawali penanda status [x] / [selesai] untuk tugas yang sudah selesai. */
  parseImpor(teks) {
    const mapel = Store.get("pelajaran");
    const MAKS = 200;
    const cariMapel = (nama) => {
      const n = String(nama).trim().toLowerCase();
      if (!n) return null;
      return (
        mapel.find((m) => m.namaMapel.toLowerCase() === n) ||
        mapel.find((m) => m.namaMapel.toLowerCase().startsWith(n)) ||
        mapel.find((m) => m.namaMapel.toLowerCase().includes(n)) ||
        null
      );
    };
    const tugas = [];
    const takDikenal = [];
    let dilewati = 0;

    String(teks || "")
      .split(/\r?\n/)
      .forEach((baris) => {
        /* buang bullet / penomoran di awal baris */
        let bersih = baris.replace(/^\s*(?:[-*•·]|\d+[.)])\s*/, "").trim();
        if (!bersih) return;
        /* penanda status hasil ekspor: [x] / [selesai] / [ ] / [belum] */
        let status = "belum";
        const tanda = bersih.match(/^\[(x|selesai|belum|\s*)\]\s*/i);
        if (tanda) {
          status = /^(x|selesai)$/i.test(tanda[1].trim()) ? "selesai" : "belum";
          bersih = bersih.slice(tanda[0].length).trim();
        }
        if (!bersih) return;
        if (tugas.length >= MAKS) {
          dilewati++;
          return;
        }
        /* kolom dipisah pipe atau tab */
        const kolom = bersih.split(/\s*[|\t]\s*/).map((s) => s.trim()).filter(Boolean);
        const judul = kolom[0] || "";
        if (!judul) return;
        /* Kolom 2–4 dibaca pintar: berbentuk tanggal -> tenggat; teks yang cocok
           nama mapel -> mapel; sisanya -> deskripsi. Teks yang belum dikenal dan
           muncul sebelum ada tanggal tetap dianggap mapel, biar salah tulis nama
           mapel tetap kelihatan & bisa dikoreksi. */
        let mapelNama = "";
        let tenggat = "";
        const desk = [];
        kolom.slice(1).forEach((x) => {
          const tgl = this.normalisasiTanggal(x);
          if (tgl) {
            if (!tenggat) tenggat = tgl;
            else desk.push(x);
            return;
          }
          if (!mapelNama && (cariMapel(x) || !tenggat)) {
            mapelNama = x;
            return;
          }
          desk.push(x);
        });
        const deskripsi = desk.join(" | ");
        const ketemu = mapelNama ? cariMapel(mapelNama) : null;
        if (mapelNama && !ketemu) takDikenal.push(mapelNama);
        tugas.push({ judul, mapelId: ketemu ? ketemu.id : "", tenggat, deskripsi, status, mapelNama });
      });

    return { tugas, takDikenal, dilewati };
  },

  /* Normalisasi tenggat jadi YYYY-MM-DD (dukung 25/09/2026, 2026-09-25, 25 Sep 2026) */
  normalisasiTanggal(teks) {
    const t = String(teks || "").trim();
    if (!t) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const p = t.match(/^(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?$/);
    if (p) {
      const th = p[3] ? (p[3].length === 2 ? "20" + p[3] : p[3]) : String(new Date().getFullYear());
      return th + "-" + String(p[2]).padStart(2, "0") + "-" + String(p[1]).padStart(2, "0");
    }
    const b = t.match(/^(\d{1,2})\s+([A-Za-z]+)\.?\s*(\d{4})?$/);
    if (b) {
      const bulan = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des"];
      const idx = bulan.indexOf(b[2].slice(0, 3).toLowerCase());
      if (idx >= 0) {
        const th = b[3] || String(new Date().getFullYear());
        return th + "-" + String(idx + 1).padStart(2, "0") + "-" + String(b[1]).padStart(2, "0");
      }
    }
    return "";
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