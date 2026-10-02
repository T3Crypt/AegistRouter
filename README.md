<p align="center">
  <h1 align="center">AegistRouter</h1>
  <strong>Self-hosted AI API router with built-in reliability and anti-hallucination guardrails.</strong><br>
  One OpenAI-style request → any provider. Streamed back in your client's format.<br>
  <a href="README.md">🇬🇧 English</a> | <a href="README.id.md">🇮🇩 Bahasa Indonesia</a>
</p>

---

<p align="center">
  <img alt="AegistRouter version" src="https://img.shields.io/badge/version-1.0.0--aegist.2-blue" />
  <img alt="9router base version" src="https://img.shields.io/badge/base%3A%209router-v0.5.95-green" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-lightgrey" />
</p>

AegistRouter is a hard fork of [9router](https://github.com/decolua/9router) built on the [MIBP edition](https://github.com/mhiqrambg/9router-mibp-version). It adds its own reliability layer on top: tool-loop detection, anti-hallucination prompt rules, and hardened deployment defaults.


## Features

### AegistRouter additions

| Feature | What it does |
|---|---|
| **LoopGuard** | O(K) tool-call loop detection. Scans the last 40 tool calls per request; ≥5 identical `(name, args)` calls inject a strategy-change warning into the system prompt. Always-on, fail-open, zero allocations per message — safe at 1000+ message histories. |
| **Skeptical Rules** | Six anti-hallucination rules injected alongside Ponytail (same toggle): no "it works" claims without execution output, verbatim error reporting, path-cited code claims, written-vs-verified distinction. |
| **Hardened Docker image** | Digest-pinned `node:22-alpine`, npm-10-verified lockfile (`npm ci` enforced), container HEALTHCHECK. |

### Inherited from the 9router lineage

| Feature | Origin |
|---|---|
| One-request → any provider (LLM chat, image, embedding, TTS, STT, search) | 9router upstream (decolua) |
| Multi-account key pools: round-robin / sticky / fill-first rotation, model locks, rate-limit failover | 9router upstream (decolua) |
| Token-saver personas: Caveman, Ponytail (`lite` / `full` / `ultra`), Headroom, PxPipe | 9router upstream (decolua + community PRs) |
| Freebuff provider + proxy-pool fitness scoring (geo-aware egress probing) | MIBP edition |
| Cline free-tier models with OAuth + API-key auth modes | MIBP edition |

## Base project

AegistRouter is **built on [9router](https://github.com/decolua/9router) v0.5.95** by decolua — the upstream router engine, provider registry, key-pool rotation, token-saver system, and dashboard are all inherited from it. The [MIBP edition](https://github.com/mhiqrambg/9router-mibp-version) provides the fork base this project grew from. AegistRouter tracks upstream releases: current sync = **v0.5.95** (2026-10-01).

Everything listed under "Inherited from the 9router lineage" below comes from that base; AegistRouter's own additions are the three features in the first table.

## Quick start

```bash
git clone https://github.com/T3Crypt/AegistRouter.git
cd AegistRouter
cp .env.example .env             # set JWT_SECRET, INITIAL_PASSWORD
npm ci                           # lockfile verified for npm 10 (npm run verify:lockfile)
NODE_OPTIONS="--max-old-space-size=1408" npm run build
DATA_DIR=/var/lib/aegistrouter PORT=20300 node custom-server.js --port 20300
```

Docker:

```bash
cp .env.example .env
docker compose up -d             # serves on port 20200 (edit to taste)
```

Dashboard: `http://<host>:<port>` — first login uses `INITIAL_PASSWORD`, then set your own (the default is blocked from remote clients by design).

## Configuration

| Variable | Purpose |
|---|---|
| `DATA_DIR` | SQLite DB, model catalog, auth tokens (default `~/.9router`) |
| `PORT` | Server port |
| `JWT_SECRET` | Signing secret for dashboard sessions |
| `INITIAL_PASSWORD` | First-boot dashboard password (never reuse in production) |

Token-saver settings (Caveman / Ponytail level / Headroom / PxPipe) live in the dashboard's Token Saver page.

## Tests

```bash
node tests/unit/aegist-features.test.mjs   # Aegist features (LoopGuard, Skeptical, wiring) — plain node
npx vitest run                             # full upstream suite
npm run verify:lockfile                    # npm-10 lockfile check (runs in CI pre-Docker)
```

## Upstream sync

Fork-only features are registered in `AGENTS.md` §5 and must be resolved fork-priority during merges. Merge, never rebase. Sync procedure: `AGENTS.md` §6.

## Credits

AegistRouter stands on the work of the 9router ecosystem. Thanks to:

- **[decolua/9router](https://github.com/decolua/9router)** — the upstream project: the router engine, provider registry, key-pool rotation, token-saver system, and dashboard.
- **[mhiqrambg/9router-mibp-version](https://github.com/mhiqrambg/9router-mibp-version)** — the MIBP edition: Docker hardening, proxy-pool fitness, Freebuff provider, Cline free-tier support.
- **[T3Crypt/AegistRouter](https://github.com/T3Crypt/AegistRouter)** — this fork: LoopGuard, Skeptical Rules, deployment hardening.

## License

MIT
