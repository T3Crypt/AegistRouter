<div align="center">

# AegistRouter

**Router API AI self-hosted dengan guardrail reliabilitas dan anti-halusinasi bawaan.**

Satu request gaya OpenAI → provider apa pun. Respons streaming dalam format client Anda.

[🇬🇧 English](README.md) | [🇮🇩 Bahasa Indonesia](README.id.md)

![version](https://img.shields.io/badge/version-1.0.0--aegist.3-blue)
![base](https://img.shields.io/badge/base%3A%209router-v0.5.95-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

</div>

---

AegistRouter adalah fork keras dari [9router](https://github.com/decolua/9router) yang dibangun di atas [edisi MIBP](https://github.com/mhiqrambg/9router-mibp-version). Lapisan tambahannya sendiri: deteksi tool-loop, aturan anti-halusinasi, dan hardening deployment.

## Fitur

### Tambahan AegistRouter

| Fitur | Fungsi |
|---|---|
| **LoopGuard** | Deteksi tool-call loop dengan kompleksitas O(K). Memindai 40 tool call terakhir per request; ≥5 panggilan identik `(nama, args)` menyuntikkan peringatan perubahan strategi ke system prompt. Selalu aktif, fail-open, tanpa alokasi memori per pesan — aman untuk riwayat 1000+ pesan. |
| **Skeptical Rules** | Enam aturan anti-halusinasi yang disuntikkan bersama Ponytail (toggle yang sama): tidak ada klaim "berhasil" tanpa output eksekusi, pelaporan error verbatim, klaim kode dengan sitasi path, pembedaan ditulis-vs-terverifikasi. |
| **Docker image hardened** | `node:22-alpine` di-pin per digest, lockfile terverifikasi npm-10 (`npm ci` dipaksa), HEALTHCHECK container. |

### Warisan dari silsilah 9router

| Fitur | Asal |
|---|---|
| Satu request → provider apa pun (chat LLM, gambar, embedding, TTS, STT, search) | 9router upstream (decolua) |
| Pool multi-akun: rotasi round-robin / sticky / fill-first, model lock, failover rate-limit | 9router upstream (decolua) |
| Persona token-saver: Caveman, Ponytail (`lite` / `full` / `ultra`), Headroom, PxPipe | 9router upstream (decolua + PR komunitas) |
| Provider Freebuff + scoring proxy-pool fitness (probing egress geo-aware) | edisi MIBP |
| Model free-tier Cline dengan mode auth OAuth + API-key | edisi MIBP |

## Proyek dasar

AegistRouter **dibangun di atas [9router](https://github.com/decolua/9router) v0.5.95** karya decolua — mesin router, registry provider, rotasi key-pool, sistem token-saver, dan dashboard semuanya diwarisi dari sana. [Edisi MIBP](https://github.com/mhiqrambg/9router-mibp-version) menyediakan dasar fork tempat proyek ini bertumbuh. AegistRouter mengikuti rilis upstream: sinkronisasi saat ini = **v0.5.95** (2026-10-01).

Semua yang tercantum di bagian "Warisan dari silsilah 9router" di bawah berasal dari basis tersebut; tambahan milik AegistRouter adalah tiga fitur pada tabel pertama.

## Mulai cepat

```bash
git clone https://github.com/T3Crypt/AegistRouter.git
cd AegistRouter
cp .env.example .env             # isi JWT_SECRET, INITIAL_PASSWORD
npm ci                           # lockfile terverifikasi npm 10 (npm run verify:lockfile)
NODE_OPTIONS="--max-old-space-size=1408" npm run build
DATA_DIR=/var/lib/aegistrouter PORT=20300 node custom-server.js --port 20300
```

Docker:

```bash
cp .env.example .env
docker compose up -d             # jalan di port 20200 (sesuaikan)
```

Dashboard: `http://<host>:<port>` — login pertama memakai `INITIAL_PASSWORD`, lalu ganti dengan milik Anda (password default sengaja diblokir dari klien remote).

## Konfigurasi

| Variabel | Fungsi |
|---|---|
| `DATA_DIR` | SQLite DB, katalog model, token auth (default `~/.9router`) |
| `PORT` | Port server |
| `JWT_SECRET` | Secret penandatanganan sesi dashboard |
| `INITIAL_PASSWORD` | Password dashboard boot pertama (jangan dipakai ulang di production) |

Pengaturan token-saver (Caveman / level Ponytail / Headroom / PxPipe) ada di halaman Token Saver dashboard.

## Uji

```bash
node tests/unit/aegist-features.test.mjs   # Fitur Aegist (LoopGuard, Skeptical, wiring) — node murni
npx vitest run                             # seluruh suite upstream
npm run verify:lockfile                    # cek lockfile npm-10 (dijalankan CI pra-Docker)
```

## Sinkronisasi upstream

Fitur khusus fork terdaftar di `AGENTS.md` §5 dan wajib diselesaikan dengan prioritas fork saat merge. Merge, jangan rebase. Prosedur sinkron: `AGENTS.md` §6.

## Kredit

AegistRouter berdiri di atas kerja ekosistem 9router. Terima kasih kepada:

- **[decolua/9router](https://github.com/decolua/9router)** — proyek upstream: mesin router, registry provider, rotasi key-pool, sistem token-saver, dan dashboard.
- **[mhiqrambg/9router-mibp-version](https://github.com/mhiqrambg/9router-mibp-version)** — edisi MIBP: hardening Docker, proxy-pool fitness, provider Freebuff, dukungan free-tier Cline.
- **[T3Crypt/AegistRouter](https://github.com/T3Crypt/AegistRouter)** — fork ini: LoopGuard, Skeptical Rules, hardening deployment.

## Lisensi

MIT
