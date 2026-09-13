/* ===== KelasKu — modul pengingat tugas (read-only) =====
   Menampilkan PR & tugas milik akun lain yang MEMILIH untuk dibagikan
   sebagai pengingat (field bagikan). Tidak ada tombol aksi di halaman ini. */
const PengingatPage = {
  render() {
    const me = Auth.user();
    const pr = Store.get("pr").filter(
      (p) => p.pembuat && p.pembuat !== me.id && p.bagikan !== false
    );
    const hariIni = Utils.hariIni();

    const namaMapel = (id) => Store.find("pelajaran", id)?.namaMapel || "(mapel dihapus)";
    const namaUser = (id) => Store.find("users", id)?.nama || "(akun dihapus)";

    /* urutkan: yang belum selesai & paling dekat tenggat di atas */
    const urut = [...pr].sort((a, b) => {
      if (a.status !== b.status) return a.status === "selesai" ? 1 : -1;
      return (a.tenggat || "").localeCompare(b.tenggat || "");
    });

    return `
      <div class="section-head">
        <h3><i class="fa-solid fa-bell"></i> Pengingat Tugas (${pr.length})</h3>
      </div>
      <p class="text-muted" style="font-size:13.5px;margin-bottom:14px">
        Tugas yang dibagikan oleh akun lain tampil di sini — biar saling ingat ada tugas.
        Halaman ini hanya untuk dilihat.
      </p>
      ${
        urut.length === 0
          ? '<div class="card"><p class="text-muted">Belum ada pengingat tugas dari akun lain. Tugas yang dibagikan akan muncul di sini.</p></div>'
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
            <div class="pr-meta" style="margin-top:8px;color:var(--primary)">
              <i class="fa-solid fa-user"></i> Dibuat oleh ${Utils.escapeHtml(namaUser(p.pembuat))}
            </div>
          </div>`;
          })
          .join("")}
      </div>`
      }
    `;
  },
};