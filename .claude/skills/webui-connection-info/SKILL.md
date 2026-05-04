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

The WebUI dev server runs under [Portless](https://github.com/vercel-labs/portless) on a `*.localhost:1355` URL.

`scripts/dev.mjs` picks the subdomain from the current git branch:
- Branch contains an `FR-XXXX` token → `http://fr-XXXX.localhost:1355` (e.g. `04-24-feat_fr-2701_...` → `fr-2701.localhost`).
- Otherwise → `<branch>.<project>.localhost:1355` (Portless's default `run` form).

To find the actual URL for a running instance, run `portless list` or check the `pnpm run dev` terminal output.

If no dev server is running, tell the user to start it with `pnpm run dev` (requires Portless: `npm install -g portless`).

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
