---
name: dev-server
description: >
  Start the project's development server. For backend.ai-webui this means
  `pnpm dev` (no separate wsproxy needed by default). For other projects,
  read the project's README.md and package.json to determine the right command.
  When a Claude Code `/color <name>` slash command is visible in the current
  conversation history, set VITE_THEME_HEADER_COLOR to the matching hex so the dev
  server's header reflects this Claude session's color. When `/rename <name>`
  is visible, slugify the name and pass it as PORTLESS_APP_NAME so the dev
  URL reflects the session name (falls back to FR-XXXX from the branch, then
  to the current PR number).
  Trigger on: "start dev server", "run dev", "pnpm dev 띄워", "개발 서버 띄워",
  "dev 서버 시작", "boot the dev environment", "실행해줘 dev".
---

# Dev Server

Starts the dev server with optional `VITE_THEME_HEADER_COLOR` and `PORTLESS_APP_NAME` derived from this Claude Code session's `/color` and `/rename` history.

## 1. Decide the command

### If cwd is `backend.ai-webui` (this project)

Run **only**:

```bash
pnpm dev
```

Do **not** start `pnpm wsproxy` by default. `scripts/dev.mjs` already handles tsc watch + Relay watch + Portless + Vite dev server, and the webui can connect to a backend without the local wsproxy in normal browser-based development. `pnpm wsproxy` is **optional** — start it only when the user explicitly asks (e.g. desktop/Electron flow, or a backend setup that needs the local WebSocket proxy on port 5050).

Pin the React port with `PORT=9081 pnpm dev` only if the user asked for a specific port.

### If cwd is some other project

Do not assume `pnpm dev`. Discover the right command:

1. Read the project's `README.md` (look for "Development", "Getting started", "Run", "Dev server" sections).
2. Read `package.json` `scripts` field. Look for `dev`, `start`, `serve`, `develop` — pick the one the README points to, or the obvious one if README is silent.
3. If neither is conclusive, ask the user which script to run before guessing.
4. Prefer the package manager the project uses: `pnpm-lock.yaml` → `pnpm`, `yarn.lock` → `yarn`, `bun.lockb` → `bun`, otherwise `npm`.

## 2a. Detect the Claude Code color from conversation history

Scan the **current conversation** (this session's prior turns, including `<command-name>` blocks and your own messages) for the most recent successful `/color <name>` invocation.

**What counts as "successful":**
- A `<command-name>/color</command-name>` block whose `<command-args>` is exactly one of: `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan`, `default`.
- AND the accompanying `<local-command-stdout>` does NOT start with `Invalid color`.
- If multiple `/color` calls appear, take the **most recent** one.
- If the most recent successful call is `default`, treat the color as unset (skip `VITE_THEME_HEADER_COLOR`).
- If no `/color` was ever invoked in this conversation, the color is unset.

**Hex mapping** (use exactly these values):

| Name | Hex |
|------|-----|
| `red` | `#DC2626` |
| `blue` | `#2563EB` |
| `green` | `#16A34A` |
| `yellow` | `#CA8A04` |
| `purple` | `#7C3AED` |
| `orange` | `#EA580C` |
| `pink` | `#DB2777` |
| `cyan` | `#0891B2` |

Do not invent additional names or alternate hex values. If the user's `/color` arg doesn't match the table exactly, treat it as unset.

## 2b. Decide the Portless app name (webui only)

`scripts/dev.mjs` reads `PORTLESS_APP_NAME` from the env and uses it as the Portless subdomain (`https://<name>.localhost:1355`). Pick a name with this priority:

1. **Most recent successful `/rename <name>` in conversation history** — slugify the arg (see rules below) and use that. This makes the dev URL match the human-readable session name (e.g. `iphoto-disk-cleanup` → `https://iphoto-disk-cleanup.localhost:1355`).
2. **FR-XXXX in the current git branch** — `dev.mjs` already detects this when `PORTLESS_APP_NAME` is unset, so just **omit the env var** and let it derive `fr-XXXX` (e.g. `fr-2794`). Don't recompute and pass it back in.
3. **Open PR number for the current branch** — only if (1) and (2) both miss and the current branch has an open PR. Use `gh pr view --json number -q '.number'` and pass `PORTLESS_APP_NAME=pr-<NNNN>`.
4. **None of the above** — omit the env var; `dev.mjs` falls back to Portless's auto-derived name.

**Slug rules** (apply to `/rename` arg before passing as `PORTLESS_APP_NAME`):
- Lowercase.
- Replace any character that isn't `[a-z0-9-]` with `-` (spaces, underscores, dots, slashes, non-ASCII all become `-`).
- Collapse repeated `-` into a single `-`.
- Trim leading/trailing `-`.
- Cap at ~40 chars (Portless cert generation can choke on very long subdomains).
- If the result is empty after sanitization, treat as unset.

`dev.mjs` re-applies the same sanitization defensively, so it's safe to pass a slightly imperfect string — but compute the clean form yourself so you can announce the right hostname to the user without re-reading Portless output.

**Detecting `/rename` in history**: scan the current conversation for `<command-name>/rename</command-name>` blocks. Take the **most recent** one whose `<local-command-stdout>` does not look like an error (e.g. doesn't start with `Error` / `Invalid`). Use `<command-args>` as the raw input to the slug rules.

## 3. Compose the run

**Default: no env vars.** If you cannot resolve a color from step 2a (no `/color` in history, or the most recent was `default`, or anything ambiguous), run the command with **no `VITE_THEME_HEADER_COLOR` prefix at all**. Do not invent a color, do not pick a "neutral" default, do not pass an empty string. Just omit the env var. Same goes for `PORTLESS_APP_NAME` from step 2b.

- **Color resolved** (e.g. `blue` → `#2563EB`):
  ```bash
  VITE_THEME_HEADER_COLOR='#2563EB' pnpm dev
  ```
- **Color unset** (no `/color` in history, or last was `default`):
  ```bash
  pnpm dev
  ```

If step **2b** picked a Portless app name from `/rename` or a PR number, also prefix `PORTLESS_APP_NAME='<slug>'`. If 2b selected the FR-XXXX branch fallback (option 2) or "none" (option 4), **omit** `PORTLESS_APP_NAME` — `dev.mjs` handles those itself.

```bash
VITE_THEME_HEADER_COLOR='#2563EB' PORTLESS_APP_NAME='iphoto-disk-cleanup' pnpm dev
```

For non-webui projects, substitute the discovered command and package manager. Use whatever color env var the project actually reads (check `vite.config.*`, `next.config.*`, etc., or grep for `*THEME_HEADER_COLOR` / `*_THEME_COLOR`). Apply the prefix only when (a) a color is actually resolved AND (b) the project really consumes that env var. If either is false, skip the prefix. `PORTLESS_APP_NAME` is webui-specific.

## 4. Run it

Use the Bash tool with `run_in_background: true` since dev servers are long-running. State in one short sentence what you're doing — e.g. `"Starting dev server with header color #2563EB (blue)."` — and which color name (if any) the env was derived from. Don't paste the env table.

## 5. Announce both URLs to the user

Once the server is up, tell the user **both** the Portless (HTTPS) URL and the underlying React (HTTP) URL on separate lines so they can pick whichever they prefer. Do this only after both are actually known — don't fabricate ports.

### For backend.ai-webui

- **Portless URL** — derived from the app name chosen in step 2b:
  - If you passed `PORTLESS_APP_NAME=<slug>`, the URL is `https://<slug>.localhost:1355`.
  - Else if the branch matches `/(?:^|[-_/])fr-?(\d+)/i`, the URL is `https://fr-<NNNN>.localhost:1355` (dev.mjs derives this).
  - Else it's `https://<portless-app-name>.localhost:1355` where `<portless-app-name>` is whatever Portless printed on startup (read it from the background task's output; do not guess).
  - The port is `1355` unless the user set `PORTLESS_PORT` to something else — in that case use that value.
- **React URL** — the local Vite dev server URL:
  - The webui uses **Vite** (`VITE v6.x ready in <ms>` line), so the `Local:` URL is printed within ~1s of startup — no need to wait for a long bundle compile.
  - If the user passed `PORT=<n>`, the URL is `http://127.0.0.1:<n>/` (Portless launches Vite with `HOST=127.0.0.1`, so Vite prints `127.0.0.1` not `localhost`).
  - Otherwise Portless picks a free port and exports it via `PORT=<n>`; read the React dev server output for the `Local:   http://127.0.0.1:<port>/` line. Do not pick a port at random.

Run a short Bash with an until-loop polling the background bash's output file for the `Local:` line (and a fallback bound of ~10–15s, since Vite is fast). Once both URLs are known, present them like this — exactly two lines, no preamble:

```
Portless: https://fr-2701.localhost:1355
React:    http://127.0.0.1:4627/
```

If after ~15s the React URL still hasn't appeared (very rare with Vite), announce just the Portless URL and tell the user the React port hasn't been printed yet — don't block indefinitely.

### For other projects

Many projects don't use Portless. Read the dev server's stdout for whatever URL(s) it prints (Vite typically prints `Local:` and `Network:`; Next.js prints `started server on http://localhost:3000`; etc.) and forward all of them to the user verbatim. If the project does use Portless, follow the webui rules above.

## 6. Edge cases

- **User overrides via env (webui)**: Vite's `loadEnv()` reads `VITE_THEME_HEADER_COLOR` from `.env.development.local` and from the shell automatically. If the user already has it set, do not override — the user-set value wins. For `PORTLESS_APP_NAME`, the same rule applies: if it's already exported in the inherited env, treat the user-set value as authoritative.
- **User overrides via prompt**: if the user says "use a green header" or "no color this time" or "name the dev URL <foo>", honor their words over the conversation-history values.
- **Multiple Claude windows / worktrees**: each Claude Code session has its own conversation, so both color and app name are naturally session-scoped. Don't try to read either from disk — there's no shared state (built-in `/color` and `/rename` are in-memory only).
- **No `/color` in history but user mentioned a color**: treat the user's mention as the source of truth. If they said "use orange", map `orange` → `#EA580C` and prefix accordingly.

## 7. Out of scope

- Don't write any color file (`.claude/.fw-color`, `.env.development.local`, etc.). The env var prefix is the only side effect on env.
- Don't install deps, run lint, or do any other "while we're here" steps. Just start the server.
