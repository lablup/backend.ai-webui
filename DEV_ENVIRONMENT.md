# Development Environment

Local development for Backend.AI WebUI runs behind [Portless](https://github.com/vercel-labs/portless). Portless replaces port-number-based dev URLs with stable, named `.localhost` URLs derived from the project directory (e.g. `http://webui.localhost:1355`).

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

## Theme Color

The development build can tint the header to visually distinguish instances. Set `THEME_HEADER_COLOR` in `.env.development.local`:

```env
THEME_HEADER_COLOR=#9370DB
```

`pnpm run dev` reads `.env.development.local` directly and exports `REACT_APP_THEME_COLOR` before spawning the React dev server.

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
: Install it globally: `npm install -g portless`. Restart your shell if needed.

**Proxy daemon will not start**
: Run `portless proxy stop` and then `portless proxy start` manually to see the daemon's error output.

**Safari shows "cannot find server"**
: Run `sudo portless hosts sync` to add the current routes to `/etc/hosts`. Safari does not resolve `.localhost` subdomains via mDNS the way Chrome does.

**WSProxy dynamic session-app ports**
: The V1 wsproxy assigns dynamic ports in the 10000-30000 range for individual session apps. Portless only manages the wsproxy listener; the dynamic app ports remain directly accessible on `localhost` and are not routed through Portless. This is an architectural property of V1 proxy mode, not a Portless limitation.

## What about Electron?

Electron (`pnpm run electron:d`) is out of scope for Portless integration. It continues to use the bundled wsproxy and direct port wiring. If you need a Portless-backed dev server inside Electron, run `pnpm run dev` separately and configure `[server].webServerURL` in `config.toml` to point at the Portless URL.
