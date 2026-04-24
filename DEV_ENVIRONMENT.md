# Development Environment

Local development for Backend.AI WebUI runs behind [Portless](https://github.com/vercel-labs/portless) by default. Portless replaces port-number-based dev URLs (e.g. `http://localhost:9081`) with stable, named `.localhost` URLs derived from the project directory (e.g. `http://webui.localhost:1355`).

The legacy port-offset flow is still available as an escape hatch via `PORTLESS=0`. It is scheduled for removal in a follow-up (FR-2702); until then, both paths are supported.

## Install Portless (one-time)

Portless is a machine-wide developer tool. Install it globally — **do not** add it as a project dependency.

```console
$ npm install -g portless   # or: pnpm add -g portless
```

Requirements:

- Node.js 20+ (this project uses Node 24 via `.nvmrc`, so the requirement is already met).
- Single machine-wide Portless daemon on port `1355` (one developer, one proxy, many projects).

Optional but recommended on Safari:

```console
$ sudo portless hosts sync    # Adds .localhost routes to /etc/hosts
```

Safari does not resolve arbitrary `.localhost` subdomains without this step. Chrome/Firefox do not need it.

## Everyday Usage

### Start the dev server

```console
$ pnpm run dev
# → http://webui.localhost:1355
```

`pnpm run dev` launches TypeScript watch, Relay watch, and the React dev server concurrently. The React dev server runs behind Portless and the terminal prints the assigned URL.

If the Portless proxy daemon is not already running, `pnpm run dev` starts it automatically. If Portless is not installed, the script fails with a clear install hint.

### Start the websocket proxy (V1 proxy mode only)

```console
$ pnpm run wsproxy
# → http://wsproxy.webui.localhost:1355
```

Only developers using the local Node.js wsproxy (V1 proxy mode) need this. If you are running the Backend.AI webserver (V2 proxy mode), the webserver's built-in `ai.backend.web.proxy` handles session-app traffic and no local wsproxy is necessary.

### Start Storybook

```console
$ cd packages/backend.ai-ui
$ pnpm run storybook
# → http://storybook.webui.localhost:1355
```

## Multiple Clones / Worktrees

Portless derives the subdomain from the project directory name, so multiple clones or git worktrees get unique URLs automatically. No configuration required.

| Directory       | URL                                   |
| --------------- | ------------------------------------- |
| `webui`         | `http://webui.localhost:1355`         |
| `webui-feature` | `http://webui-feature.localhost:1355` |
| `webui-debug`   | `http://webui-debug.localhost:1355`   |

List what is currently routed:

```console
$ portless list
```

## Legacy Fallback (`PORTLESS=0`)

Every Portless-wrapped command accepts `PORTLESS=0` as an escape hatch. This is useful when you cannot install Portless, when the daemon is misbehaving, or while the legacy flow is still referenced by other tooling (removed in FR-2702).

```console
$ PORTLESS=0 pnpm run dev       # React dev server on http://localhost:9081 (+ BAI_WEBUI_DEV_PORT_OFFSET)
$ PORTLESS=0 pnpm run wsproxy   # WebSocket proxy on http://localhost:5050
$ PORTLESS=0 pnpm run storybook # Storybook on http://localhost:6006
```

Under `PORTLESS=0`, port selection falls back to `scripts/dev-config.js`, which honors `BAI_WEBUI_DEV_PORT_OFFSET` from `.env.development.local`. Example:

```env
# .env.development.local
BAI_WEBUI_DEV_PORT_OFFSET=10    # shifts React port to 9091
THEME_HEADER_COLOR=#9370DB
```

## Theme Color

The development build can tint the header to visually distinguish instances. Set `THEME_HEADER_COLOR` in `.env.development.local`:

```env
THEME_HEADER_COLOR=#9370DB
```

Theme color works in **both** the Portless path and the `PORTLESS=0` legacy path. `pnpm run dev` sources `scripts/dev-config.js env` to export `REACT_APP_THEME_COLOR` before spawning the React dev server.

## HTTPS (optional)

To run Portless with HTTP/2 + TLS (auto-generated certs):

```console
$ portless proxy stop
$ portless proxy start --https
$ portless trust            # Add the local CA to your system trust store
```

Your dev URLs then become `https://webui.localhost:1355` etc. Chrome-based browsers typically work out of the box after `portless trust`.

## Troubleshooting

**`portless` is not installed or not on PATH**
: Install it globally: `npm install -g portless`. Restart your shell if needed. Alternatively run the command with `PORTLESS=0` to bypass Portless entirely.

**Proxy daemon will not start**
: Run `portless proxy stop` and then `portless proxy start` manually to see the daemon's error output. Falling back to `PORTLESS=0` is always an option.

**Safari shows "cannot find server"**
: Run `sudo portless hosts sync` to add the current routes to `/etc/hosts`. Safari does not resolve `.localhost` subdomains via mDNS the way Chrome does.

**HMR does not reconnect**
: CRA/Craco HMR is sensitive to proxying. If HMR loops on reload, try `PORTLESS=0 pnpm run dev` to confirm the issue is proxy-related, then adjust `WDS_SOCKET_PATH` / `CHOKIDAR_USEPOLLING` env vars as needed. Normal editor saves should work end to end.

**WSProxy dynamic session-app ports**
: The V1 wsproxy assigns dynamic ports in the 10000-30000 range for individual session apps. Portless only manages the wsproxy listener (default `5050`); the dynamic app ports remain directly accessible on `localhost` and are not routed through Portless. This is an architectural property of V1 proxy mode, not a Portless limitation.

## What about Electron?

Electron (`pnpm run electron:d`) is out of scope for Portless integration. It continues to use the bundled wsproxy and direct port wiring. If you need a Portless-backed dev server inside Electron, run `pnpm run dev` separately and configure `[server].webServerURL` in `config.toml` to point at the Portless URL.

## Legacy files

The following files back the `PORTLESS=0` escape hatch and will be removed in FR-2702 once the Portless path has been validated:

- `scripts/dev-config.js` — port-offset + theme-color computation
- `scripts/dev-config.test.ts` — tests for the above
- `BAI_WEBUI_DEV_PORT_OFFSET` in `.env.development.local.sample`

Do not add new functionality to these files — add it to the Portless wrappers (`scripts/dev.mjs`, `scripts/portless-run.mjs`) instead.
