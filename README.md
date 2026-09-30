# AegistRouter

**AegistRouter** is a self-hosted AI API router — a hardened fork of [9router](https://github.com/decolua/9router) (MIBP edition) with additional reliability and anti-hallucination features.

One OpenAI-style request → any provider (LLM chat, image, embedding, TTS, STT, search), streamed back in the client's format. Multi-account key pools with automatic rotation, failover, and health-aware account selection are built in.

## AegistRouter features (on top of MIBP)

| Feature | What it does |
|---|---|
| **LoopGuard** | O(K) tool-call loop detection. Scans the last 40 tool calls per request; ≥5 identical `(name, args)` calls injects a strategy-change warning into the system prompt. Always-on, fail-open, zero allocations per message — safe at 1000+ message histories. |
| **Skeptical Rules** | Six anti-hallucination rules injected alongside Ponytail (same toggle): no "it works" claims without execution output, verbatim error reporting, path-cited code claims, written-vs-verified distinction. |
| **Ponytail levels** | `lite` / `full` / `ultra` token-saver personas (built-in, Aegist keeps the registry intact and rides on it). |
| **Key-pool rotation** | Multiple connections per node with round-robin / sticky / fill-first strategies, model-locks, and rate-limit failover (built-in to the base). |

## Deployment

```bash
cp .env.example .env          # set JWT_SECRET, INITIAL_PASSWORD
docker compose up -d          # serves on port 20200 (edit to taste)
# or bare-metal:
npm ci                        # lockfile must be npm-10 compatible (verify: npm run verify:lockfile)
NODE_OPTIONS="--max-old-space-size=1408" npm run build
DATA_DIR=/var/lib/aegistrouter PORT=20300 node custom-server.js --port 20300
```

Dashboard: `http://<host>:<port>` — first login uses `INITIAL_PASSWORD`, then set your own (the default is blocked from remote clients by design).

## Configuration

- `DATA_DIR` — SQLite DB, model catalog, auth tokens (default `~/.9router`, override for isolated instances)
- `PORT` — server port
- `INITIAL_PASSWORD` — first-boot dashboard password (never reuse in production)
- Token-saver settings (Caveman / Ponytail level / Headroom / PxPipe) live in the dashboard's Token Saver page

## Tests

```bash
node tests/unit/aegist-features.test.mjs   # Aegist features (LoopGuard, Skeptical, wiring)
npx vitest run                             # full upstream/MIBP suite
```

## Upstream sync

See `AGENTS.md` §5/§6: fork-only features are registered there and must be resolved fork-priority during merge. Merge, never rebase.

## Credits

- Base: [decolua/9router](https://github.com/decolua/9router) (upstream)
- Fork lineage: [mhiqrambg/9router-mibp-version](https://github.com/mhiqrambg/9router-mibp-version) (MIBP edition — Docker hardening, proxy-pool fitness, Freebuff provider)
- AegistRouter additions: LoopGuard, Skeptical Rules, branding ([T3Crypt/AegistRouter](https://github.com/T3Crypt/AegistRouter))

## License

MIT
