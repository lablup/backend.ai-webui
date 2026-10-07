---
name: webui-connection-info
description: >
  Find the WebUI dev server address and the Backend.AI API endpoint and test account to use.
  Trigger on: "which server", "connection info", "login credentials", "dev server URL",
  "API endpoint", "where to connect", "how to login", "test server", or when needing to
  interact with the running WebUI (screenshots, live checks, E2E). Defers to
  `fw:webui-connection-info` when that skill is available; this copy is the fallback for fw < 28.1.0.
---

# WebUI Connection Info (fallback)

**If `fw:webui-connection-info` is in your skill list, use it instead and stop here.** This thin copy exists only for teammates on fw < 28.1.0 and will be removed once fw 28.1.0 is everywhere.

## API server and test account

From this repository (details: `DEV_ENVIRONMENT.md`, "Dev servers and test accounts"):

1. `pnpm run dev-env list --json` — the team catalog. It never prints passwords, so it is safe to quote.
2. Choose: skip servers with `status.live: false` unless the user named one; treat `status: null` or a `checkedAt` older than ~30 min as unknown. Match version-dependent work on `status.managerVersion` and deployment switches on `status.config` (`null` means unknown, not off). Then filter by tags, read notes, and take the least-privileged role (`user` < `project-admin` < `admin`), naming the email when several accounts share a role. Never run a destructive flow on anything tagged `no-destructive`.
3. An account with `passwordAvailable: false` can be used only if `e2e/envs/.env.playwright` already holds a password for that email; otherwise pick another or ask the user. Never guess.
4. Say which server and account you picked and why in one line, then `pnpm run dev-env use <server> [role|email]` (or `get <server> <role|email> --json`).

## Dev server address

Read the boot records in `~/.local/state/fw/dev-servers/*.json` (written by the `dev-server` skill; a record with `stoppedAt` is gone) and announce the record's `url` — the dev box gateway URL — with `https://`, never the `*.localhost` one. No record: `portless list`, or ask the user to run `pnpm run dev`.

For the data behind the UI (field meanings, GraphQL, live rows) use the `bai-agent` skill.
