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

The source of truth is the team's Bitwarden collection, read through `pnpm run dev-env` (`DEV_ENVIRONMENT.md`, "Dev servers and test accounts"). It lists every dev API server and test account together with the notes that say what each is good for.

### Choosing a server and an account

1. `pnpm run dev-env list --json` — servers and accounts with `tags`, `notes`, `verifiedAt`, `stale`, `share` (`public` or `team`) and `passwordAvailable`. It carries no passwords, so it is safe to quote.
2. Match the task against it: filter by `tags` first (`multi-project`, `plugin:<name>`, `no-destructive`, …), then read `notes` to decide between what is left. Prefer the least-privileged role that can do the task, prefer a `share: public` account when it does the job equally well, and never run a destructive flow on an account or server tagged `no-destructive`.
   When the account you need has `passwordAvailable: false`, this box got only the public view: say so and tell the user to run `dev-gw enroll` (do not run it yourself — it registers a key on their GitHub account).
3. Say which server and account you picked and why, in one line, before using them.
4. `pnpm run dev-env get <server> <role> --json` for that account's endpoint, email and password — or `pnpm run dev-env use <server> [role]` to write the pick into `.env.development.local` and `e2e/envs/.env.playwright` when a dev server or the E2E suite should use it.

Treat an entry with `stale: true` as a hint, not a fact: confirm what the note claims against the live server (the `bai-agent` skill) before relying on it. When a note turns out wrong or missing, tell the user what should change — the account is read-only, so a human edits Bitwarden.

If `dev-env` reports that `dev-gw` is missing or tells you to run `dev-gw enroll`, the machine is not set up: tell the user to run `dev-gw enroll` (it registers a key on their GitHub account and may need a `gh auth refresh`, so you cannot run it), and fall back to the file below.

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
