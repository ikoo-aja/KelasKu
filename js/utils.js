/* ===== KelasKu — utilitas umum ===== */
const Utils = {
  /* ID unik sederhana */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  /* Hash SHA-256 (untuk password) — async */
  async sha256(text) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    /* fallback sederhana (file:// di browser lama) */
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = (h << 5) - h + text.charCodeAt(i);
      h |= 0;
    }
    return "fb" + Math.abs(h).toString(16);
  },

  /* Format tanggal: 2026-09-08 -> 08 Sep 2026 */
  formatTanggal(iso) {
    if (!iso) return "-";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  },

  /* Format rupiah: 150000 -> Rp150.000 */
  formatRupiah(angka) {
    return "Rp" + Number(angka || 0).toLocaleString("id-ID");
  },

  /* Escape HTML biar aman dari input user */
  escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  },

  /* Nama hari dari tanggal ISO */
  namaHari(iso) {
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? "-" : hari[d.getDay()];
  },

  /* Hari ini dalam format YYYY-MM-DD (waktu lokal, bukan UTC biar gak salah tanggal di WIB pagi) */
  hariIni() {
    const d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  },

  /* Tanggal ISO -> format panjang Indonesia: Selasa, 8 September 2026 */
  tanggalPanjang(iso) {
    const d = iso ? new Date(iso + "T00:00:00") : new Date();
    if (isNaN(d)) return "-";
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  },

  /* Timestamp ISO -> waktu Indonesia: 8 Sep 2026, 14.30 */
  formatWaktu(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  },

  /* Toast notifikasi */
  toast(pesan, tipe = "success") {
    const el = document.createElement("div");
    el.className = "toast toast-" + tipe;
    el.textContent = pesan;
    document.getElementById("toastRoot").appendChild(el);
    setTimeout(() => el.remove(), 3000);
  },

  /* Unduh teks (TXT) sebagai file — dipakai modul PR & ekspor lainnya */
  unduhTeks(namaFile, isi) {
    const blob = new Blob([isi], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = namaFile;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  /* Modal sederhana: buka dengan HTML, tutup via tombol */
  bukaModal(html) {
    document.getElementById("modalBox").innerHTML = html;
    document.getElementById("modalRoot").classList.remove("hidden");
  },
  tutupModal() {
    document.getElementById("modalRoot").classList.add("hidden");
    document.getElementById("modalBox").innerHTML = "";
    Utils._konfirmasiCb = null;
  },

  /* Dialog konfirmasi custom (pengganti window.confirm — tanpa dialog bawaan browser) */
  konfirmasi(opts) {
    const {
      pesan,
      judul = "Konfirmasi",
      tombolYa = "Ya",
      tombolBatal = "Batal",
      tipe = "default", /* "default" | "danger" */
      onYa,
      onBatal,
    } = opts || {};
    const icon = tipe === "danger" ? "fa-trash-can" : "fa-triangle-exclamation";
    const btnYa = tipe === "danger" ? "btn-danger" : "btn-primary";
    Utils.bukaModal(`
      <div class="modal-konfirmasi">
        <div class="modal-konfirmasi-icon ${tipe === "danger" ? "modal-konfirmasi-icon-danger" : ""}">
          <i class="fa-solid ${icon}"></i>
        </div>
        <h3>${Utils.escapeHtml(judul)}</h3>
        <p style="font-size:14px;line-height:1.55;margin:0">${pesan}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="Utils.prosesKonfirmasi(false)">${Utils.escapeHtml(tombolBatal)}</button>
          <button type="button" class="btn ${btnYa}" onclick="Utils.prosesKonfirmasi(true)">${Utils.escapeHtml(tombolYa)}</button>
        </div>
      </div>
    `);
    Utils._konfirmasiCb = { onYa, onBatal };
  },

  prosesKonfirmasi(ya) {
    const cb = Utils._konfirmasiCb || {};
    Utils.tutupModal();
    if (ya) cb.onYa && cb.onYa();
    else cb.onBatal && cb.onBatal();
  },

  /* ===== Tema terang / gelap ===== */
  tema: {
    key: "kelas_theme",

    mode() {
      return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    },

    terapkan(mode, simpan = true) {
      document.documentElement.setAttribute("data-theme", mode);
      if (simpan) {
        try {
          localStorage.setItem(this.key, mode);
        } catch (e) {}
      }
      this.syncIcons();
    },

    toggle() {
      this.terapkan(this.mode() === "dark" ? "light" : "dark");
    },

    /* Sinkronkan ikon matahari/bulan di semua tombol toggle */
    syncIcons() {
      const gelap = this.mode() === "dark";
      document.querySelectorAll("[data-tema-toggle]").forEach((btn) => {
        const icon = btn.querySelector("i");
        if (icon) icon.className = "fa-solid " + (gelap ? "fa-sun" : "fa-moon");
        btn.title = gelap ? "Mode terang" : "Mode gelap";
      });
    },

    init() {
      document.querySelectorAll("[data-tema-toggle]").forEach((btn) =>
        btn.addEventListener("click", () => Utils.tema.toggle())
      );
      this.syncIcons();
    },
  },
};

/* Tutup modal kalau klik backdrop — konfirmasi yang terbuka dianggap dibatalkan */
document.getElementById("modalBackdrop")?.addEventListener("click", () => {
  if (Utils._konfirmasiCb) Utils.prosesKonfirmasi(false);
  else Utils.tutupModal();
});

document.addEventListener("DOMContentLoaded", () => Utils.tema.init());
