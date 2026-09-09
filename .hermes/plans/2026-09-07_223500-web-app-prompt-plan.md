# Plan: AI Prompt for Web App Project - Kelas XII RPL 1

## Goal
Create a clear, effective AI prompt that will generate a static web application for class XII RPL 1 (grade 12, Rekayasa Perangkat Lunak/Vocational Programming), optimized for GitHub Pages hosting.

## Current Context & Assumptions
- User is a student/teacher preparing a class management web app for XII RPL class
- Target: static web app hosted on GitHub Pages (free, no backend)
- Environment: Windows (10), working directory C:\Users\HYPE AMD\Downloads\KelasKu
- User prefers mix of Indonesian and English in conversation
- Stack: HTML5, CSS3, vanilla JavaScript (no framework)
- Storage: localStorage / IndexedDB (browser-based, no server)

## Proposed Approach
Generate a complete static web application using:
1. **Frontend**: HTML5, CSS3, vanilla JavaScript
2. **Storage**: localStorage for data persistence
3. **Hosting**: GitHub Pages (free static hosting)
4. **No backend required** — all logic runs in the browser

## Step-by-Step Plan

### Step 1: Define Project Scope
- Web app purpose: class management portal
- Target audience: XII RPL students and teachers
- Key features: kas management, absen (attendance), pelajaran (subjects), jadwal (schedule), PR (homework), siswa management

### Step 2: Choose Technology Stack
- **Frontend**: HTML5, CSS3, vanilla JavaScript
- **Storage**: localStorage (simple, sufficient for class data)
- **Hosting**: GitHub Pages (free, supports static sites)
- **No build step** — direct file upload to GitHub

### Step 3: Language Decision
- **Prompt language**: Indonesian-English mix (user's preferred style)
- **Code/UI language**: Indonesian (for class accessibility)
- **Comments in code**: Indonesian

### Step 4: Application Architecture
- Single Page Application (SPA) with hash-based routing
- Modular JavaScript files (one per feature: auth, absen, kas, etc.)
- Shared CSS with CSS variables for theming
- localStorage wrapper utility for data persistence

### Step 5: Data Models (localStorage keys)
- `users` — array of {id, nama, username, passwordHash, role}
- `absen` — array of {id, tanggal, namaSiswa, status, keterangan}
- `pelajaran` — array of {id, namaMapel, guruPengajar}
- `jadwal` — array of {id, mapelId, hari, jamMulai, jamSelesai, ruang}
- `pr` — array of {id, mapelId, judul, deskripsi, tenggat, status, siswaId}
- `kasMasuk` — array of {id, deskripsi, jumlah, tanggal, sumber}
- `kasKeluar` — array of {id, deskripsi, jumlah, tanggal, tujuan}
- `pembayaran` — array of {id, siswaId, bulan, nominal, status, tanggalBayar}

### Step 6: File Structure
```
/KelasKu
  ├── index.html          (main entry, SPA shell)
  ├── login.html          (login page)
  ├── README.md           (setup & deployment instructions)
  ├── css/
  │   ├── style.css       (main styles)
  │   └── components.css  (buttons, cards, modals, tables)
  ├── js/
  │   ├── app.js          (main app logic, router)
  │   ├── auth.js         (login/logout, session)
  │   ├── storage.js      (localStorage wrapper)
  │   ├── utils.js        (helpers: date, hash, format)
  │   ├── absen.js        (attendance module)
  │   ├── kas.js          (cash management)
  │   ├── pelajaran.js    (subjects module)
  │   ├── jadwal.js       (schedule module)
  │   ├── pr.js           (homework module)
  │   ├── pembayaran.js   (payment module)
  │   └── siswa.js        (student management)
  └── assets/
      └── logo.png        (class logo placeholder)
```

### Step 7: Key Features Implementation
1. **Login System**: client-side auth, password hashed with SHA-256
2. **Role-based UI**: admin_guru vs siswa
3. **Dashboard**: ringkasan semua data
4. **CRUD modules**: absen, kas, pelajaran, jadwal, PR, pembayaran, siswa
5. **Export to CSV**: client-side export
6. **Responsive design**: mobile-friendly

## Files Likely to Change
- `.hermes/plans/2026-09-07_223500-web-app-prompt-plan.md` (this plan)
- All project files in `C:\Users\HYPE AMD\Downloads\KelasKu\`
- `.gitignore` for GitHub repo

## Tests / Validation
- Open `index.html` directly in browser (no server needed)
- Test login flow with default admin account
- Verify CRUD operations persist to localStorage
- Test responsive design on mobile viewport
- Validate GitHub Pages deployment works

## Risks, Tradeoffs, and Open Questions
- **Risk**: localStorage is per-device/per-browser — no real sync across users
- **Tradeoff**: Simplicity vs. real backend — fine for class internal use
- **Open question**: Default admin credentials (username/password)?
- **Open question**: Class name display format in header?

## Next Steps
1. Generate the AI prompt (static-stack version)
2. Run prompt through AI to generate source code
3. Create initial files in project directory
4. Test locally by opening index.html
5. Push to GitHub and enable Pages
