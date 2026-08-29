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

To pin a different daemon port on a machine — for example, when another Portless daemon is already running — export `PORTLESS_PORT` in your shell rc:

```bash
export PORTLESS_PORT=1356
```

When `PORTLESS_PORT` is set, `dev.mjs` skips its explicit `-p` flag entirely and lets Portless read the env var itself — both for the daemon start and for subsequent `portless` client calls (`portless run`, `portless list`, …) — so daemon and clients stay aligned via a single source of truth.

The remaining `*.localhost:1355` URLs and `portless proxy start -p 1355` examples in this document describe the default. When `PORTLESS_PORT` is set, substitute its value in those URLs and commands.

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

## Sharing a dev server with the team (dev-gw)

`*.localhost:1355` only resolves on the box that runs the dev server. To let anyone on the dev VPN open it as a plain link, the **box** joins the team gateway once:

```bash
dev-gw join <box>   # installed by fw:setup-remote-env
```

That registers the box with the gateway and writes `~/.config/fw/dev-gw.json`. From then on, every `pnpm run dev` prints the shareable URL alongside the local one:

```
-- Team share URL: http://fr-2701.jongeun.10-82-0-159.sslip.io (dev VPN, via dev-gw)
```

The pattern is `http://<app>.<box>.<gateway-domain>`, where `<app>` is the same Portless app name as in the local URL. The gateway rewrites the `Host` header to `<app>.localhost:<PORTLESS_PORT>` before forwarding, so **Portless, Vite, and `dev.mjs` need no configuration for it** — the URL is the only difference.

Notes:

- **HTTP only, dev VPN only.** The gateway deliberately serves plain HTTP (no CA to install on the viewer's machine, and the Backend.AI client signs requests in pure JS, so no secure-context dependency). It is reachable only from the VPN and dev-net ranges.
- **The share URL is unauthenticated.** Anyone on the dev VPN or in dev-net can open it, and the dev bundle they receive contains every `VITE_*` value from your `.env.development.local` — including `VITE_DEFAULT_EMAIL` / `VITE_DEFAULT_PASSWORD` if you set them (see the `SECURITY:` note in `.env.development.local.sample`). Don't run a shared dev server with credentials you would not hand to the whole team.
- **Changing `PORTLESS_PORT` requires re-running `dev-gw join`.** The gateway forwards to the port recorded at join time; when they differ, `dev.mjs` says so and prints no URL.
- `dev.mjs` also exposes the URL to the React bundle as `VITE_DEV_SHARE_URL`. Set `DEV_GW_CONFIG` to read the config from a different path.
- When the app name is auto-derived by `portless run` (no `FR-XXXX` branch, no `PORTLESS_APP_NAME`), `dev.mjs` prints the pattern instead of a concrete URL — substitute the name Portless prints.

## Theme color for visual differentiation

Create `.env.development.local` (copy from `.env.development.local.sample`) and set:

```bash
VITE_THEME_HEADER_COLOR=#7C3AED
```

Vite auto-loads `VITE_*` vars from this file and exposes them on `import.meta.env` for the React app, tinting the header so you can tell multiple instances apart at a glance. You can also export `VITE_THEME_HEADER_COLOR` in the shell — same effect, no file edit needed.

## CLI login (`/cli-login`)

`bai-agent login` (`packages/backend.ai-agent-cli`) hands the CLI the session this dev server is already logged in with, via the `/cli-login` page. The route is **off by default** — turn it on in the `config.toml` you copied from `config.toml.sample`:

```toml
[general]
enableCliLogin = true
```

Restart is not needed for a fresh tab (`config.toml` is fetched at boot), but the flag only reaches the page after login, so sign in again if the tab was already open. With the flag off, `/cli-login` renders the app's 404 exactly as an unknown URL would.

Then, from anywhere inside this checkout:

```bash
pnpm --filter backend.ai-agent-cli build
node packages/backend.ai-agent-cli/dist/cli.js login --endpoint <manager url>
```

The CLI derives the WebUI origin from this checkout's branch the same way `scripts/dev.mjs` does (`fr-XXXX.localhost:1355`, honouring `PORTLESS_PORT`); pass `--webui <origin>` to override it. The browser POSTs the session to a loopback listener the CLI opened, so both must run on the same machine — over a tunnel or a shared dev-gw URL, use `bai-agent login --paste` instead. `packages/backend.ai-agent-cli/README.md` has the full flow.

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
- **Theme color not applied** — confirm `VITE_THEME_HEADER_COLOR` is set in `.env.development.local` or the shell, and restart `pnpm run dev`. Vite reads env at server start, so existing dev servers won't pick up changes until restarted.
- **Watchers seem stuck** — all three dev children (tsc, Relay watch, CRA) run under `concurrently` with `--kill-others`; Ctrl+C tears them down together.

## Commands reference

| Command                                                      | Description                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| `pnpm run dev`                                               | TypeScript watch + Relay watch + CRA dev server, all under Portless |
| `PORT=9081 pnpm run dev`                                     | Same, but pin CRA to port 9081                                      |
| `pnpm run wsproxy`                                           | WebSocket proxy on fixed port 5050 (not wrapped by Portless)        |
| `pnpm --filter backend.ai-ui run storybook`                  | Storybook under Portless                                            |
| `pnpm exec portless list`                                    | Show active Portless routes                                         |
| `pnpm exec portless proxy stop` / `start -p 1355 [--no-tls]` | Daemon control (project-local binary)                               |
