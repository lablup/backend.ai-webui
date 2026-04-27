# Development Environment

The Backend.AI WebUI dev server runs behind [Portless](https://github.com/vercel-labs/portless), which assigns each branch a stable `*.localhost` subdomain. No more port offsets, no more port conflicts between worktrees.

## No global install required

`portless` is bundled as a `devDependency`. After `pnpm install`, `pnpm run dev` invokes the project-local Portless binary — no `npm install -g portless` needed.

Safari (and some corporate network setups) need `/etc/hosts` entries for `*.localhost` resolution:

```bash
sudo pnpm exec portless hosts sync   # one-time
```

## Starting the dev server

In two terminals:

```bash
# Terminal 1 — TypeScript watch + Relay watch + CRA dev server (via Portless)
pnpm run dev

# Terminal 2 — WebSocket proxy (plain, fixed port 5050)
pnpm run wsproxy
```

`pnpm run dev` automatically starts the Portless daemon on port 1355 (idempotent — no-op if already running) and prints the assigned URL on startup, for example:

```
-> https://fr-2701.localhost:1355
```

Open that URL in your browser. Portless 0.10+ serves HTTPS/2 by default; the local CA is auto-installed in your system keychain on first start (no `sudo` on macOS).

### Why port 1355?

Portless's default daemon port is 443, which requires `sudo`. `dev.mjs` starts the daemon with `-p 1355` so dev never prompts for a password.

### Hostname rules

`scripts/dev.mjs` picks the Portless app name as follows:

1. If the current git branch matches `FR-XXXX` (case-insensitive — `fr-XXXX`, `feat/FR-XXXX-...`, `04-24-feat_fr-2701_...`), the hostname becomes `fr-XXXX.localhost:1355`.
2. Otherwise it falls back to `portless run`, which yields `<branch>.<project>.localhost:1355` automatically.

Why issue-number names: long branch names trigger a TLS-cert generation issue under HTTPS. Short, predictable names sidestep that and are also easier to read and bookmark.

## Optional: fix the React dev server port

By default Portless assigns a random free port to CRA (4000–4999). If you need a fixed port — for example to point an existing browser tab or external integration at it — set `PORT` when running `dev`:

```bash
PORT=9081 pnpm run dev
```

Portless then proxies `https://<name>.localhost:1355` to `http://localhost:9081`, and CRA listens directly on 9081.

## Multiple instances / worktrees

Each worktree picks up its own branch's FR number, so two worktrees on different issues (`fr-2701` and `fr-2890`) coexist on `fr-2701.localhost:1355` and `fr-2890.localhost:1355` without conflict. Two worktrees on the **same** branch will collide; `dev.mjs` passes `--force` so the second one overrides the first registration. Run only one of them at a time.

## Theme color for visual differentiation

Create `.env.development.local` (copy from `.env.development.local.sample`) and set:

```bash
THEME_HEADER_COLOR=#7C3AED
```

`scripts/dev.mjs` forwards this value as `REACT_APP_THEME_COLOR` to the CRA process, tinting the header so you can tell multiple instances apart at a glance.

## Storybook

```bash
pnpm --filter backend.ai-ui run storybook
```

Runs behind Portless on a fixed internal port 6006. Open the printed `*.localhost:1355` URL.

## Troubleshooting

- **Browser cannot reach `*.localhost`** — run `sudo pnpm exec portless hosts sync`. Safari requires this; Chrome and Firefox usually work without it.
- **Service-worker error like `Script .../sw.js load failed`** — fixed in this branch (`index.html` now skips SW registration on `*.localhost`). If you still see it, unregister the stale SW via DevTools → Application → Service Workers.
- **`already registered by a running process`** — Portless route from a previously killed dev server still exists. `dev.mjs` passes `--force` so this should self-heal; if not, run `pnpm exec portless proxy stop && pnpm exec portless proxy start -p 1355` once.
- **HTTPS request hangs / `HTTP 000`** — TLS cert generation can fail for very long hostnames. Either rename the branch to include `FR-XXXX`, or switch the daemon to HTTP with `pnpm exec portless proxy start -p 1355 --no-tls`.
- **Theme color not applied** — confirm `THEME_HEADER_COLOR` is set in `.env.development.local` (not just exported in the shell) and restart `pnpm run dev`. The bridge only runs on start.
- **Watchers seem stuck** — all three dev children (tsc, Relay watch, CRA) run under `concurrently` with `--kill-others`; Ctrl+C tears them down together.

## Commands reference

| Command | Description |
|---|---|
| `pnpm run dev` | TypeScript watch + Relay watch + CRA dev server, all under Portless |
| `PORT=9081 pnpm run dev` | Same, but pin CRA to port 9081 |
| `pnpm run wsproxy` | WebSocket proxy on fixed port 5050 (not wrapped by Portless) |
| `pnpm --filter backend.ai-ui run storybook` | Storybook under Portless |
| `pnpm exec portless list` | Show active Portless routes |
| `pnpm exec portless proxy stop` / `start -p 1355 [--no-tls]` | Daemon control (project-local binary) |
