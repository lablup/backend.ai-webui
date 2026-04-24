---
name: webui-connection-info
description: >
  Find WebUI dev server address and Backend.AI API endpoint/credentials for testing.
  Trigger on: "which server", "connection info", "login credentials", "dev server URL",
  "API endpoint", "where to connect", "how to login", "test server",
  or when needing to interact with the running WebUI (screenshots, live checks, E2E).
---

# WebUI Connection Info

## Dev Server Address

The WebUI dev server runs behind [Portless](https://github.com/vercel-labs/portless) by default at **http://webui.localhost:1355**. The subdomain is derived from the project directory name, so worktrees (e.g. `webui-feature`) get their own URL automatically.

To check if the dev server is running:

```bash
curl -s -o /dev/null -w "%{http_code}" http://webui.localhost:1355 2>/dev/null
```

Inspect all Portless-routed services:

```bash
portless list
```

### Legacy fallback (`PORTLESS=0`)

Some developers run the dev server without Portless. In that case the server is at **http://localhost:9081**, with an optional offset via `BAI_WEBUI_DEV_PORT_OFFSET` in `.env.development.local` (actual port = `9081 + offset`). Check the legacy port first if the Portless URL is not responding:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:9081 2>/dev/null
```

If neither is running, tell the user to start it with `pnpm run dev` (Portless) or `PORTLESS=0 pnpm run dev` (legacy).

Related services (default URLs):

| Service | Portless URL | Legacy URL (`PORTLESS=0`) |
|---------|--------------|---------------------------|
| React dev server | `http://webui.localhost:1355` | `http://localhost:9081` |
| WebSocket proxy (V1) | `http://wsproxy.webui.localhost:1355` | `http://localhost:5050` |
| Storybook | `http://storybook.webui.localhost:1355` | `http://localhost:6006` |

The legacy flow is scheduled for removal in FR-2702.

## API Endpoint & Credentials

Read `e2e/envs/.env.playwright` to get the current server endpoint and login credentials.

Key variables:
- `E2E_WEBSERVER_ENDPOINT` — Backend.AI API server URL
- `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` — admin account
- `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` — regular user account
- Additional: `E2E_USER2_*`, `E2E_MONITOR_*`, `E2E_DOMAIN_ADMIN_*`

**Always read the file fresh** — credentials and endpoints change. Do not hardcode or cache them.

## Login Flow

The WebUI login page requires:
1. Email/Username
2. Password
3. Endpoint (may be hidden under "Advanced" toggle)

The app uses `config.toml` with `connectionMode = "SESSION"`. If `apiEndpoint` is empty, the user must enter the endpoint manually on the login page.

## Gotchas

- The `.env.playwright` file may have multiple endpoints commented out (e.g., LTS vs main). Use the **uncommented** `E2E_WEBSERVER_ENDPOINT`.
- Passwords may contain special characters — handle quoting carefully.
- The webpack-dev-server overlay can intercept clicks. Remove it via: `document.getElementById('webpack-dev-server-client-overlay')?.remove()`
- If the "Endpoint" input field is not visible on the login page, click "Advanced" to expand it.
- Safari requires `sudo portless hosts sync` once to resolve `.localhost` subdomains. Chromium/Firefox do not.
