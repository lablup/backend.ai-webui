---
name: webui-connection-info
description: >
  Find WebUI dev server address and Backend.AI API endpoint/credentials for testing.
  Trigger on: "which server", "connection info", "login credentials", "dev server URL",
  "API endpoint", "where to connect", "how to login", "test server",
  or when needing to interact with the running WebUI (screenshots, live checks, E2E).
  This skill only says where to connect: for the data behind the UI — field meanings,
  GraphQL queries, live rows — use the `bai-agent` skill.
---

# WebUI Connection Info

## Dev Server Address

The WebUI dev server runs under [Portless](https://github.com/vercel-labs/portless) on a `*.localhost:1355` URL.

`scripts/dev.mjs` picks the subdomain from the current git branch:
- Branch contains an `FR-XXXX` token → `http://fr-XXXX.localhost:1355` (e.g. `04-24-feat_fr-2701_...` → `fr-2701.localhost`).
- Otherwise → `<branch>.<project>.localhost:1355` (Portless's default `run` form).

**Never assume port `1355`**: when another Portless daemon is already bound there (another Claude session / worktree), the server lands on 1356, 1357, … — always confirm the real port from one of the sources below.

To find the actual URL for a running instance, check these sources in order:

1. **The boot records** — `~/.local/state/fw/dev-servers/*.json`, one per Portless app,
   written by the `dev-server` skill. Each carries `url` (the gateway URL a teammate can
   open), `localUrl`, `branch`, `pid`, `startedAt`/`stoppedAt` and the PRs it serves. A
   record with `stoppedAt` set is a server that is gone. This is the only source that says
   *which branch and PRs* a server is for, so start here.
2. `portless list` — live routes on this box.
3. The `pnpm run dev` terminal output — Portless prints the full URL on startup.

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
