/* ===== KelasKu — interaktivitas landing page ===== */
const Landing = {
  init() {
    this.revealOnScroll();
    this.rotasiKata();
    this.parallax();
    this.spotlightFitur();
    this.mobileMenu();
    this.muatData();
  },

  /* Tunggu seed selesai, lalu isi data live */
  muatData() {
    const cek = () => {
      if (localStorage.getItem("kelas_seeded") === "4") {
        try {
          this.isInfo();
          this.isChips();
          this.isMarquee();
          this.isStats();
        } catch (e) {
          console.error("Landing: gagal muat data", e);
        }
        return;
      }
      setTimeout(cek, 100);
    };
    setTimeout(cek, 100);
  },

  /* Info kelas & wali kelas di badge hero + badge login */
  isInfo() {
    const info = Store.get("info", {});
    const nama = Utils.escapeHtml(info.namaKelas || "Kelas XII RPL 1");
    const badge = document.querySelector(".lp-badge");
    if (badge) {
      badge.innerHTML =
        '<i class="fa-solid fa-school"></i> ' +
        nama +
        " · Wali: " +
        Utils.escapeHtml(info.waliKelas || "-");
    }
    const kelasLogin = document.getElementById("loginKelas");
    if (kelasLogin) {
      kelasLogin.innerHTML = '<i class="fa-solid fa-school"></i> ' + nama;
    }
    /* footer dinamis */
    const fKelas = document.getElementById("lpFooterKelas");
    if (fKelas) fKelas.textContent = info.namaKelas || "XII RPL 1";
    const fWali = document.getElementById("lpFooterWali");
    if (fWali) fWali.textContent = info.waliKelas || "-";
    const fSiswa = document.getElementById("lpFooterSiswa");
    if (fSiswa) fSiswa.textContent = Store.get("siswa").length;
  },

  /* Chip info di hero */
  isChips() {
    const siswa = Store.get("siswa");
    const mapel = Store.get("pelajaran");
    const info = Store.get("info", {});
    const chips = [
      { icon: "fa-users", teks: siswa.length + " Siswa" },
      { icon: "fa-book-open", teks: mapel.length + " Mapel" },
      { icon: "fa-user-tie", teks: info.waliKelas || "Wali Kelas" },
      { icon: "fa-trophy", teks: info.namaSingkat || "XII RPL 1" },
    ];
    document.getElementById("lpChips").innerHTML = chips
      .map((c) => `<span class="lp-chip"><i class="fa-solid ${c.icon}"></i> ${Utils.escapeHtml(c.teks)}</span>`)
      .join("");
  },

  /* Marquee mapel — diulang biar loop mulus */
  isMarquee() {
    const mapel = Store.get("pelajaran").map((m) => m.namaMapel);
    if (mapel.length === 0) return;
    const konten = [...mapel, ...mapel]
      .map((nama) => `<span>${Utils.escapeHtml(nama)}</span>`)
      .join("");
    document.getElementById("lpMarquee").innerHTML = konten;
  },

  /* Statistik + counter animasi */
  isStats() {
    const absen = Store.get("absen");
    const hariIni = Utils.hariIni();
    const hadir = absen.filter((a) => a.tanggal === hariIni && a.status === "hadir").length;

    const target = {
      siswa: Store.get("siswa").length,
      mapel: Store.get("pelajaran").length,
      hadir,
    };

    document.querySelectorAll("[data-counter]").forEach((el) => {
      el.dataset.akhir = target[el.dataset.counter] || 0;
    });
  },

  /* Animasi angka pas ke-scroll ke section statistik */
  revealOnScroll() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("visible");
          /* mulai counter sekali, khusus yang ada data-counter */
          if (en.target.querySelector("[data-counter]")) this.hitung(en.target);
          io.unobserve(en.target);
        });
      },
      { threshold: 0.25 }
    );
    document.querySelectorAll("#landingScreen .reveal").forEach((el) => io.observe(el));
  },

  hitung(scope) {
    scope.querySelectorAll("[data-counter]").forEach((el) => {
      const akhir = Number(el.dataset.akhir || 0);
      const durasi = 1100;
      const mulai = performance.now();
      const tick = (now) => {
        const t = Math.min((now - mulai) / durasi, 1);
        const eased = 1 - Math.pow(1 - t, 3); /* ease-out */
        el.textContent = Math.round(akhir * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },

  /* Rotasi kata di hero: kas → absen → PR → jadwal → tugas */
  rotasiKata() {
    const el = document.getElementById("lpRot");
    if (!el) return;
    const kata = ["kas", "absen", "PR", "jadwal", "tugas"];
    let i = 0;
    const ganti = () => {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(() => {
        i = (i + 1) % kata.length;
        el.textContent = kata[i];
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 280);
    };
    el.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    setInterval(ganti, 2200);
  },

  /* Parallax lembut — blob & emoji mengikuti mouse (desktop only) */
  parallax() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const hero = document.querySelector(".lp-hero");
    if (!hero) return;
    const elems = document.querySelectorAll(".lp-blob, .lp-float");
    hero.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      elems.forEach((el, idx) => {
        const kedalaman = 12 + (idx % 3) * 14;
        el.style.translate = `${(-x * kedalaman).toFixed(1)}px ${(-y * kedalaman).toFixed(1)}px`;
      });
    });
  },

  /* Spotlight yang ngikutin kursor di kartu fitur */
  spotlightFitur() {
    document.querySelectorAll(".lp-feature").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  },

  mobileMenu() {
    const btn = document.getElementById("lpMenuBtn");
    const menu = document.getElementById("lpMenu");
    if (!btn || !menu) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
    /* tutup menu kalau link diklik */
    menu.querySelectorAll("a, button").forEach((el) =>
      el.addEventListener("click", () => menu.classList.remove("open"))
    );
  },
};

document.addEventListener("DOMContentLoaded", () => Landing.init());