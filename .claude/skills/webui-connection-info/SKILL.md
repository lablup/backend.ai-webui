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

`scripts/dev.mjs` names the app from the branch's issue key, its PR number and a
descriptive word — e.g. `https://fr-3665-pr9049-statusline.localhost:1355`; off an FR
branch Portless derives the name. Don't construct the URL — read it from a source below.

**Never assume port `1355`**: when another Portless daemon is already bound there (another Claude session / worktree), the server lands on 1356, 1357, … — always confirm the real port from one of the sources below.

To find the actual URL for a running instance, check these sources in order:

1. **The boot records** — `~/.local/state/fw/dev-servers/*.json`, one per Portless app,
   written by the `dev-server` skill. Each carries `url` (the gateway URL a teammate can
   open), `localUrl`, `branch`, `pid`, `startedAt`/`stoppedAt` and the PRs it serves. A
   record with `stoppedAt` set is a server that is gone. This is the only source that says
   _which branch and PRs_ a server is for, so start here.
2. `portless list` — live routes on this box.
3. The `pnpm run dev` terminal output — Portless prints the full URL on startup.

If no dev server is running, tell the user to start it with `pnpm run dev` (Portless is a devDependency and `dev.mjs` starts its daemon; no global install).

## API Endpoint & Credentials

The source of truth is the team's catalog on the team PR board (`http://board.<domain>/`, Catalog page), read through `pnpm run dev-env` (`DEV_ENVIRONMENT.md`, "Dev servers and test accounts"). It lists every dev API server and test account, the notes that say what each is good for, and each server's last probe (live or down, manager version).

### Choosing a server and an account

1. `pnpm run dev-env list --json` — servers with `tags`, `notes` and `status` (`live`, `checkedAt`, `lastLiveAt`, `managerVersion`, `apiVersion`, `error`, and `config` — the deployment's probed `config.toml`), and their accounts with `role` (`user`, `project-admin` or `admin`), `email`, `tags`, `notes` and `passwordAvailable`. It carries no passwords, so it is safe to quote.
2. Skip servers whose `status.live` is `false` unless the user asked for that server by name. Treat `status: null`, or a `checkedAt` older than ~30 minutes, as unknown: confirm the server answers (the `bai-agent` skill, or a request to the endpoint) before relying on it.
3. When the task depends on the manager version — a feature gated behind a release, or reproducing a bug on a given version — match it against `status.managerVersion`. When it depends on a deployment switch — signup, model folders, container commit, Hugging Face import, a plugin, the connection mode — filter servers by `status.config` before choosing (`pnpm run dev-env config <server>` prints the relevant switches). `config: null` means unknown, not off: confirm on the server before relying on it.
4. Match the task against the rest: filter by `tags` first (`multi-project`, `plugin:<name>`, `no-destructive`, …), then read `notes` to decide between what is left. Pick the least-privileged role that can do the task (`user` < `project-admin` < `admin`). Several accounts on a server may share a role: choose between them by their `tags` and `notes`, and name the email you chose. Prefer an account with `passwordAvailable: true` when it does the job equally well, and never run a destructive flow on an account or server tagged `no-destructive`.
5. An account with `passwordAvailable: false` has no password in the catalog, so you cannot log in with it unless the box owner put it in `e2e/envs/.env.playwright`: look there for an `E2E_*_EMAIL` matching the account's email with a non-empty `E2E_*_PASSWORD` beside it. Otherwise pick another account, or ask the user for the password. Never guess one.
6. Say which server and account you picked and why, in one line, before using them — including the manager version or the deployment switch when the pick depended on it (e.g. "main/admin <admin@example.com> — live, manager 25.15.0, `enableModelFolders` on").
7. `pnpm run dev-env get <server> <email> --json` for that account's endpoint, email and password — or `pnpm run dev-env use <server> <email>` to write the pick into `.env.development.local` and `e2e/envs/.env.playwright` when a dev server or the E2E suite should use it. Pass the email rather than the role, so the pick is the account you named (a role picks the first account with it). A password the box owner wrote for the same email survives `use`.

Notes are hand-written and carry no date: treat what they claim as a hint, and confirm it against the live server (the `bai-agent` skill) before relying on it. The only freshness signal is the probe's `checkedAt` (step 2). When a note turns out wrong or missing, tell the user what should change; anyone on the dev VPN can edit it on the board's Catalog page (`http://board.<domain>/`).

If `dev-env` reports that no gateway is configured or the board cannot be reached, tell the user (the box needs `dev-gw join` for the domain, or the dev VPN or the board is down) and fall back to the file below.

### The file fallback

Read `e2e/envs/.env.playwright` to get the server endpoint and login credentials the last `dev-env use` (or a human) wrote.

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
